export default function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="mb-3 h-40 rounded-lg bg-stone-200" />
      <div className="mb-2 h-4 w-3/4 rounded bg-stone-200" />
      <div className="mb-4 h-3 w-full rounded bg-stone-200" />
      <div className="flex justify-between">
        <div className="h-4 w-16 rounded bg-stone-200" />
        <div className="h-8 w-20 rounded bg-stone-200" />
      </div>
    </div>
  );
}
