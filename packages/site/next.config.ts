import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

type OutputType = "standalone" | "export" | undefined;

export function getOutputType(): OutputType {
  const value = process.env.NEXT_OUTPUT;

  if (value === "undefined") {
    return undefined;
  } else if (value === "export" || value === "standalone") {
    return value;
  }

  return "standalone";
}

const nextConfig: import("next").NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  output: getOutputType(),

  staticPageGenerationTimeout: 180,

  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      new URL("https://randomuser.me/**"),
      new URL("https://github.com/**"),
    ],
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              icon: true,
              svgo: true,
              dimensions: false,
            },
          },
        ],
        as: "*.js",
      },
    },
    resolveAlias: {
      "@/*": "./src/*",
      "@/content/*": "./content/*",
    },
  },

  webpack(config) {
    const fileLoaderRule = config.module.rules.find(
      (rule: { test: { test: (arg0: string) => unknown } }) =>
        rule.test?.test?.(".svg"),
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              icon: true,
              svgo: true,
              dimensions: false,
            },
          },
        ],
      },
    );

    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
  async redirects() {
    return [
      {
        source: "/:locale/medusa",
        destination: "/:locale/medusa/plugins",
        permanent: false,
      },
      {
        source: "/medusa",
        destination: "/medusa/plugins",
        permanent: false,
      },
      {
        source: "/:locale/medusa-plugins/:path*",
        destination: "/:locale/medusa/plugins/:path*",
        permanent: true,
      },
      {
        source: "/medusa-plugins/:path*",
        destination: "/medusa/plugins/:path*",
        permanent: true,
      },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [
      "remark-gfm",
      "remark-mdx-frontmatter",
      "remark-frontmatter",
    ],
    rehypePlugins: [],
  },
});

export default withMDX(withNextIntl(nextConfig));
