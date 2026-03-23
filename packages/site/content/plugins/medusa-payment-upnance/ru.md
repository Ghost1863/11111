---
locale: ru
---

<p align="center">
  <a href="https://www.medusajs.com">
    <img src="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg" height="120" alt="Medusa logo" />
  </a>
</p>

<h1 align="center">
medusa-payment-upnance
</h1>

<p align="center">
An official Medusa plugin to integrate <strong>Upnance</strong> payments for seamless checkout experiences.
</p>

<p align="center">
  <a href="https://medusajs.com">
    <img src="https://img.shields.io/badge/Medusa-^2.7.1-blue?logo=medusa" alt="Medusa Version" />
  </a>
</p>

---

## 🧾 Overview

`medusa-payment-upnance` is a Medusa payment plugin that connects your store to the Upnance payment gateway. It allows customers to complete secure checkouts via embedded iframes using Upnance's modern payment infrastructure.

---

## 🚀 Features

- Embedded iframe checkout
- Full Medusa v2 compatibility
- Secure event-driven post-payment handling
- Simple configuration and setup

---

## 📦 Installation

From the root of your Medusa project:

```bash
yarn add medusa-payment-upnance

# or

npm install medusa-payment-upnance
```

## ⚙️ Configuration

Update your medusa-config.js to include the Upnance provider:

```ts
const { defineConfig } = require("@medusajs/medusa");

module.exports = defineConfig({
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "medusa-payment-upnance/providers/upnance",
            id: "upnance",
            options: {
              apiKey: process.env.UPNANCE_API_KEY,
              accountId: process.env.UPNANCE_ACCOUNT_ID,
              environment: "staging | production",
              /**
               * Use this flag to capture payment immediately (default is false)
               */
              autoCapture: false
            },
          },
        ],
      },
    },
  ],
});
```

Then add the required environment variables to your .env file:
```bash
UPNANCE_API_KEY=your_upnance_api_key
UPNANCE_ACCOUNT_ID=your_account_id
```

## 🛒 Storefront Integration

Embed the Upnance checkout in your storefront using the following React example component:

```tsx
const UpnanceWindow = ({ transactionId }: { transactionId: string }) => {
  const SANDBOX_PERMISSIONS =
    "allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation";
  const ALLOW_PERMISSIONS =
    "geolocation *;camera *;payment *;clipboard-read *;clipboard-write *;autoplay *;microphone *;fullscreen *;accelerometer *;magnetometer *;gyroscope *;picture-in-picture *;otp-credentials *;";

  const onPaymentCompleted = async () => {
    return placeOrder(); // Finalize order after payment
  };

  React.useEffect(() => {
    const listener = async (ev: MessageEvent) => {
      if (ev.data.type === "CHECKOUT_COMPLETE_EVENT") {
        await onPaymentCompleted();
      }
    };

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  }, []);

  return (
    <div style={{ height: "700px", width: "100%" }}>
      <iframe
        sandbox={SANDBOX_PERMISSIONS}
        allow={ALLOW_PERMISSIONS}
        width="100%"
        height="100%"
        src={`https://checkout.staging.upnance.com/checkout/${transactionId}`}
      />
    </div>
  );
};
```
#### Replace checkout.staging.upnance.com with checkout.upnance.com when deploying live.
