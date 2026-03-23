"use client";

import { BarsArrowDown } from "@medusajs/icons";
import { Select } from "@medusajs/ui";
import { useTranslations } from "next-intl";
import { useMedusaFilters } from "@/hooks/use-medusa-filters";
import { cn } from "@/lib/utils";

export default function SortSelect({
  isMobile = false,
}: {
  isMobile?: boolean;
}) {
  const t = useTranslations("Medusa.sort");
  const { sortBy, sortDir, setSort } = useMedusaFilters();

  const sortOptions = [
    { value: "default", label: t("defaultSort") },
    { value: "name-asc", label: t("nameAscSort") },
    { value: "name-desc", label: t("nameDescSort") },
    { value: "stars", label: t("starsSort") },
    { value: "downloads", label: t("downloadsSort") },
  ];

  const getDisplayValue = () => {
    if (!sortBy) return "default";
    if (sortBy === "name") {
      return sortDir === "ascending" ? "name-asc" : "name-desc";
    }
    if (sortBy === "github") return "stars";
    if (sortBy === "npm") return "downloads";
    return "default";
  };

  const handleValueChange = (value: string) => {
    switch (value) {
      case "default":
        setSort(null, "descending");
        break;
      case "name-asc":
        setSort("name", "ascending");
        break;
      case "name-desc":
        setSort("name", "descending");
        break;
      case "stars":
        setSort("github", "descending");
        break;
      case "downloads":
        setSort("npm", "descending");
        break;
      default:
        setSort(null, "descending");
        break;
    }
  };

  return (
    <Select value={getDisplayValue()} onValueChange={handleValueChange}>
      <Select.Trigger
        className={cn(
          isMobile
            ? "w-fit border-none bg-transparent p-0 shadow-none size-6 shrink-0 flex items-center justify-center [&_svg]:hidden m-0"
            : "text-sm bg-ui-bg-base min-w-fit text-nowrap flex-nowrap whitespace-nowrap space-x-2.5 px-4 h-9 cursor-pointer",
        )}
      >
        {isMobile ? (
          <BarsArrowDown
            className={cn("block!", sortBy && "text-ui-fg-interactive")}
          />
        ) : (
          <Select.Value placeholder={t("orderBy")} />
        )}
      </Select.Trigger>
      <Select.Content className="z-100">
        {sortOptions.map((option) => (
          <Select.Item
            key={option.value}
            className="text-sm"
            value={option.value}
          >
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}
