---
locale: en
---

# medusa-mondialrelay




A **Medusa v2** fulfillment provider plugin for [Mondial Relay](https://www.mondialrelay.fr/) shipping services. Supports both Point Relais (pickup point) and Home Delivery options with real-time pricing via [@frontboi/mondial-relay](https://www.npmjs.com/package/@frontboi/mondial-relay).

## Features

- 🏪 **Point Relais** - Pickup point delivery with interactive selector
- 🏠 **Home Delivery** - Door-to-door delivery (+3€ surcharge)
- 💰 **Real Pricing** - Uses official Mondial Relay pricing via `@frontboi/mondial-relay`
- 🌍 **Multi-country** - FR, BE, LU, NL, ES, PT, DE, IT, AT
- 🏷️ **Label Generation** - PDF shipping label creation
- 📦 **Shipment Tracking** - Tracking number generation
- 🖨️ **Admin Widget** - Print labels directly from order details

## Requirements

- **Medusa v2.0+**
- **Node.js 18+**
- **Mondial Relay API credentials** (contact Mondial Relay for API access)

## Installation

```bash
npm install medusa-mondialrelay
```

## Configuration

### 1. Add the plugin to medusa-config.ts

```typescript
// medusa-config.ts
import { defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },

  // Register the plugin
  plugins: [
    {
      resolve: "medusa-mondialrelay",
      options: {},
    },
  ],

  // Configure the fulfillment module with the provider
  modules: [
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          // Default manual provider (optional)
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
          // Mondial Relay provider
          {
            resolve: "medusa-mondialrelay",
            id: "mondialrelay",
            options: {
              apiBaseUrl: process.env.MONDIAL_RELAY_API_BASE_URL,
              culture: process.env.MONDIAL_RELAY_CULTURE || "fr-FR",
              login: process.env.MONDIAL_RELAY_LOGIN,
              password: process.env.MONDIAL_RELAY_PASSWORD,
              customerId: process.env.MONDIAL_RELAY_CUSTOMER_ID,
              businessAddress: {
                title: "Mr",
                firstname: process.env.BUSINESS_FIRSTNAME,
                lastname: process.env.BUSINESS_LASTNAME,
                streetname: process.env.BUSINESS_STREET,
                countryCode: process.env.BUSINESS_COUNTRY || "FR",
                postCode: process.env.BUSINESS_POSTCODE,
                city: process.env.BUSINESS_CITY,
                addressAdd1: "",
                addressAdd2: "",
                mobileNo: process.env.BUSINESS_PHONE,
                email: process.env.BUSINESS_EMAIL,
                returnLocation: process.env.MONDIAL_RELAY_RETURN_LOCATION || "",
              },
              // Optional: Free shipping when cart total >= this amount (in euros)
              freeShippingThreshold: 50,
              // Optional: Which delivery types get free shipping ("all" | "pickup" | "home")
              freeShippingAppliesTo: "all",
            },
          },
        ],
      },
    },
  ],
})
```

> **Important**: You need to register the plugin in **both** `plugins` (for admin extensions) and `modules` (for the fulfillment provider).

### 2. Environment Variables

Create or update your `.env` file:

```env
# Mondial Relay API Credentials
MONDIAL_RELAY_LOGIN=your_login
MONDIAL_RELAY_PASSWORD=your_password
MONDIAL_RELAY_CUSTOMER_ID=your_customer_id
MONDIAL_RELAY_CULTURE=fr-FR
MONDIAL_RELAY_API_URL=https://api.mondialrelay.com/Web_Services.asmx

# Business Address (sender)
BUSINESS_FIRSTNAME=John
BUSINESS_LASTNAME=Doe
BUSINESS_STREET=123 Main Street
BUSINESS_POSTCODE=75001
BUSINESS_CITY=Paris
BUSINESS_COUNTRY=FR
BUSINESS_EMAIL=contact@yourstore.com
BUSINESS_PHONE=0612345678
```

### 3. Create Shipping Options

In the Medusa Admin, create shipping options:

#### Point Relais Option
1. Go to **Settings → Locations & Shipping**
2. Select your location and add a shipping option
3. Set:
   - **Name**: `Mondial Relay - Point Relais`
   - **Price Type**: `Calculated`
   - **Fulfillment Provider**: `mondialrelay-point-relais`

#### Home Delivery Option
1. Create another shipping option
2. Set:
   - **Name**: `Mondial Relay - Livraison à Domicile`
   - **Price Type**: `Calculated`
   - **Fulfillment Provider**: `mondialrelay-home-delivery`

> **Note**: The plugin automatically applies +3€ surcharge for home delivery options.

## Free Shipping

### Configuration

You can configure a cart total threshold above which shipping becomes free:

```typescript
// In medusa-config.ts, provider options:
options: {
  // ... other options
  freeShippingThreshold: 50, // Free shipping when cart >= 50€
  freeShippingAppliesTo: "all", // "all" | "pickup" | "home"
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `freeShippingThreshold` | `number` | `undefined` | Cart total (in euros) above which shipping is free |
| `freeShippingAppliesTo` | `"all" \| "pickup" \| "home"` | `"all"` | Which delivery types get free shipping |

### Free Shipping Modes

- **`"all"`** (default): Free shipping applies to both Point Relais and Home Delivery
- **`"pickup"`**: Free shipping only for Point Relais (Home Delivery still charged)
- **`"home"`**: Free shipping only for Home Delivery (Point Relais still charged)

### Examples

```typescript
// Free shipping for ALL delivery types when cart >= 50€
options: {
  freeShippingThreshold: 50,
  freeShippingAppliesTo: "all", // or omit (default)
}

// Free shipping ONLY for Point Relais when cart >= 50€
// Home delivery still has normal pricing
options: {
  freeShippingThreshold: 50,
  freeShippingAppliesTo: "pickup",
}

// Free shipping ONLY for Home Delivery when cart >= 100€
// Point Relais still has normal pricing
options: {
  freeShippingThreshold: 100,
  freeShippingAppliesTo: "home",
}
```

### Storefront Integration

Pass the cart total when setting the shipping method:

```typescript
await setShippingMethod({
  cartId: cart.id,
  shippingMethodId: selectedOptionId,
  data: {
    shipping_option_name: "Mondial Relay - Point Relais",
    cart_total: cart.total / 100, // Convert from cents to euros
    // ... other data
  }
})
```

When `cart_total >= freeShippingThreshold` and the delivery type matches `freeShippingAppliesTo`, the shipping cost will be **0€**.

## Pricing

### Real-time Pricing via @frontboi/mondial-relay

The plugin uses [`@frontboi/mondial-relay`](https://www.npmjs.com/package/@frontboi/mondial-relay) for official Mondial Relay pricing based on:
- **Package weight** (250g to 30kg)
- **Destination country** (FR, BE, LU, NL, ES, PT, DE, IT, AT)

### Home Delivery Surcharge

Home delivery options automatically add a **+3€ surcharge** to the base Point Relais price.

### Example Prices (France)

| Weight | Point Relais | Home Delivery |
|--------|--------------|---------------|
| 500g   | ~3.99€       | ~6.99€        |
| 1kg    | ~4.49€       | ~7.49€        |
| 2kg    | ~5.49€       | ~8.49€        |
| 5kg    | ~7.99€       | ~10.99€       |

> Prices are fetched in real-time from Mondial Relay's official pricing grid.

## Storefront Integration

### Point Relais Selector

For Point Relais delivery, integrate a pickup point selector. The plugin expects:

```typescript
await setShippingMethod({
  cartId: cart.id,
  shippingMethodId: selectedOptionId,
  data: {
    shipping_option_name: "Mondial Relay - Point Relais",
    parcel_shop_id: "020340",
    parcel_shop_name: "Relay Shop Name",
    parcel_shop_address: "123 Shop Street",
    parcel_shop_city: "Paris",
    parcel_shop_postcode: "75001",
  }
})
```

### Recommended: @frontboi/mondial-relay

```bash
npm install @frontboi/mondial-relay
```

```tsx
import { ParcelShopSelector } from "@frontboi/mondial-relay"

<ParcelShopSelector
  postalCode="75001"
  countryCode="FR"
  brandIdAPI={process.env.NEXT_PUBLIC_MONDIAL_RELAY_BRAND_ID}
  onParcelShopSelected={(shop) => {
    // Handle selection
  }}
/>
```

### Home Delivery

```typescript
await setShippingMethod({
  cartId: cart.id,
  shippingMethodId: selectedOptionId,
  data: {
    shipping_option_name: "Mondial Relay - Livraison à Domicile",
  }
})
```

## Admin Features

### Label Printing Widget

The plugin adds a widget to the order details page for:
- ✅ Tracking number display
- ✅ Pickup point info (if applicable)
- 🖨️ "Print Label" button for PDF download

## Supported Countries

| Code | Country |
|------|---------|
| FR | France |
| BE | Belgium |
| LU | Luxembourg |
| NL | Netherlands |
| ES | Spain |
| PT | Portugal |
| DE | Germany |
| IT | Italy |
| AT | Austria |

## License

MIT © [Théo Daguier](https://github.com/theodaguier)

## Links

- � [NPM Package](https://www.npmjs.com/package/medusa-mondialrelay)
- � [GitHub Repository](https://github.com/theodaguier/medusa-mondialrelay)
- 📧 Contact: theo.daguier@icloud.com
