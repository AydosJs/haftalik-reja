import { Skeleton } from "@/components/ui/skeleton";

export function PlanSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-7 sm:pb-20 sm:pt-9">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-7">
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-3 w-48 bg-navy-700" />
          <Skeleton className="h-10 w-64 bg-navy-700" />
          <Skeleton className="h-3 w-56 bg-navy-800" />
          <Skeleton className="h-6 w-52 rounded-full bg-navy-800" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-44 rounded-lg bg-navy-800" />
          <Skeleton className="h-9 w-32 rounded-lg bg-navy-700" />
        </div>
      </div>

      <div className="mb-7 rounded-2xl border border-line bg-navy-800 p-6">
        <div className="mb-6 flex items-center justify-between gap-2">
          <Skeleton className="h-6 w-56 bg-navy-700" />
          <Skeleton className="h-4 w-28 bg-navy-700" />
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3.5">
              <Skeleton className="h-4 w-20 bg-navy-700 sm:w-28" />
              <Skeleton className="h-2.5 flex-1 rounded-md bg-navy-700" />
              <Skeleton className="h-4 w-9 bg-navy-700" />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-2xl border border-line bg-navy-800 p-5"
          >
            <div className="flex items-center justify-between gap-2.5">
              <Skeleton className="h-8 w-36 bg-navy-700" />
              <Skeleton className="size-7 rounded-lg bg-navy-700" />
            </div>
            <div className="rounded-xl border border-line bg-navy-900 p-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-16 bg-navy-700" />
                  <Skeleton className="h-8 w-12 bg-navy-700" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-12 bg-navy-700" />
                  <Skeleton className="h-5 w-28 bg-navy-700" />
                </div>
              </div>
              <div className="mt-3 border-t border-line pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <Skeleton className="h-3 w-20 bg-navy-700" />
                  <Skeleton className="h-3 w-8 bg-navy-700" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full bg-navy-700" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-9 w-full rounded-lg bg-navy-900" />
              ))}
            </div>
            <Skeleton className="h-9 w-full rounded-lg bg-navy-900" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-navy-800 p-6">
        <div className="mb-5 flex items-center justify-between gap-2">
          <Skeleton className="h-6 w-44 bg-navy-700" />
          <Skeleton className="h-4 w-32 bg-navy-700" />
        </div>
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-lg bg-navy-900" />
          ))}
        </div>
      </div>
    </div>
  );
}
