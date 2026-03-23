---
locale: en
---

<h1 align="center">Category Thumbnail</h1>

<p>This plugin provides the ability to upload and manage a <strong>thumbnail image for categories</strong>, enhancing the visual representation of your catalog. By associating an image with each category, you can deliver a more engaging browsing experience and improve storefront navigation.</p>

<br />

## Previews
<div style="display:flex; overflow-x: auto; gap: 10px; scroll-snap-type: x mandatory;">
  <img src="https://linearcommerce.s3.us-east-1.amazonaws.com/assest/image+(3).png" width="300" style="scroll-snap-align: start;" />
</div>


## Dependencies
**Install react-dropzone and multer** 

```
npm install --save react-dropzone
npm install multer

```

**If you are using Local storage for file uploads, you just have to set below configurations inside plugins array in your medusa-config.js file**

```
{
    resolve: "@linearcommerce/medusa-category-thumbnail",
    options: {
      provider: "local",
    },
}
```


**If you are using AWS S3 for file storage, you must have to install the following npm packages dependencies**

**Install aws-sdk/client-s3 and aws-sdk/s3-presigned-post** 

```
npm install @aws-sdk/client-s3
npm install @aws-sdk/s3-presigned-post

```

#### Add below environment variables in your .env file:

```ts
AWS_S3_ACCESS_KEY_ID=Your AWS Access Key ID
AWS_S3_ACCESS_SECRET=Your AWS Access Secret Key
AWS_S3_REGION=Your AWS Region
AWS_S3_BUCKET=Your AWS Bucket Name
AWS_S3_ENDPOINT=https://s3.amazonaws.com
```

#### Add the plugin to your `medusa-config.ts` file:

```ts
plugins: [
  {
    resolve: '@linearcommerce/medusa-category-thumbnail',
    options: {
      provider: "s3",
    },
  },
],
```


## Compatibility

**To use this plugin, you need to have the minimum versions of the following dependencies:**

```json
"@medusajs/admin-sdk": "^2.8.2",
"@medusajs/cli": "^2.8.2",
"@medusajs/framework": "^2.8.2",
"@medusajs/icons": "^2.8.2",
"@medusajs/js-sdk": "^2.8.2",
"@medusajs/medusa": "^2.8.2",
```

## Usage


## Installation

```
yarn add @linearcommerce/medusa-category-thumbnail

-- OR -- 

npm i @linearcommerce/medusa-category-thumbnail
```


#### Run the database migrations (Adds a table to your database for storing category thumbnails):

```
npx medusa db:migrate
```


## Key Features:

- Upload and manage thumbnail images at the category level.
- Seamlessly display category thumbnails on the storefront to enhance navigation and visual appeal.
- Maintain consistent branding and improve user experience with image-based category representation.
- Simply configure the file upload settings in the Medusa store, and the plugin will handle the rest automatically.
- Supports both local storage and Amazon S3 file upload providers for flexible file management.
