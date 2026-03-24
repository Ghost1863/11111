---
locale: ru
---

<p align="center">
  <a href="https://nova.money">
    <img alt="Nova.Pay Logo" src="https://cdn.prod.website-files.com/67251f904799de91471deedf/672a520f1ab460471ae0969c_logo-purple.svg" width="200">
  </a>
</p>

<h1 align="center">
  Nova.Pay Medusa Plugin
</h1>

<p align="center">
  A <a href="https://www.medusajs.com">Medusa V2</a> plugin to integrate <a href="https://nova.money">Nova.Pay</a> into your store.
</p>

<p align="center">
  <a href="https://github.com/coyosoftware/nova-pay-medusa-plugin/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License MIT" />
  </a>
</p>

## Features

- **Payment Providers**:
  - Credit Card (`nova-pay-credit-card`)
  - Pix (`nova-pay-pix`)
  - Boleto (`nova-pay-bank-slip`)
- **Product Sync**: Automatically syncs products to Nova.Pay whenever a product is created or updated in Medusa.

## Installation

Install the package via npm or yarn:

```bash
npm install @novamoney/nova-pay
# or
yarn add @novamoney/nova-pay
```

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
NOVA_PAY_API_KEY=your_api_key_here
NOVA_PAY_CART_PAGE_ID=your_cart_page_uuid_here
NOVA_PAY_SUBDOMAIN=your_nova_pay_subdomain_here
NOVA_PAY_VERBOSE=true      # Optional: enables sync logging
```

### Medusa Config

Enable the plugin in your `medusa-config.ts` file:

```typescript
// medusa-config.ts

module.exports = defineConfig({
  // ...
  plugins: [
    // ... other plugins
    {
      resolve: "@novamoney/nova-pay",
      options: {
        apiKey: process.env.NOVA_PAY_API_KEY,
        subdomain: process.env.NOVA_PAY_SUBDOMAIN
      },
    },
  ],
  // ...
  modules: [
    // ... other modules
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@novamoney/nova-pay/providers/payment",
            id: "nova-pay",
            options: {
              apiKey: process.env.NOVA_PAY_API_KEY,
              cartPageId: process.env.NOVA_PAY_CART_PAGE_ID,
              subdomain: process.env.NOVA_PAY_SUBDOMAIN
            }
          },
        ]
      }
    }
  ]
});
```

## Client-side Integration

When you initiate a payment using one of the Nova.Pay providers, the response will include a `link` in the `data` object of the payment session. You must redirect the customer to this URL to complete the payment.

### Example (Next.js Storefront)

```typescript
const handlePayment = async (paymentSession) => {
  if (paymentSession.data.link) {
    // Redirect to Nova.Pay checkout
    window.location.href = paymentSession.data.link;
  }
};
```

## License

Licensed under the [MIT License](LICENSE).
