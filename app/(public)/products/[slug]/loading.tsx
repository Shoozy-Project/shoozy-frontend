export default function ProductLoading() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-40 md:grid-cols-2 sm:px-6 lg:px-8" aria-busy="true">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-5"><div className="h-10 w-2/3 animate-pulse bg-muted" /><div className="h-6 w-1/3 animate-pulse bg-muted" /><div className="h-28 animate-pulse bg-muted" /></div>
    </div>
  );
}
