// Instant loading boundary — lets Next commit the navigation immediately
// (so the URL + bottom-nav highlight update right away) while the dynamic
// page streams in behind this skeleton.
export default function AppLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="px-1 pt-2">
        <div className="h-9 w-40 animate-pulse rounded-cute bg-surface-muted" />
      </div>
      <div className="h-36 animate-pulse rounded-cute bg-surface-muted" />
      <div className="h-24 animate-pulse rounded-cute bg-surface-muted" />
    </div>
  );
}
