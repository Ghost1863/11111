---
locale: ru
---

# medusa-colissimo



Colissimo fulfillment provider for MedusaJS v2.

## Supported Delivery Options

| Option ID | Product Code | Description |
|-----------|--------------|-------------|
| `colissimo-domicile` | `DOM` | Home delivery |
| `colissimo-domicile-signature` | `DOS` | Home delivery with signature |
| `colissimo-relay-point` | `A2P` | Relay point delivery |
| `colissimo-return` | `CORE` | Return shipment (optional) |

## Installation

```bash
pnpm add medusa-colissimo
```

## Configuration

### Environment Variables

```env
COLISSIMO_CONTRACT_NUMBER=your_contract_number
COLISSIMO_PASSWORD=your_password

BUSINESS_NAME="Your Company"
BUSINESS_STREET="123 Rue Example"
BUSINESS_CITY="Paris"
BUSINESS_POSTCODE="75001"
```

Get your credentials from [Colissimo Box](https://www.colissimo.fr/entreprise).

### Medusa Config

```typescript
// medusa-config.ts
module.exports = defineConfig({
  // Register plugin for API routes and admin extensions
  plugins: [
    {
      resolve: "medusa-colissimo",
      options: {},
    },
  ],
  // Register fulfillment provider
  modules: [
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "medusa-colissimo/providers/colissimo",
            id: "colissimo",
            options: {
              contractNumber: process.env.COLISSIMO_CONTRACT_NUMBER,
              password: process.env.COLISSIMO_PASSWORD,
              businessAddress: {
                companyName: process.env.BUSINESS_NAME,
                line2: process.env.BUSINESS_STREET,
                city: process.env.BUSINESS_CITY,
                zipCode: process.env.BUSINESS_POSTCODE,
                countryCode: "FR",
              },
              // Optional
              enableReturns: true,
              enableCalculatedPricing: true,
              pricingTable: {
                DOM: {
                  FR: [
                    { maxWeight: 0.25, price: 495 },
                    { maxWeight: 0.5, price: 615 },
                    { maxWeight: 1, price: 715 },
                    { maxWeight: 2, price: 815 },
                    { maxWeight: 5, price: 1095 },
                    { maxWeight: 10, price: 1595 },
                    { maxWeight: 30, price: 2295 },
                  ],
                },
                // Add DOS, A2P pricing as needed
              },
            },
          },
        ],
      },
    },
  ],
});
```

## Admin Widgets

Two widgets are included for the order details page:

**Fulfillment Form** (sidebar) - Select items, set weight manually if needed, create fulfillment.

**Fulfillment Display** (after details) - Shows tracking number, delivery type, download/print label buttons.

### Manual Weight

Products should have weights defined on their variants (in grams). If not, or if you need to override after weighing the package, check "Saisir le poids manuellement" and enter the weight in grams.

## API Endpoints

### Widget Token

```
GET /store/colissimo/widget-token
```

Returns a token for the Colissimo frontend widget (valid 30 minutes).

### Search Relay Points

```
POST /store/colissimo/relay-points

{
  "zipCode": "75001",
  "city": "Paris",
  "countryCode": "FR"
}
```

### Get Relay Point

```
GET /store/colissimo/relay-points/:id?zipCode=75001
```

## Frontend Integration

For relay point delivery, store the selected point ID in the shipping address metadata:

```typescript
await medusa.carts.update(cartId, {
  shipping_address: {
    // ... address fields
    metadata: {
      relay_point_id: selectedPoint.id,
    },
  },
});
```

### Colissimo Widget

You can use the official Colissimo widget for relay point selection:

```javascript
// Get token from your backend
const { token } = await fetch('/store/colissimo/widget-token').then(r => r.json());

// Initialize widget (requires jQuery and Mapbox GL)
$('#widget-container').frameColissimoOpen({
  URLColissimo: 'https://ws.colissimo.fr',
  callBackFrame: 'onPointSelected',
  ceCountry: 'FR',
  ceZipCode: customerZipCode,
  ceTown: customerCity,
  token: token
});

function onPointSelected(point) {
  // point.identifiant is the relay point ID
  $('#widget-container').frameColissimoClose();
}
```

## Limitations

- Label cancellation is not supported by Colissimo API. Cancel manually in Colissimo Box.
- Max weight: 30kg
- Optimized for France. International shipping may need additional setup.

## Development

```bash
pnpm install
pnpm build
pnpm test
```

## License

MIT
