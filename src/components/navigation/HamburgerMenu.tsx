"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  APP_MENU_LINKS,
  INFO_MENU_LINKS,
} from "@/lib/navigation/infoLinks";

const linkClass =
  "block min-h-11 rounded-xl px-3 py-2.5 text-sm font-medium text-text-strong transition hover:bg-brand-blue-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue";

export function HamburgerMenu({
  showAppLinks = false,
  isSignedIn = false,
}: {
  showAppLinks?: boolean;
  isSignedIn?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border-subtle bg-paper text-brand-blue transition hover:border-accent-gold/40 hover:bg-accent-gold-soft/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">Menu</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
        >
          <path
            d="M3 6H17M3 10H17M3 14H17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-30 w-[min(17rem,calc(100vw-2.5rem))] rounded-[16px] border border-border-subtle bg-paper py-2 shadow-[0_12px_40px_rgb(15_39_68_/14%)]"
        >
          <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            App info
          </p>
          {INFO_MENU_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {showAppLinks ? (
            <>
              <div
                className="mx-3 my-2 border-t border-border-subtle"
                role="separator"
              />
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                App
              </p>
              {APP_MENU_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </>
          ) : null}

          {!isSignedIn ? (
            <>
              <div
                className="mx-3 my-2 border-t border-border-subtle"
                role="separator"
              />
              <Link
                href="/login"
                role="menuitem"
                className={`${linkClass} font-semibold text-brand-blue`}
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
