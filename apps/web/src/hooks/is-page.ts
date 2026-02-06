import { usePathname } from "next/navigation";

function normalizePath(path: string) {
  if (!path) return "/";
  if (path === "/") return "/";
  // Strip trailing slashes for consistent matching.
  return path.replace(/\/+$/, "");
}

function escapeRegexSegment(segment: string) {
  return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Matches Next.js-style route patterns against the current pathname.
 *
 * Supported pattern segments:
 * - Static segments: `/projects`
 * - Dynamic segments: `/projects/[projectId]`
 * - Catch-all: `/api/[...all]`
 * - Optional catch-all: `/docs/[[...slug]]`
 */
function routePatternToRegex(pattern: string, exact: boolean) {
  const normalized = normalizePath(pattern);
  const segments = normalized.split("/").filter(Boolean);

  // Handle root path case
  if (segments.length === 0) {
    return exact ? /^\/$/ : /^\//;
  }

  let source = "^";

  for (const segment of segments) {
    const optionalCatchAll = /^\[\[\.\.\.(.+)\]\]$/.exec(segment);
    if (optionalCatchAll) {
      // Matches both `/base` and `/base/a/b`.
      source += "(?:/(.*))?";
      // Optional catch-all must be the final segment in Next routes.
      break;
    }

    const catchAll = /^\[\.\.\.(.+)\]$/.exec(segment);
    if (catchAll) {
      // Matches `/base/a` and `/base/a/b` (at least one segment).
      source += "/(.+)";
      break;
    }

    const dynamic = /^\[(.+)\]$/.exec(segment);
    if (dynamic) {
      source += "/[^/]+";
      continue;
    }

    source += `/${escapeRegexSegment(segment)}`;
  }

  source += exact ? "$" : "(?:/|$)";
  return new RegExp(source);
}

export const useIsPage = (path: string, exact = false) => {
  const pathname = usePathname();
  const normalizedPathname = normalizePath(pathname);
  const regex = routePatternToRegex(path, exact);
  return regex.test(normalizedPathname);
};
