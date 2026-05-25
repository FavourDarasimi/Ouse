export function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-2 animate-pulse">
      <div className="aspect-[4/3] rounded-2xl bg-slate-100" />
      <div className="px-1 pt-4 pb-2 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-5 bg-slate-100 rounded w-3/5" />
          <div className="h-5 bg-slate-100 rounded w-1/4 shrink-0" />
        </div>
        <div className="h-4 bg-slate-100 rounded w-2/5" />
        <div className="flex items-center gap-2">
          <div className="h-7 bg-slate-100 rounded-full w-24" />
          <div className="h-7 bg-slate-100 rounded-full w-24" />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-11 bg-slate-100 rounded-full w-full" />
          <div className="h-11 w-11 bg-slate-100 rounded-full shrink-0" />
        </div>
      </div>
    </div>
  );
}
