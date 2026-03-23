---
locale: en
---

<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="http://avatars.githubusercontent.com/u/229819798?s=200&v=4">
    <source media="(prefers-color-scheme: light)" srcset="hhttp://avatars.githubusercontent.com/u/229819798?s=200&v=4">
    <img alt="Medusa logo" src="http://avatars.githubusercontent.com/u/229819798?s=200&v=4">
    </picture>
  </a>
</p>
<h1 align="center">
Medusa Variant Images</h1>

<p align="center"><strong>Adds the ability to give each product variant its own thumbnail and ordered images</strong></p>
<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
</p>

<br />

## Installation

```
yarn add @meduline/medusa-plugin-variant-images

npm i @meduline/medusa-plugin-variant-images
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

#### Add the plugin to your `medusa-config.ts` file:

```ts
plugins: [
  {
    resolve: ' @meduline/medusa-plugin-variant-images',
    options: {},
  },
],
```

#### Run the database migrations (Adds a table to your database for storing variant images settings):

```
npx medusa db:migrate
```

#### In your frontend request to retrieve products from the backend, add the following field:

```js
fields: "+metadata";

// Example
sdk.client.fetch(`/store/products`, {
  query: {
    fields: "{other fields},+metadata", // <-- ADD +metadata HERE
  },
});
```

## Accessing Variant Images

Once you have done all of the above, you will be able to access the variant images from each product variant's metadata.

```ts
type Images = {
  url: string;
};

// Example
const thumbnail: string | null | undefined = variant.metadata.thumbnail;
const images: Images[] | undefined = variant.metadata?.images;
```

## More About The Plugin

- Medusa Variant Images includes the ability to order your images and displays the number when you click on the images.
- You can also upload images using a **base option**.  
  For example: Let's say you have a clothing store. You can select the base option as colour and upload your images to all variants with its colour option set as _brown_, simultaneously.  
  To do this, click the `3 dots` at the top right of the variant images section in your product.

## Bugs and Contributions

See a bug? Please raise an issue on the [GitHub repository](https://github.com/meduline/medusline/issues).

Want something to change? Feel free to clone the repository and open a PR once you have added your feature, or please open a feature request.

## Credits

This plugin has been forked from https://github.com/Betanoir/medusa-variant-images to work with Medusa 2.10.1 and above.
