---
locale: ru
---

# Medusa Paystack Browser Plugin

Medusa v2 plugin for Paystack with:

- a per-store admin widget for the Paystack publishable key
- a public config route for storefronts and mobile apps
- a hosted webview checkout route that loads Paystack InlineJS v2
- a frontend helper export for browser checkout
- an optional verified Medusa payment provider for installs that also configure a Paystack secret key

## Modes

### Helper mode

Helper mode only needs the Paystack publishable key.

It gives you:

- `store.metadata.paystack_publishable_key`
- `GET /store/paystack/config`
- `GET /store/paystack/webview`
- `medusa-paystack-plugin/frontend` helper functions

In helper mode, the browser `onSuccess(transaction)` callback is only a UX signal. The plugin does not mark a Medusa order as paid from the client callback alone.

### Verified mode

Verified mode uses the same browser checkout flow, but also registers the optional payment provider with a Paystack `secret_key`.

In verified mode:

- the browser success callback triggers `sdk.store.cart.complete(cart.id)`
- the provider verifies the Paystack transaction reference server-side
- Medusa only completes the cart when verification succeeds
- refunds use the stored Paystack transaction id

## Installation

```bash
npm install medusa-paystack-plugin
```

Register the plugin in your Medusa app:

```ts
module.exports = defineConfig({
  plugins: [
    {
      resolve: "medusa-paystack-plugin",
      options: {},
    },
  ],
})
```

If you want verified Medusa payment completion, also register the provider:

```ts
module.exports = defineConfig({
  plugins: [
    {
      resolve: "medusa-paystack-plugin",
      options: {
        secret_key: process.env.PAYSTACK_SECRET_KEY,
      },
    },
  ],
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "medusa-paystack-plugin/providers/paystack",
            id: "paystack",
            options: {
              secret_key: process.env.PAYSTACK_SECRET_KEY,
            },
          },
        ],
      },
    },
  ],
})
```

## Admin setup

After the plugin is installed, open the store details page in Medusa Admin. A `Paystack` widget is injected into `store.details.after`.

Save the store-specific publishable key there. The widget stores it in:

```ts
store.metadata.paystack_publishable_key
```

## Store routes

### `GET /store/paystack/config`

Returns:

```json
{
  "store_id": "store_123",
  "publishable_key": "pk_test_xxx",
  "verified_mode_enabled": true
}
```

If your Medusa installation has more than one store, pass `store_id`.

### `GET /store/paystack/webview`

Returns a minimal HTML page that loads Paystack InlineJS and starts checkout inside a mobile webview or popup-style browser window.

Supported query params:

- `store_id`
- `email`
- `amount`
- `currency`
- `reference`
- `callback_url`
- `metadata`
- `channels`
- `first_name`
- `last_name`
- `phone`

On success, cancel, or error the page:

- posts a message with source `medusa-paystack-webview`
- redirects to `callback_url` when provided

## Frontend helper

Import the helper:

```ts
import {
  buildPaystackReference,
  buildPaystackWebviewUrl,
  createPaystackSuccessHandler,
  fetchPaystackConfig,
  launchPaystackCheckout,
} from "medusa-paystack-plugin/frontend"
```

### Storefront checkout example

```ts
const config = await fetchPaystackConfig({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  storeId: "store_123",
})

const onSuccess = createPaystackSuccessHandler({
  mode: config.verified_mode_enabled ? "verified" : "helper",
  cartId: cart.id,
  sdk,
  redirectUrl: `${window.location.origin}/checkout/complete`,
})

await launchPaystackCheckout({
  key: config.publishable_key,
  email: cart.email!,
  amount: paymentSession.amount,
  currency: paymentSession.currency_code,
  reference:
    (paymentSession.data as { paystack_reference?: string })?.paystack_reference ??
    buildPaystackReference(),
  metadata: {
    cart_id: cart.id,
  },
  successHandler: onSuccess,
})
```

### Mobile webview example

```ts
const webviewUrl = buildPaystackWebviewUrl({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
  callbackUrl: "myapp://checkout/complete",
  currency: cart.currency_code,
  email: cart.email!,
  amount: cart.total,
  metadata: {
    cart_id: cart.id,
  },
  storeId: "store_123",
})
```

Load that URL in your mobile webview and listen for the `medusa-paystack-webview` message payload or the redirect to your callback URL.

## Development

```bash
npm run typecheck
npm test
npm run build
```

## Notes

- This package uses the Medusa v2 plugin scaffold and exports `./providers/paystack` plus `./frontend`.
- If `npm run build` fails because your local Medusa CLI install is incomplete, reinstall dependencies cleanly and rerun the build.
