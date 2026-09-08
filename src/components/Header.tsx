import Link from "next/link";

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="font-semibold no-underline">
          App Store moderation
        </Link>
        <span className="text-xs">Mock API · fixtures</span>
      </div>
    </header>
  );
}
