"use client";

import { MagnifyingGlass, XMark } from "@medusajs/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Search({
  className,
  placeholder,
  isMobile = false,
}: {
  className?: string;
  placeholder: string;
  isMobile?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsRef = useRef(searchParams);

  const [value, setValue] = useState(searchParams.get("q") || "");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastCommittedRef = useRef(value);
  const valueRef = useRef(value);
  const isDirtyRef = useRef(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    searchParamsRef.current = searchParams;

    const nextValue = searchParams.get("q") || "";
    if (isDirtyRef.current) return;

    lastCommittedRef.current = nextValue;
    if (nextValue !== valueRef.current) {
      setValue(nextValue);
    }
  }, [searchParams]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const commitValue = (nextValue: string) => {
    lastCommittedRef.current = nextValue;
    isDirtyRef.current = false;
    const params = new URLSearchParams(searchParamsRef.current.toString());

    if (nextValue) {
      params.set("q", nextValue);
    } else {
      params.delete("q");
    }

    params.delete("page");

    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    isDirtyRef.current = true;
    setValue(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      commitValue(newValue);
    }, 300);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-full bg-ui-bg-base border txt-compact-small-plus flex items-center h-9 min-w-50",
        "focus-within:shadow-buttons-inverted-focus transition-[shadow,width] duration-200",
        isMobile &&
          "absolute right-16 w-[calc(100%-13rem)] origin-right transition-[width,transform] duration-300 ease-out focus-within:w-[calc(100%-4rem)]",
        className,
      )}
    >
      <div className="size-8 shrink-0 flex items-center justify-center">
        <MagnifyingGlass className="text-ui-fg-subtle" />
      </div>
      <input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (!isMobile && e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            if (debounceRef.current) {
              clearTimeout(debounceRef.current);
            }
            setValue("");
            commitValue("");
          }
        }}
        className="h-full w-full bg-transparent outline-none border-none pr-4 placeholder:text-ui-fg-muted text-ui-fg-base"
      />
      {isMobile ? (
        <Button
          variant={"transparent"}
          onClick={() => {
            if (debounceRef.current) {
              clearTimeout(debounceRef.current);
            }
            setValue("");
            commitValue("");
          }}
          className={cn(
            value === "" && "text-ui-fg-subtle",
            "opacity-0 pointer-events-none transition-opacity",
            "group-focus-within:opacity-100 group-focus-within:pointer-events-auto",
            "px-0 py-0 size-5 flex items-center justify-center shrink-0 mr-0.5",
          )}
        >
          <XMark />
        </Button>
      ) : (
        <button
          type="button"
          className={cn(
            "ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex",
            "mr-2 transition-opacity cursor-pointer",
            value?.length === 0 && "opacity-0 pointer-events-none",
          )}
          onClick={() => {
            if (debounceRef.current) {
              clearTimeout(debounceRef.current);
            }
            setValue("");
            commitValue("");
          }}
        >
          <kbd>Esc</kbd>
        </button>
      )}
    </div>
  );
}
