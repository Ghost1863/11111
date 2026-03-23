---
locale: ru
---

<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Medusa Image Alt plugin
</h1>

## Compatibility

This plugin is tested with version 2.8.7 of `@medusajs/medusa`. 

## Installation

Add the @alpha-solutions/medusa-image-alt package to your project, and add the plugin to the plugin's section of your medusa-config.ts file.

```json
"plugins": [
  {
      "resolve": "@alpha-solutions/medusa-image-alt",
      "options": {},
  }
]
```

## Using the plugin

The plugin adds two widgets to your Medusa admin. Each is intended to set the alt property/field in the metadata of the image. Which will be included in API output, allowing the frontend to display a proper alt text.

### Product Details widget
On the product details page a widget displaying all the images and their alt. Setting an alt on an image and clicking save, will set this alt property on the metadata of the image.\


### Import Export widget
Using this centralized widget for importing and exporting image metadata, shop admins can leverage AI to make meaningful alts for the images for the entire shop as one batch operation.\
This widget enables export and import images to/from CSV. The default setting is exporting only alts, but it's also possible to choose other properties in the metadata to export.\
The import action will set any included columns (asides from the mandatory url column) to the metadata, retaining any other metadata already present on the image.\

This widget was intended to be introduced as a route extension - unfortunately that broke upon making it a module. Instead it is located as a widget on the built in settings/store route.

### Changelog
Added error messages to the import widget, and support for other datatypes than string for metadata
