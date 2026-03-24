export function SkeletonCard() {
  return (
    <div className="p-4 rounded-2xl shadow-md bg-white animate-pulse">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonAvatar() {
  return (
    <div className="w-20 h-20 rounded-full bg-slate-200 animate-pulse" />
  );
}

export function SkeletonText({ lines = 2 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-200 rounded animate-pulse"
          style={{ width: `${Math.random() * 40 + 40}%` }}
        />
      ))}
    </div>
  );
}
