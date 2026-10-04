export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-40 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading products">
      <div className="mb-12 h-12 w-72 animate-pulse rounded bg-muted" />
      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="hidden h-96 animate-pulse rounded bg-muted lg:block" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[4/5] animate-pulse bg-muted" />)}
        </div>
      </div>
    </div>
  );
}
