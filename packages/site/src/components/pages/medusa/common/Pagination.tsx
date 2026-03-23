"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { TabButton } from "@/components/ui/tab-button";
import { cn } from "@/lib/utils";

export default function Pagination({
  page,
  totalPages,
  className,
}: {
  page: number;
  totalPages: number;
  className?: string;
}) {
  const t = useTranslations("Navigation");
  const searchParams = useSearchParams();

  function createHref(pageNum: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNum.toString());
    return `?${params.toString()}`;
  }

  if (totalPages <= 1) return null;

  const maxVisibleButtons = 3;
  const halfVisible = Math.floor(maxVisibleButtons / 2);

  let startPage = Math.max(1, page - halfVisible);
  let endPage = Math.min(totalPages, page + halfVisible);

  if (page <= halfVisible) {
    endPage = Math.min(totalPages, maxVisibleButtons);
  }
  if (page >= totalPages - halfVisible) {
    startPage = Math.max(1, totalPages - maxVisibleButtons + 1);
  }

  const visiblePages = [];
  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  return (
    <div className={cn("flex justify-between gap-2 items-start", className)}>
      <div className="flex gap-2">
        {startPage > 1 && (
          <>
            <TabButton isActive={1 === page} asChild>
              <Link href={createHref(1)}>1</Link>
            </TabButton>
            {startPage > 2 && (
              <span className="flex items-center justify-center px-3 leading-0 grow-0">
                ...
              </span>
            )}
          </>
        )}

        {visiblePages.map((pageNumber) => {
          const isActive = page === pageNumber;
          return (
            <TabButton key={pageNumber} isActive={isActive} asChild>
              <Link href={createHref(pageNumber)}>{pageNumber}</Link>
            </TabButton>
          );
        })}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="flex items-center justify-center px-3 leading-0 grow-0">
                ...
              </span>
            )}
            <TabButton isActive={totalPages === page} asChild>
              <Link href={createHref(totalPages)}>{totalPages}</Link>
            </TabButton>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <TabButton isActive={false} disabled={page <= 1} asChild>
          {page > 1 ? (
            <Link href={createHref(page - 1)}>{t("back")}</Link>
          ) : (
            <span className="text-gray-300 cursor-not-allowed">
              {t("back")}
            </span>
          )}
        </TabButton>

        <TabButton isActive={false} disabled={page >= totalPages} asChild>
          {page < totalPages ? (
            <Link href={createHref(page + 1)}>{t("next")}</Link>
          ) : (
            <span className="text-gray-300 cursor-not-allowed">
              {t("next")}
            </span>
          )}
        </TabButton>
      </div>
    </div>
  );
}
