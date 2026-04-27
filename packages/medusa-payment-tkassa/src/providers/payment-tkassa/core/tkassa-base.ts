import {
  AbstractPaymentProvider,
  PaymentSessionStatus,
  PaymentActions,
  isDefined
} from "@medusajs/framework/utils"
import {
  InitiatePaymentInput, InitiatePaymentOutput,
  CapturePaymentInput, CapturePaymentOutput,
  RefundPaymentInput, RefundPaymentOutput,
  CancelPaymentInput, CancelPaymentOutput,
  RetrievePaymentInput, RetrievePaymentOutput,
  GetPaymentStatusInput, GetPaymentStatusOutput,
  ProviderWebhookPayload, WebhookActionResult, Logger,
  AuthorizePaymentInput, AuthorizePaymentOutput,
  DeletePaymentInput, DeletePaymentOutput,
  UpdatePaymentInput, UpdatePaymentOutput,
} from "@medusajs/framework/types"
import crypto from "crypto"
import { TKassa } from "t-kassa-api"
import { components } from "t-kassa-api/openapi"
import {
  FfdVersions,
  Payment,
  PaymentStatuses,
  PaymentStatusesMap,
  Taxations,
  TaxItem,
  TaxShipping,
  TKassaOptions,
  TkassaEvent,
} from "../types"
import {
  generateReceipt,
  generateRefundReceipt,
  getAmountFromSmallestUnit,
  getSmallestUnit,
} from "../utils"

abstract class TkassaBase extends AbstractPaymentProvider<TKassaOptions> {
  static identifier = "tkassa"
  protected serverUrl_ = "https://securepay.tinkoff.ru"
  protected options_: TKassaOptions
  protected client_: TKassa
  protected logger_: Logger

  protected async trackAnalyticsEvent(
    event: string,
    properties: Record<string, unknown> = {}
  ): Promise<void> {
    const analytics = this.container.analytics as
      | { track?: (data: { event: string; properties?: Record<string, unknown> }) => Promise<void> }
      | undefined

    if (!analytics?.track) {
      return
    }

    try {
      await analytics.track({
        event,
        properties,
      })
    } catch (error) {
      this.logger_.debug(
        `TkassaBase.trackAnalyticsEvent failed for ${event}: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  static validateOptions(options: TKassaOptions): void {
    if (!isDefined(options.terminalKey)) {
      throw new Error("Required option `terminalKey` is missing in T-Kassa provider")
    }
    if (!isDefined(options.password)) {
      throw new Error("Required option `password` is missing in T-Kassa provider")
    }
    if (isDefined(options.useReceipt)) {
      if (!isDefined(options.taxation)) {
        throw new Error("Required option `taxation` is missing in T-Kassa provider")
      } else if (!Taxations.includes(options.taxation)) {
        throw new Error(`Invalid option \`taxation\` provided in T-Kassa provider. Valid values are: ${Taxations.join(", ")}`)
      }
      if (!isDefined(options.taxItemDefault)) {
        throw new Error("Required option `taxItemDefault` is missing in T-Kassa provider")
      } else if (!TaxItem.includes(options.taxItemDefault)) {
        throw new Error(`Invalid option \`taxItemDefault\` provided in T-Kassa provider. Valid values are: ${TaxItem.join(", ")}`)
      }
      if (!isDefined(options.taxShippingDefault)) {
        throw new Error("Required option `taxShippingDefault` is missing in T-Kassa provider")
      } else if (!TaxShipping.includes(options.taxShippingDefault)) {
        throw new Error(`Invalid option \`taxShippingDefault\` provided in T-Kassa provider. Valid values are: ${TaxShipping.join(", ")}`)
      }
      if (!isDefined(options.ffdVersion)) {
        throw new Error("Required option `ffdVersion` is missing in T-Kassa provider")
      } else if (!FfdVersions.includes(options.ffdVersion)) {
        throw new Error(`Invalid option \`ffdVersion\` provided in T-Kassa provider. Valid values are: ${FfdVersions.join(", ")}`)
      }
    }
  }

  constructor(container: { logger: Logger }, options: TKassaOptions) {
    super(container, options)
    this.options_ = options
    this.logger_ = container.logger
    this.client_ = new TKassa(options.terminalKey, options.password, { server: this.serverUrl_ })
  }

  private normalizePaymentParameters(
    extra?: Record<string, unknown>
  ): Partial<Payment> {
    const res = {} as Partial<Payment>

    if (extra?.SuccessURL)
      res.SuccessURL = extra?.SuccessURL as Payment["SuccessURL"]

    if (extra?.FailURL)
      res.FailURL = extra?.FailURL as Payment["FailURL"]

    if (extra?.PayType) {
      res.PayType = extra.PayType as Payment["PayType"]
    } else {
      if (this.options_.capture !== undefined) {
        res.PayType = this.options_.capture ? "O" : "T"
      } else {
        res.PayType = "O"
      }
    }

    return res
  }

  /**
   * Initiate a new payment.
   */
  async initiatePayment({
    currency_code,
    amount,
    data,
    context,
  }: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    this.logger_.debug("TkassaBase.initiatePayment input:\n" + JSON.stringify({ currency_code, amount, data, context }, null, 2))

    const additionalParameters = this.normalizePaymentParameters(data)
    const cart = data?.cart as Record<string, any>

    let receipt = {} as components["schemas"]["Receipt_FFD_105"] | components["schemas"]["Receipt_FFD_12"]

    try {
      // Get receipt data
      if (this.options_.useReceipt && cart) {
        receipt = generateReceipt(
          this.options_.ffdVersion!,
          this.options_.taxation!,
          this.options_.taxItemDefault!,
          this.options_.taxShippingDefault!,
          cart
        )
      }

      // Init Payment
      const initPaymentParams = {
        TerminalKey: this.options_.terminalKey,
        Password: this.options_.password,
        Amount: getSmallestUnit(amount, currency_code),
        OrderId: data?.session_id as string,
        ...additionalParameters,
        ...(this.options_.useReceipt ? { Receipt: receipt } : {}),
      }
      this.logger_.debug("TkassaBase.initiatePayment initParams:\n" + JSON.stringify(initPaymentParams, null, 2))

      const response = await this.client_.init(initPaymentParams)
      const paymentId = String(response.PaymentId)

      const output = { id: paymentId, data: { ...response, receipt } }
      this.logger_.debug("TkassaBase.initiatePayment output:\n" + JSON.stringify(output, null, 2))
      await this.trackAnalyticsEvent("tkassa.payment.initiated", {
        payment_id: paymentId,
        order_id: data?.session_id,
        amount,
        currency_code,
        pay_type: initPaymentParams.PayType,
        capture: this.options_.capture ?? true,
        has_receipt: Boolean(this.options_.useReceipt),
      })
      return output
    } catch (e) {
      await this.trackAnalyticsEvent("tkassa.payment.initiation_failed", {
        order_id: data?.session_id,
        amount,
        currency_code,
        error_message: e instanceof Error ? e.message : String(e),
      })
      throw this.buildError("An error occurred in initiatePayment", e)
    }
  }

  /**
   * Capture an existing payment.
   */
  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    this.logger_.debug(`TkassaBase.capturePayment input:\n${JSON.stringify(input, null, 2)}`)

    const paymentId = input.data?.PaymentId as string

    try {
      const response = await this.client_.confirm({
        TerminalKey: this.options_.terminalKey,
        Password: this.options_.password,
        PaymentId: paymentId
      })

      const output = { data: { ...response, receipt: input.data?.receipt } }
      this.logger_.debug("TkassaBase.capturePayment output:\n" + JSON.stringify(output, null, 2))
      await this.trackAnalyticsEvent("tkassa.payment.captured", {
        payment_id: paymentId,
        order_id: input.data?.OrderId,
        amount: input.amount,
      })
      return output
    } catch (e) {
      await this.trackAnalyticsEvent("tkassa.payment.capture_failed", {
        payment_id: paymentId,
        order_id: input.data?.OrderId,
        error_message: e instanceof Error ? e.message : String(e),
      })
      throw this.buildError("An error occurred in capturePaymentt", e)
    }
  }

  /**
   * Authorize a payment by retrieving its status.
   */
  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    this.logger_.debug(`TkassaBase.authorizePayment input:\n${JSON.stringify(input, null, 2)}`)

    const output = await this.getPaymentStatus(input)
    this.logger_.debug("TkassaBase.authorizePayment output:\n" + JSON.stringify(output, null, 2))
    await this.trackAnalyticsEvent("tkassa.payment.authorized", {
      payment_id: input.data?.PaymentId,
      order_id: input.data?.OrderId,
      status: output.status,
    })
    return output
  }

  /**
   * Delete a payment.
   * Payment delete is not supported by T-Kassa.
   */
  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    this.logger_.debug(`TkassaBase.deletePayment input:\n${JSON.stringify(input, null, 2)}`)

    const output = input
    this.logger_.debug("TkassaBase.deletePayment output:\n" + JSON.stringify(output, null, 2))
    return output
  }

  /**
   * Update a payment.
   * Payment update is not supported by T-Kassa.
   */
  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    this.logger_.debug(`TkassaBase.updatePayment input:\n${JSON.stringify(input, null, 2)}`)


    const output = input
    this.logger_.debug("TkassaBase.updatePayment output:\n" + JSON.stringify(output, null, 2))
    return output
  }

  /**
   * Refund a payment.
   */
  async refundPayment({
    amount,
    data,
  }: RefundPaymentInput): Promise<RefundPaymentOutput> {
    this.logger_.debug(`TkassaBase.refundPayment input:\n${JSON.stringify({ amount, data }, null, 2)}`)

    const paymentId = data?.PaymentId as string
    const amountValue = typeof amount === 'object' && 'value' in amount
      ? amount.value
      : typeof amount === 'string' || typeof amount === 'number'
        ? amount
        : ""
    const receipt = generateRefundReceipt(
      amount,
      data?.OrderId as string,
      data?.receipt as components["schemas"]["Receipt_FFD_105"] | components["schemas"]["Receipt_FFD_12"]
    )
    try {
      const response = await this.client_.cancel({
        TerminalKey: this.options_.terminalKey,
        Password: this.options_.password,
        PaymentId: paymentId,
        ...(getSmallestUnit(amount, 'RUB') !== data?.amount ? {Receipt: receipt} : {}), // TODO: to remove hardcoded currency?
        ...(amountValue
          ? { Amount: getSmallestUnit(Number(amountValue), 'RUB') } // TODO: to remove hardcoded currency?
          : {})
      })

      const output = { data: { ...response, receipt: data?.receipt } }
      this.logger_.debug("TkassaBase.refundPayment output:\n" + JSON.stringify(output, null, 2))
      await this.trackAnalyticsEvent("tkassa.payment.refunded", {
        payment_id: paymentId,
        order_id: data?.OrderId,
        amount: amountValue || amount,
      })
      return output
    } catch (e) {
      await this.trackAnalyticsEvent("tkassa.payment.refund_failed", {
        payment_id: paymentId,
        order_id: data?.OrderId,
        amount: amountValue || amount,
        error_message: e instanceof Error ? e.message : String(e),
      })
      throw this.buildError("An error occurred in refundPayment", e)
    }
  }

  /**
   * Cancel an existing payment.
   */
  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    this.logger_.debug(`TkassaBase.cancelPayment input:\n${JSON.stringify(input, null, 2)}`)

    const paymentId = input.data?.PaymentId as string

    try {
      const response = await this.client_.cancel({
        TerminalKey: this.options_.terminalKey,
        Password: this.options_.password,
        PaymentId: paymentId
      })

      const output = { data: { ...response, receipt: input.data?.receipt } }
      this.logger_.debug("TkassaBase.cancelPayment output:\n" + JSON.stringify(output, null, 2))
      await this.trackAnalyticsEvent("tkassa.payment.canceled", {
        payment_id: paymentId,
        order_id: input.data?.OrderId,
      })
      return output
    } catch (e) {
      await this.trackAnalyticsEvent("tkassa.payment.cancel_failed", {
        payment_id: paymentId,
        order_id: input.data?.OrderId,
        error_message: e instanceof Error ? e.message : String(e),
      })
      throw this.buildError("An error occurred in cancelPayment", e)
    }
  }

  /**
   * Retrieve a payment.
   */
  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    this.logger_.debug(`TkassaBase.retrievePayment input:\n${JSON.stringify(input, null, 2)}`)

    const paymentId = input.data?.PaymentId as string

    try {
      const response = await this.client_.getState({
        TerminalKey: this.options_.terminalKey,
        Password: this.options_.password,
        PaymentId: paymentId
      })

      const output = { data: { ...response, receipt: input.data?.receipt } }
      this.logger_.debug("TkassaBase.retrievePayment output:\n" + JSON.stringify(output, null, 2))
      await this.trackAnalyticsEvent("tkassa.payment.retrieved", {
        payment_id: paymentId,
        order_id: input.data?.OrderId,
      })
      return output
    } catch (e) {
      await this.trackAnalyticsEvent("tkassa.payment.retrieve_failed", {
        payment_id: paymentId,
        order_id: input.data?.OrderId,
        error_message: e instanceof Error ? e.message : String(e),
      })
      throw this.buildError("An error occurred in retrievePayment", e)
    }
  }

  /**
   * Retrieve payment status and map it to Medusa status.
   */
  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    this.logger_.debug(
      `TkassaProvider.getPaymentStatus input:\n${JSON.stringify(input, null, 2)}`
    )

    const paymentId = input.data?.PaymentId
    if (!paymentId || typeof paymentId !== 'string') {
      throw this.buildError(
        "No payment ID provided while getting payment status",
        new Error("No payment ID provided")
      )
    }

    try {
      const response = await this.client_.getState({
        TerminalKey: this.options_.terminalKey,
        Password: this.options_.password,
        PaymentId: paymentId,
      })

      const status = response.Status as keyof typeof PaymentStatuses

      const output = {
        status: PaymentStatusesMap[status] ?? PaymentSessionStatus.ERROR,
        data: { ...response as unknown as Record<string, unknown>, receipt: input.data?.receipt },
      }
      this.logger_.debug("TkassaBase.getPaymentStatus output:\n" + JSON.stringify(output, null, 2))
      await this.trackAnalyticsEvent("tkassa.payment.status_checked", {
        payment_id: paymentId,
        order_id: input.data?.OrderId,
        tkassa_status: response.Status,
        medusa_status: output.status,
      })
      return output
    } catch (e: any) {
      throw this.buildError("An error occurred in getPaymentStatus", e)
    }
  }


  async getWebhookActionAndData(webhookData: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    this.logger_.debug(
      `TkassaProvider.getWebhookActionAndData payload:\n${JSON.stringify(webhookData, null, 2)}`
    )

    const isValid = await this.isWebhookEventValid(webhookData)
    const data = webhookData.data as unknown as TkassaEvent
    if (!isValid) {
      await this.trackAnalyticsEvent("tkassa.webhook.rejected", {
        order_id: data?.OrderId,
        payment_id: data?.PaymentId,
        status: data?.Status,
      })
      return {
        action: PaymentActions.NOT_SUPPORTED
      }
    }

    const result = {
      action: PaymentStatusesMap[PaymentStatuses[data.Status]] ?? PaymentSessionStatus.ERROR,
      data: {
        session_id: data.OrderId,
        amount: getAmountFromSmallestUnit(data.Amount, "RUB") // TODO: to remove hardcoded currency?
      }
    }
    this.logger_.debug("TkassaBase.getWebhookActionAndData result:\n" + JSON.stringify(result, null, 2))
    await this.trackAnalyticsEvent("tkassa.webhook.accepted", {
      order_id: data.OrderId,
      payment_id: data.PaymentId,
      status: data.Status,
      action: result.action,
      amount: result.data.amount,
    })
    return result
  }

  protected async isWebhookEventValid(payload: ProviderWebhookPayload["payload"]): Promise<boolean> {
    const data = payload.data as unknown as TkassaEvent

    if (!data || !data.Status || !data.OrderId || !data.Amount) {
      return false
    }

    const incomingToken = data.Token
    const requiredKeys = [
      "TerminalKey", "OrderId", "Success", "Status", "PaymentId",
      "ErrorCode", "Amount", "CardId", "Pan", "ExpDate"
    ]

    const params: Record<string, string> = {}

    for (const key of requiredKeys) {
      const value = data[key]
      params[key] = String(value)
    }
    params["Password"] = this.options_.password
    const sortedKeys = Object.keys(params).sort()
    let concat = ""
    for (const key of sortedKeys) {
      concat += params[key]
    }
    const hash = crypto.createHash("sha256").update(concat).digest("hex")
    const valid = incomingToken === hash
    return valid
  }
  /**
   * Helper to build errors with additional context.
   */
  protected buildError(message: string, error: Error): Error {
    const errorDetails =
      "raw" in error ? (error.raw as any) : error

    return new Error(
      `${message}: ${error.message}. ${"detail" in errorDetails ? errorDetails.detail : ""
        }`.trim()
    )
  }
}

export default TkassaBase
