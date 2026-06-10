export default function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="mb-3 h-40 rounded-2xl bg-white/40" />
      <div className="mb-2 h-4 w-3/4 rounded bg-white/45" />
      <div className="mb-4 h-3 w-full rounded bg-white/40" />
      <div className="flex justify-between">
        <div className="h-4 w-16 rounded bg-white/45" />
        <div className="h-8 w-20 rounded bg-white/45" />
      </div>
    </div>
  );
}
