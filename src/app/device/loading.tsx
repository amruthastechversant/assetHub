export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h1 className="text-2xl font-semibold mb-4">Device details</h1>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
