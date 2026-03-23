import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

export const TabButton = ({
  isActive = false,
  asChild = false,
  children,
  className,
  ...props
}: {
  isActive?: boolean;
  asChild?: boolean;
} & React.ComponentPropsWithRef<"button">) => {
  const Component = asChild ? Slot.Root : "button";

  return (
    <Component
      className={cn(
        "flex items-center justify-center txt-compact-small-plus rounded-full px-4 py-1.5 text-ui-fg-base border-transparent bg-transparent shadow-none hover:bg-ui-bg-base-hover active:bg-ui-bg-base-pressed h-fit border",
        isActive && "border-ui-border-base bg-ui-bg-base",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
