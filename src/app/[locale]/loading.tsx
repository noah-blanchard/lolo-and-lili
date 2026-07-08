export default function LocaleLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon.svg"
        alt=""
        width={96}
        height={96}
        className="animate-pulse"
      />
    </div>
  );
}
