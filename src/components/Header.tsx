"use client";

import { Badge, Link } from "@fanvue/ui";
import NextLink from "next/link";

export function Header() {
  return (
    <header className="border-b border-border-primary">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link asChild variant="primary">
          <NextLink href="/" className="typography-header-heading-sm no-underline">
            App Store moderation
          </NextLink>
        </Link>
        <Badge variant="default" leftDot>
          Mock API · fixtures
        </Badge>
      </div>
    </header>
  );
}
