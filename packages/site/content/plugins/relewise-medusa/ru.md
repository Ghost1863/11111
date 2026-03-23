---
locale: ru
---

<p align="center">
  <a href="https://www.relewise.com/">
    <img alt="Relewise" src=".github/banner.png">
  </a>
</p>

---
# Relewise plugin for Medusa   
Relewise is a modern personalization and search engine that creates the truly personalized experiences your customers expect.

The plugin helps integrating products into Relewise with a single click and keeping products in sync every hour!

## Installation
Run the following command to install the plugin:

```W
npm install @relewise/medusa
```

## Configuration

The plugin requires som options that we recommended you to store in a `.env` file.

```W
RELEWISE_DATASET_ID=
RELEWISE_API_KEY=
RELEWISE_SERVER_URL=
```

Fill the `RELEWISE_DATASET_ID`, `RELEWISE_API_KEY`, `RELEWISE_SERVER_URL` with your dataset, api-key and server-url found at [My.Relewise](https://my.relewise.com/developer-settings).

Configure the plugin by adding it to `plugins` in your `medusa-config.ts`.

Note that providing a language and a list of currenies is also required!

```W
module.exports = defineConfig({
  // ...
  plugins: [
    {
      resolve: "@relewise/medusa",
      options: {
        datasetId: process.env.RELEWISE_DATASET_ID!,
        apiKey: process.env.RELEWISE_API_KEY!,
        serverUrl: process.env.RELEWISE_SERVER_URL!,
        language: "en",
        currencies: ["eur", "usd"]
      },
    },
  ],
})
```
## Storing workflow executions
To store workflow executions, you need to have redis installed and running.

You can read how to do so in the [Medusa Documentation](https://docs.medusajs.com/resources/infrastructure-modules/workflow-engine/redis).

## Contributing

Pull requests are always welcome.  
Please fork this repository and make a PR when you are ready with your contribution.  

Otherwise you are welcome to open an Issue in our [issue tracker](https://github.com/Relewise/relewise-integrations-medusa/issues).

## License

relewise-integrations-medusa is licensed under the [MIT license](./LICENSE).
