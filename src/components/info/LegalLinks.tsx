import Link from "next/link";
import { INFO_MENU_LINKS } from "@/lib/navigation/infoLinks";

export function LegalLinks() {
  return (
    <ul className="space-y-2">
      {INFO_MENU_LINKS.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="text-sm font-medium text-brand-blue underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
