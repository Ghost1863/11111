import Section from "@/components/section";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-ui-bg-base-pressed ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <main>
      <div className="py-16 flex flex-col text-center items-center mx-auto px-2 sm:px-6 w-full">
        <SkeletonBlock className="h-10 w-64 mb-4" />
        <SkeletonBlock className="h-4 w-80 mb-6" />
        <div className="flex gap-3 items-center">
          <SkeletonBlock className="h-9 w-32" />
          <div className="hidden lg:flex items-center">
            <div className="h-full w-px bg-ui-border-base mr-7" />
            <SkeletonBlock className="h-9 w-64" />
          </div>
        </div>
      </div>
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12 px-6 xl:px-12 pt-14 pb-16">
          <div className="space-y-4">
            <SkeletonBlock className="h-6 w-32" />
            <SkeletonBlock className="h-4 w-40" />
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="h-4 w-44" />
            <SkeletonBlock className="h-4 w-28" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <SkeletonBlock className="h-8 w-40" />
              <SkeletonBlock className="h-8 w-28" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-4 rounded-md border border-ui-border-base bg-ui-bg-base p-6"
                >
                  <SkeletonBlock className="h-4 w-28" />
                  <div className="flex items-center gap-3">
                    <SkeletonBlock className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <SkeletonBlock className="h-4 w-40" />
                      <SkeletonBlock className="h-3 w-28" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <SkeletonBlock className="h-3 w-full" />
                    <SkeletonBlock className="h-3 w-5/6" />
                  </div>
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between">
                      <SkeletonBlock className="h-3 w-16" />
                      <SkeletonBlock className="h-3 w-16" />
                    </div>
                    <div className="h-px w-full bg-ui-border-base" />
                    <div className="flex gap-2">
                      <SkeletonBlock className="h-7 w-7 rounded-full" />
                      <SkeletonBlock className="h-7 w-7 rounded-full" />
                      <SkeletonBlock className="h-7 w-7 rounded-full" />
                      <SkeletonBlock className="h-7 w-7 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
