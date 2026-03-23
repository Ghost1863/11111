"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type SortBy = "github" | "npm" | "name" | null;
export type SortDir = "ascending" | "descending";

export function useMedusaFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(() => {
    return {
      q: searchParams.get("q") || "",
      category: searchParams.get("category") || "all",
      page: parseInt(searchParams.get("page") || "1"),
      authors: searchParams.get("author")?.split(",") || [],
      community: searchParams.get("community")?.split(",") || [],
      sortBy: (searchParams.get("sortBy") as SortBy) || null,
      sortDir: (searchParams.get("sortDir") as SortDir) || "descending",
    };
  }, [searchParams]);

  const updateParams = useCallback(
    (newParams: URLSearchParams) => {
      if (!newParams.has("page_keep")) {
        newParams.delete("page");
      } else {
        newParams.delete("page_keep");
      }

      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    },
    [pathname, router],
  );

  const setQuery = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q);
      else params.delete("q");
      updateParams(params);
    },
    [searchParams, updateParams],
  );

  const toggleAuthor = useCallback(
    (authorId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = new Set(params.get("author")?.split(",") || []);

      if (current.has(authorId)) current.delete(authorId);
      else current.add(authorId);

      if (current.size > 0) params.set("author", Array.from(current).join(","));
      else params.delete("author");

      updateParams(params);
    },
    [searchParams, updateParams],
  );

  const toggleCommunity = useCallback(
    (optionId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = new Set(params.get("community")?.split(",") || []);

      if (current.has(optionId)) current.delete(optionId);
      else current.add(optionId);

      if (current.size > 0)
        params.set("community", Array.from(current).join(","));
      else params.delete("community");

      updateParams(params);
    },
    [searchParams, updateParams],
  );

  const setCategory = useCallback(
    (categoryId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (categoryId && categoryId !== "all") {
        params.set("category", categoryId);
      } else {
        params.delete("category");
      }
      // Remove page param when changing filters
      params.delete("page");
      updateParams(params);
    },
    [searchParams, updateParams],
  );

  const setSort = useCallback(
    (by: SortBy, dir: SortDir) => {
      const params = new URLSearchParams(searchParams.toString());
      if (by) {
        params.set("sortBy", by);
        params.set("sortDir", dir);
      } else {
        params.delete("sortBy");
        params.delete("sortDir");
      }
      updateParams(params);
    },
    [searchParams, updateParams],
  );

  const resetFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  return {
    ...state,
    setQuery,
    setCategory,
    toggleAuthor,
    toggleCommunity,
    setSort,
    resetFilters,
  };
}
