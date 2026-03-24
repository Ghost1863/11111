import { promises as fs } from "fs";
import yaml from "js-yaml";
import fetch from "npm-registry-fetch";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_CATEGORY_IDS = [
  "analytics",
  "auth",
  "cms",
  "notification",
  "other",
  "payment",
  "search",
  "shipping",
  "erp",
];
const CATEGORY_KEYWORD_PREFIX = "medusa-plugin-";
const SEARCH_KEYWORDS = ["medusa-plugin-integration", "medusa-v2"];
const OUTPUT_DIR = join(__dirname, "../..", "site", "content");
const LOCALES = ["en", "ru"];

function sanitizeSlug(name) {
  return name.replace("@", "").replace(/\//g, "-").replace(/\./g, "-");
}

function generateLabel(packageName) {
  const nameWithoutScope = packageName.startsWith("@")
    ? packageName.split("/")[1]
    : packageName;
  const title = nameWithoutScope
    .replace(/^medusa-plugin-/, "")
    .replace(/^medusa-payment-/, "")
    .replace(/^medusa-/, "")
    .replace(/-/g, " ");
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function titleCase(value) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function determineAuthor(packageName, maintainerName = "") {
  const orgName = packageName.startsWith("@")
    ? packageName.split("/")[0].replace(/^@/, "")
    : "";
  const normalizedOrgName = orgName.toLowerCase();
  const normalizedMaintainer = maintainerName.toLowerCase();
  const rawAuthor = normalizedOrgName || normalizedMaintainer;
  return rawAuthor.replace(/\./g, "-");
}

function getPluginCategory(packageKeywords = [], categories = []) {
  for (const cat of categories) {
    if (packageKeywords.some((k) => cat.keywords.includes(k))) {
      return cat.id;
    }
  }
  return "other";
}

function cleanReadme(readme) {
  if (!readme) return "";
  return readme
    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .trim();
}

function preserveFields(existingRecord, incomingRecord, fields) {
  const merged = { ...incomingRecord };
  for (const field of fields) {
    if (Object.hasOwn(existingRecord, field)) {
      merged[field] = existingRecord[field];
    }
  }
  return merged;
}

async function run() {
  console.log("🚀 Starting Medusa V2 Plugin Scraper...");

  const categoriesYamlPath = join(OUTPUT_DIR, "categories.yml");
  let existingCategories = [];
  try {
    const existingCategoriesContent = await fs.readFile(
      categoriesYamlPath,
      "utf8",
    );
    existingCategories = yaml.load(existingCategoriesContent) || [];
  } catch (err) {
    console.log("📝 Creating new categories.yml file");
  }

  const categoriesConfig = existingCategories.length
    ? existingCategories.map((category) => {
        const keywords = Array.isArray(category.keywords)
          ? category.keywords
          : [`${CATEGORY_KEYWORD_PREFIX}${category.id}`];
        return {
          id: category.id,
          keywords,
        };
      })
    : DEFAULT_CATEGORY_IDS.map((id) => ({
        id,
        keywords: [`${CATEGORY_KEYWORD_PREFIX}${id}`],
      }));

  const categoryKeywords = categoriesConfig.flatMap((c) => c.keywords);
  const categoryLocalizations = existingCategories.reduce((acc, category) => {
    if (category.name) {
      acc[category.id] = category.name;
    }
    return acc;
  }, {});

  const results = [];
  try {
    const data = await fetch.json(
      `/-/v1/search?text=keywords:${SEARCH_KEYWORDS.join(",")}&size=1000`,
    );
    if (data.objects) results.push(...data.objects.map((pkg) => pkg.package));
  } catch (error) {
    console.error(`Error searching ${keyword}:`, error);
  }

  const uniquePackages = [
    ...new Map(results.map((item) => [item.name, item])).values(),
  ];

  const relevantPackages = uniquePackages.filter((pkg) => {
    const keywords = pkg.keywords || [];
    return (
      keywords.includes("medusa-v2") &&
      categoryKeywords.some((cat) => keywords.includes(cat))
    );
  });

  console.log(`📦 Found ${relevantPackages.length} relevant plugins.`);

  const pluginsData = [];
  const authorsSet = new Set();
  const categoriesSet = new Set();

  for (const pkg of relevantPackages) {
    try {
      const details = await fetch.json(`/${pkg.name}`);
      const latestVer = details["dist-tags"].latest;
      const versionData = details.versions[latestVer];

      const slug = sanitizeSlug(pkg.name);

      let maintainerName = "";
      if (details.maintainers && details.maintainers.length > 0) {
        maintainerName = details.maintainers[0].name || "";
      }
      const strictAuthorId = determineAuthor(pkg.name, maintainerName);

      const repoUrl = (
        versionData.repository?.url ||
        details.repository?.url ||
        ""
      )
        .replace(/^(git\+)?ssh:\/\/git@/, "https://")
        .replace(/^git\+/, "")
        .replace(/\.git$/, "");

      const localizedContent = {};
      for (const locale of LOCALES) {
        localizedContent[locale] = {
          label: generateLabel(pkg.name),
          shortDescription: (
            details.description ||
            pkg.description ||
            ""
          ).slice(0, 160),
          description: details.description || pkg.description || "",
        };
      }

      const pluginData = {
        slug: slug,
        name: localizedContent,
        category: getPluginCategory(
          details.keywords || pkg.keywords,
          categoriesConfig,
        ),
        author: strictAuthorId,
        npm: pkg.name,
        repository: repoUrl || undefined,
        lastPublish: details.time[latestVer],
        active: true,
      };

      pluginsData.push(pluginData);

      authorsSet.add(strictAuthorId);
      categoriesSet.add(pluginData.category);

      const pluginDir = join(OUTPUT_DIR, "plugins", slug);
      await fs.mkdir(pluginDir, { recursive: true });

      const readmeBody = cleanReadme(
        details.readme || versionData.readme || "",
      );

      for (const locale of LOCALES) {
        const localizedFilePath = join(pluginDir, `${locale}.md`);

        const frontmatter = {
          locale: locale,
        };

        const fileContent = `---
${yaml.dump(frontmatter, { indent: 2, lineWidth: -1 }).trim()}
---

${readmeBody}
`;

        await fs.writeFile(localizedFilePath, fileContent, "utf8");
      }

      console.log(`✅ Updated: ${slug} (Author: ${strictAuthorId})`);
    } catch (err) {
      console.error(`❌ Failed to process ${pkg.name}:`, err.message);
    }
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const pluginsYamlPath = join(OUTPUT_DIR, "plugins.yml");
  let existingPlugins = [];
  try {
    const existingPluginsContent = await fs.readFile(pluginsYamlPath, "utf8");
    existingPlugins = yaml.load(existingPluginsContent) || [];
  } catch (err) {
    console.log("📝 Creating new plugins.yml file");
  }

  const newPluginsMap = new Map(
    pluginsData.map((plugin) => [plugin.slug, plugin]),
  );

  const preservedPluginsOrder = [];
  const newPluginsSet = new Set(newPluginsMap.keys());

  for (const existingPlugin of existingPlugins) {
    if (newPluginsSet.has(existingPlugin.slug)) {
      const incomingPlugin = newPluginsMap.get(existingPlugin.slug);
      const mergedPlugin = preserveFields(existingPlugin, incomingPlugin, [
        "name",
        "category",
        "slug",
        "active",
      ]);
      preservedPluginsOrder.push(mergedPlugin);
    }
  }

  for (const plugin of pluginsData) {
    if (!preservedPluginsOrder.find((p) => p.slug === plugin.slug)) {
      preservedPluginsOrder.push(plugin);
    }
  }

  await fs.writeFile(pluginsYamlPath, yaml.dump(preservedPluginsOrder), "utf8");
  console.log(
    `📋 Created ${preservedPluginsOrder.length} plugin entries in plugins.yml (preserving order)`,
  );

  const authorsYamlPath = join(OUTPUT_DIR, "authors.yml");
  let existingAuthors = [];
  try {
    const existingAuthorsContent = await fs.readFile(authorsYamlPath, "utf8");
    existingAuthors = yaml.load(existingAuthorsContent) || [];
  } catch (err) {
    console.log("📝 Creating new authors.yml file");
  }

  const newAuthorsArray = Array.from(authorsSet).map((id) => {
    const name = {};
    LOCALES.forEach((locale) => {
      const displayName = id.charAt(0).toUpperCase() + id.slice(1);
      name[locale] = displayName;
    });

    return {
      id: id,
      name: name,
      active: true,
    };
  });

  const preservedAuthorsOrder = [];
  const newAuthorsSet = new Set(newAuthorsArray.map((author) => author.id));

  for (const existingAuthor of existingAuthors) {
    if (newAuthorsSet.has(existingAuthor.id)) {
      const normalizedAuthor = { ...existingAuthor };
      if (!Object.hasOwn(normalizedAuthor, "active")) {
        normalizedAuthor.active = true;
      }
      preservedAuthorsOrder.push(normalizedAuthor);
    }
  }

  for (const newAuthor of newAuthorsArray) {
    if (!preservedAuthorsOrder.find((a) => a.id === newAuthor.id)) {
      preservedAuthorsOrder.push(newAuthor);
    }
  }

  await fs.writeFile(authorsYamlPath, yaml.dump(preservedAuthorsOrder), "utf8");
  console.log(
    `👤 Updated authors.yml with ${preservedAuthorsOrder.length} author entries (preserving order)`,
  );

  const existingCategoryMap = new Map(
    existingCategories.map((category) => [category.id, category.name]),
  );

  const newCategoriesArray = Array.from(categoriesSet).map((id) => {
    const existingName = existingCategoryMap.get(id);
    const fallbackName = categoryLocalizations[id] || {
      en: titleCase(id),
      ru: titleCase(id),
    };

    return {
      id: id,
      name: existingName || fallbackName,
    };
  });

  const preservedCategoriesOrder = [];
  const newCategoriesSet = new Set(newCategoriesArray.map((cat) => cat.id));

  for (const existingCategory of existingCategories) {
    if (newCategoriesSet.has(existingCategory.id)) {
      preservedCategoriesOrder.push(existingCategory);
    }
  }

  for (const newCategory of newCategoriesArray) {
    if (!preservedCategoriesOrder.find((c) => c.id === newCategory.id)) {
      preservedCategoriesOrder.push(newCategory);
    }
  }

  await fs.writeFile(
    categoriesYamlPath,
    yaml.dump(preservedCategoriesOrder),
    "utf8",
  );
  console.log(
    `🏷️  Updated categories.yml with ${preservedCategoriesOrder.length} category entries (preserving order)`,
  );

  console.log("🎉 Scrape complete with new structure:");
  console.log(`   - plugins.yml (with ${pluginsData.length} plugins)`);
  console.log(
    `   - authors.yml (with ${preservedAuthorsOrder.length} authors)`,
  );
  console.log(
    `   - categories.yml (with ${preservedCategoriesOrder.length} categories)`,
  );
  console.log(`   - plugins/[slug]/en.md and ru.md for each plugin`);

  // Test marker: write last scrape timestamp to test workflow changes
  const testMarkerPath = join(OUTPUT_DIR, "plugins", ".scraper-test-marker.txt");
  await fs.writeFile(testMarkerPath, `Last scrape: ${new Date().toISOString()}\n`, "utf8");
  console.log("   - .scraper-test-marker.txt (test marker)");
}

run();
