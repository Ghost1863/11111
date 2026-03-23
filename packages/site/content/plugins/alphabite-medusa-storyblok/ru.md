---
locale: ru
---

# Medusa Storyblok Plugin






A powerful plugin that seamlessly syncs your Medusa products with Storyblok, enabling headless content management for your e-commerce product catalog.

> 💬 **Need Help?** Join our [Discord community](https://discord.gg/nTBp48CBRq) for support, questions, and discussions!

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Add Plugin to Medusa Config](#1-add-plugin-to-medusa-config)
  - [Environment Variables](#2-environment-variables)
  - [Configuration Options](#configuration-options)
  - [Why Two Access Tokens?](#why-two-access-tokens)
- [Storyblok Setup](#storyblok-setup)
  - [Create a Products Folder](#1-create-a-products-folder)
  - [Create Required Bloks](#2-create-required-bloks)
  - [Configure Webhooks](#3-configure-webhooks-optional-but-recommended)
- [Admin UI](#admin-ui)
  - [Product Page Widget](#product-page-widget)
  - [Storyblok Management Page](#storyblok-management-page)
- [How It Works](#how-it-works)
  - [Medusa → Storyblok Sync](#medusa--storyblok-sync)
  - [Storyblok → Medusa Sync](#storyblok--medusa-sync)
- [Image Management](#image-management)
  - [Smart Deduplication](#smart-deduplication)
  - [Folder Organization](#folder-organization)
  - [Image Optimization](#image-optimization)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Features

- ✅ **Automatic Product Sync**: Products created in Medusa are automatically synced to Storyblok
- ✅ **Image Management**: Product and variant images are automatically uploaded to Storyblok with smart deduplication
- ✅ **Bi-directional Sync**: Content updates in Storyblok sync back to Medusa via webhooks
- ✅ **Variant Support**: Full support for product variants with individual image galleries
- ✅ **Asset Organization**: Creates dedicated folders for each product's assets
- ✅ **Bulk Sync**: Sync multiple products or your entire catalog at once
- ✅ **Cleanup**: Automatically removes assets and folders when products are deleted
- ✅ **Image Optimization**: Built-in image optimization with configurable quality and dimensions

## Installation

```bash
yarn add @alphabite/medusa-storyblok
```

## Configuration

### 1. Add Plugin to Medusa Config

In your `medusa-config.js` or `medusa-config.ts`, add the plugin to the `plugins` array:

```typescript
import { AlphabiteStoryblokPluginOptions } from "@alphabite/medusa-storyblok";

plugins: {
  [
    // ... other plugins
    {
      resolve: "@alphabite/medusa-storyblok",
      options: {
        accessToken: process.env.STORYBLOK_ACCESS_TOKEN,
        region: process.env.STORYBLOK_REGION, // "eu" or "us"
        personalAccessToken: process.env.STORYBLOK_PAT,
        spaceId: process.env.STORYBLOK_SPACE_ID,
        productsParentFolderId: process.env.STORYBLOK_PRODUCTS_PARENT_FOLDER_ID,
        productsParentFolderName: "products",
        deleteProductOnSbProductStoryDelete: false,
        webhookSecret: process.env.STORYBLOK_WEBHOOK_SECRET,
        imageOptimization: {
          quality: 80,
          width: 800,
        },
      } satisfies AlphabiteStoryblokPluginOptions,
    },
  ];
}
```

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Storyblok Access Token (Content Delivery API - read-only)
STORYBLOK_ACCESS_TOKEN=your_access_token

# Storyblok Personal Access Token (Management API - write access)
STORYBLOK_PAT=your_personal_access_token

# Storyblok Space ID
STORYBLOK_SPACE_ID=your_space_id

# Storyblok Region (eu or us)
STORYBLOK_REGION=eu

# Parent Folder ID where product stories will be created
STORYBLOK_PRODUCTS_PARENT_FOLDER_ID=your_folder_id

# Optional: Webhook secret for validating Storyblok webhooks
STORYBLOK_WEBHOOK_SECRET=your_webhook_secret
```

## Configuration Options

| Option                                | Type                     | Required | Default   | Description                                                 |
| ------------------------------------- | ------------------------ | -------- | --------- | ----------------------------------------------------------- |
| `accessToken`                         | `string`                 | ✅       | -         | Storyblok Access Token for Content Delivery API (read-only) |
| `personalAccessToken`                 | `string`                 | ✅       | -         | Personal Access Token for Management API (write access)     |
| `spaceId`                             | `string`                 | ✅       | -         | Your Storyblok Space ID                                     |
| `region`                              | `"eu" \| "us"`           | ✅       | -         | Storyblok region of your space                              |
| `productsParentFolderId`              | `string`                 | ✅       | -         | Folder ID where product stories will be created             |
| `productsParentFolderName`            | `string`                 | ✅       | -         | Folder name (usually "products")                            |
| `version`                             | `"draft" \| "published"` | ❌       | `"draft"` | Version of stories to fetch                                 |
| `webhookSecret`                       | `string`                 | ❌       | -         | Secret for validating Storyblok webhooks                    |
| `deleteProductOnSbProductStoryDelete` | `boolean`                | ❌       | `false`   | Delete Medusa product when Storyblok story is deleted       |
| `imageOptimization`                   | `object`                 | ❌       | -         | Image optimization settings                                 |
| `imageOptimization.width`             | `number`                 | ❌       | `800`     | Target image width in pixels                                |
| `imageOptimization.quality`           | `number`                 | ❌       | `80`      | Image quality (1-100)                                       |
| `imageOptimization.mapImageUrl`       | `function`               | ❌       | -         | Custom function to transform image URLs                     |

### Why Two Access Tokens?

**Access Token (`accessToken`)**:

- Used for reading content from Storyblok (Content Delivery API)
- Read-only access
- Found in: Storyblok → Settings → Access Tokens

**Personal Access Token (`personalAccessToken`)**:

- Used for creating, updating, and deleting stories (Management API)
- Required to grant write access for syncing products
- **How to get it**:
  1. Go to your Storyblok account (top-right corner)
  2. Click on "My Account"
  3. Go to "Account Settings"
  4. Navigate to "Personal Access Tokens"
  5. Create a new token with appropriate permissions

> **Important**: Make sure you are working with the correct `spaceId`, since the PAT grants write access to all of your Storyblok spaces.

## Storyblok Setup

### 1. Create a Products Folder

1. In Storyblok, go to the Content tab and create a folder where all product stories will be stored (e.g., "products")
2. Open the folder and note the **Folder ID** from the URL:
   ```
   https://app.storyblok.com/#/me/spaces/{space_id}/stories/0/0/{folder_id}
                                                                   ↑ This is your folder ID
   ```
3. Use this ID for `productsParentFolderId` in your configuration
4. Use the name of the folder for `productsParentFolderName`

### 2. Create Required Bloks

#### Gallery Image Blok

Create a blok named `galleryImage` with the following fields:

| Field Name    | Type          | Required | Description                         |
| ------------- | ------------- | -------- | ----------------------------------- |
| `image`       | Asset (Image) | ✅       | The image asset                     |
| `isThumbnail` | Boolean       | ✅       | Whether this image is the thumbnail |

#### Product Variant Blok

Create a blok named `productVariant` with the following fields:

| Field Name               | Type   | Required | Description                                     |
| ------------------------ | ------ | -------- | ----------------------------------------------- |
| `title`                  | Text   | ✅       | Variant title/name                              |
| `medusaProductVariantId` | Text   | ✅       | Medusa variant ID (for syncing)                 |
| `gallery`                | Blocks | ❌       | Gallery of images (accepts `galleryImage` blok) |

#### Product Content Type

Create a content type named `product` with the following fields:

| Field Name        | Type   | Required | Description                                         |
| ----------------- | ------ | -------- | --------------------------------------------------- |
| `medusaProductId` | Text   | ✅       | Medusa product ID (for syncing)                     |
| `title`           | Text   | ✅       | Product title/name                                  |
| `gallery`         | Blocks | ❌       | Product image gallery (accepts `galleryImage` blok) |
| `variants`        | Blocks | ❌       | Product variants (accepts `productVariant` blok)    |

> **Note**: You can add any additional fields you need for your content management (description, SEO fields, custom attributes, etc.)

### 3. Configure Webhooks (Optional but Recommended)

To enable bi-directional sync (Storyblok → Medusa), set up webhooks:

1. Go to Storyblok → Settings → Webhooks
2. Create webhooks with the following URLs (replace with your backend URL):
   ```
   https://your-medusa-backend.com/storyblok/webhook/story/update?token=YOUR_WEBHOOK_SECRET
   https://your-medusa-backend.com/storyblok/webhook/story/delete?token=YOUR_WEBHOOK_SECRET
   ```
3. Select the appropriate events:
   - Story published (for update webhook)
   - Story deleted (for delete webhook)

> **Note**: The webhook secret is passed as a query parameter `?token=YOUR_SECRET` in the URL

## Admin UI

The plugin provides a comprehensive admin UI for managing product synchronization with Storyblok.

### Product Page Widget

On each product detail page in Medusa Admin, you'll see a Storyblok widget with:

**When Product is Synced:**

- 🟢 Green "Synced" status badge
- "Open in Storyblok" button - Opens the product story in Storyblok (new tab)

**When Product is Not Synced:**

- 🔴 Red "Not Synced" status badge
- "Sync to Storyblok" button - Creates the story in Storyblok with all variants and images

### Storyblok Management Page

Access via Medusa Admin sidebar → "Storyblok"

This dedicated page shows all your Medusa products with their sync status:

**Features:**

- **Product List** - View all products with sync status
- **Individual Sync** - Each row has a "Sync" or "Open in Storyblok" button
- **Bulk Selection** - Checkboxes to select multiple products
- **Sync Selected** - Sync only checked products
- **Sync All** - Bulk sync all products at once

**Status Indicators:**

- 🟢 **Synced** - Product exists in Storyblok, shows "Open in Storyblok" button
- 🔴 **Not Synced** - Product doesn't exist in Storyblok, shows "Sync" button

## How It Works

### Medusa → Storyblok Sync

#### 1. Product Creation

**When a product is created in Medusa:**

- ✅ A new story is created in Storyblok with the product data
- ✅ A dedicated asset folder is created (named after product slug)
- ✅ Product thumbnail is uploaded to the folder
- ✅ All product images are uploaded to the folder
- ✅ Images are added to the product's gallery with proper thumbnail marking
- ✅ Product variants are NOT created automatically (see below)

#### 2. Product Update

**When a product is updated in Medusa:**

- ✅ Only the product **handle** (slug) is synced to Storyblok
- ❌ Other fields (title, images, etc.) are NOT synced from Medusa to Storyblok

> **Important**: Once a product is synced to Storyblok, content management should happen in Storyblok. Updates will sync back to Medusa via webhooks.

#### 3. Product Deletion

**When a product is deleted in Medusa:**

- ✅ The Storyblok story is deleted
- ✅ The product's asset folder is deleted
- ✅ All images in the folder are deleted
- ✅ Complete cleanup - no orphaned assets

#### 4. Variant Creation

**When a variant is created in Medusa:**

- ✅ Variant is added to the product story in Storyblok
- ✅ Variant thumbnail is uploaded (if exists)
- ✅ Variant images are uploaded to the product's folder
- ✅ Images are added to the variant's gallery

> **Important**: When a new product is created, the plugin will automatically also create its default variant (or the multiple variants you have added during creation), and it will upload the images added to the product or variants during creation

#### 5. Variant Deletion

**When a variant is deleted in Medusa:**

- ✅ The variant is removed from the product story in Storyblok
- ⚠️ Associated images remain in the folder (may be used by product or other variants)

### Storyblok → Medusa Sync

**When a product story is published in Storyblok:**

- ✅ Product handle is synced back to Medusa
- ✅ Product thumbnail URL is synced to Medusa
- ✅ Product images are synced to Medusa
- ✅ Variant thumbnails are synced to Medusa
- ✅ Image URLs point to optimized Storyblok CDN URLs

This enables your storefront to use Storyblok's CDN for images without additional fetches.

## Image Management

### Smart Deduplication

The plugin intelligently handles image uploads:

- ✅ Checks if an image already exists in the folder before uploading
- ✅ Reuses existing assets when the same image is used across variants
- ✅ Prevents duplicate uploads when variants share product images
- ✅ Case-insensitive filename matching

### Folder Organization

Each product gets its own asset folder:

```
products/
  └── my-product-slug/
      ├── thumbnail.webp
      ├── image1.png
      ├── image2.png
      └── variant-image.jpg
```

### Image Optimization

Images served from Storyblok are automatically optimized:

- Configurable width and quality
- Automatic WebP conversion
- CDN delivery
- Custom transformation functions supported

## Troubleshooting

### Products not syncing

1. Check that all required environment variables are set
2. Verify your Personal Access Token has write permissions
3. Check Medusa logs for error messages
4. Ensure the products parent folder exists in Storyblok

### Images not uploading

1. Verify product images have valid URLs
2. Check that the asset folder exists (created automatically)
3. Review Storyblok asset limits for your plan
4. Check Medusa logs for upload errors

### Webhooks not working

1. Verify webhook URL is publicly accessible
2. Check webhook secret matches in both Storyblok and Medusa config
3. Review webhook logs in Storyblok dashboard
4. Ensure webhook events are configured correctly

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT

## Support

For issues and questions:

- **Discord Community**: [Join our Discord](https://discord.gg/nTBp48CBRq) - Get help, share feedback, and connect with other users
- **GitHub Issues**: [Report bugs or request features](https://github.com/alphabite/medusa-storyblok/issues)
- **Medusa Discord**: [Official Medusa Discord](https://discord.gg/medusajs)

## Credits

Developed with ❤️ by [Alphabite](https://alphabite.io)
