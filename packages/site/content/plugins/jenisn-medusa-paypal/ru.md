---
locale: ru
---

# 📝 PayPal Plugin for Medusa




The Alphabite PayPal Plugin integrates PayPal payment processing into your Medusa store. It handles various payment flows, including capturing payments, managing refunds, and ensuring robust error handling.

---

## 📚 Table of Contents

- [🎯 Core Features](#-core-features)
- [🧱 Compatibility](#-compatibility)
- [🛠 Common Use Cases](#-common-use-cases)
- [📦 Installation](#-installation)
- [⚙️ Plugin Options](#-plugin-options)
- [📖 Documentation](#-documentation)

---

## 🎯 Core Features

- ✅ Seamless PayPal payment integration
- 🔄 Handles various PayPal error states
- 💰 Supports refunds directly from Medusa Admin
- 🛒 Creates new order IDs for each payment attempt within the same payment intent
- 📦 Optional inclusion of shipping and customer data in PayPal orders

---

## 🧱 Compatibility

- **Backend:** Medusa v2+
- **Frontend:** Framework-agnostic (integrates with PayPal's SDK)
- **Admin:** Refund functionality integrated into Medusa Admin

---

## 🛠 Common Use Cases

- Accepting PayPal payments for products and services
- Managing payment captures and refunds efficiently
- Ensuring robust payment processing with comprehensive error handling

---

## 📖 Documentation

For complete documentation, visit our [PayPal Plugin Documentation](https://medusa-docs.alphabite.io/docs/category/paypal).

---

---

# 📦 Installation

This guide walks you through installing and configuring the Alphabite PayPal Plugin in your Medusa backend.

---

## 1. Install the Plugin

Install the package via npm:

```bash
npm install @alphabite/medusa-paypal
```

---

## 2. Register the Plugin

Add the plugin to your `medusa.config.ts` or `medusa-config.js`:

```ts
{
  plugins: [
    {
      resolve: "@alphabite/medusa-paypal",
      options: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        isSandbox: process.env.PAYPAL_IS_SANDBOX === "true",
        webhookId: process.env.PAYPAL_WEBHOOK_ID,
        includeShippingData: false,
        includeCustomerData: false,
      },
    },
  ],
};
```

---

## ⚙️ Plugin Options

The following options can be passed to the PayPal plugin in your `medusa-config.js` or `medusa.config.ts` file:

| Option                | Type      | Default | Description                                                                                     |
| --------------------- | --------- | ------- | ----------------------------------------------------------------------------------------------- |
| `clientId`            | `string`  |         | Required. Your PayPal API client ID.                                                            |
| `clientSecret`        | `string`  |         | Required. Your PayPal API client secret.                                                        |
| `isSandbox`           | `boolean` | `true`  | Whether to use the PayPal Sandbox environment for testing.                                      |
| `webhookId`           | `string`  |         | Optional. Your PayPal webhook ID. If provided, enables confirmation of payment captures.        |
| `includeShippingData` | `boolean` | `false` | Optional. If `true`, shipping data from the storefront order will be added to the PayPal order. |
| `includeCustomerData` | `boolean` | `false` | Optional. If `true`, customer data from the storefront order will be added to the PayPal order. |

---

## ✅ Compatibility

- Requires **Medusa v2**
- Compatible with both JS and TypeScript projects

---

## 🚀 Next Steps

👉 [Configuration Guide](https://medusa-docs.alphabite.io/docs/category/paypal)
👉 [Join our Discord Community](https://discord.gg/ZgBCYTMaVQ) for faster support
