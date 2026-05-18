import type { RequestHandler } from "@builder.io/qwik-city";

/**
 * Calendar protection middleware
 * - Adds aggressive caching for calendar pages to reduce Sanity API calls
 * - Blocks suspicious bot patterns
 */
export const onRequest: RequestHandler = async ({ cacheControl, request, send }) => {
  const userAgent = request.headers.get("user-agent") || "";

  // Block common scraping tools and empty user agents
  const suspiciousPatterns = [
    /^$/,                    // Empty UA
    /curl/i,
    /wget/i,
    /python-requests/i,
    /scrapy/i,
    /httpx/i,
    /aiohttp/i,
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));

  if (isSuspicious) {
    // Return 403 for suspicious requests
    send(403, "Forbidden");
    return;
  }

  // Aggressive caching for calendar pages
  // Cache for 5 minutes on CDN, serve stale for up to 1 hour while revalidating
  cacheControl({
    public: true,
    maxAge: 300,                    // 5 minutes
    staleWhileRevalidate: 3600,     // 1 hour
    staleIfError: 86400,            // 1 day if origin is down
  });
};
