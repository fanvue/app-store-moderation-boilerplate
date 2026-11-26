/* ============================================================================
 * YOU DO NOT NEED TO EDIT THIS FILE.
 *
 * It is the page frame around every page.
 * The files you work in are in the README, under "Where to work".
 * ============================================================================ */

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
