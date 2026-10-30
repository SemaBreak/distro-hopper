const SOURCE = 'https://distrowatch.com/';

// Each allowed kind of request, with how long the CDN and browser may reuse the response
const ROUTES = [
  // Must differ on every call, otherwise every visitor would get the same distro
  { pattern: /^random\.php$/, cache: 'no-store' },
  // Reviews change rarely, so one upstream request serves many visitors
  { pattern: /^dwres\.php\?resource=ratings&distro=[\w.-]+$/, cache: 'public, max-age=60', cdn: 'public, s-maxage=600' },
  // Screenshots almost never change; serving them from our CDN avoids hotlinking distrowatch.com
  { pattern: /^images\/[\w/.-]+\.(png|jpe?g|gif|webp)$/i, cache: 'public, max-age=86400', cdn: 'public, s-maxage=604800' },
];

export default async (request) => {
  const path = new URL(request.url).searchParams.get('path') || '';
  const route = ROUTES.find(r => r.pattern.test(path));

  if (!route || path.includes('..')) {
    return new Response('Bad request', { status: 400 });
  }

  let upstream;
  try {
    upstream = await fetch(SOURCE + path, { redirect: 'follow' });
  } catch {
    return new Response('Upstream unavailable', { status: 502 });
  }

  const headers = {
    'content-type': upstream.headers.get('content-type') || 'text/html; charset=utf-8',
    'cache-control': upstream.ok ? route.cache : 'no-store',
  };
  if (upstream.ok && route.cdn) {
    headers['netlify-cdn-cache-control'] = route.cdn;
  }

  return new Response(await upstream.arrayBuffer(), { status: upstream.status, headers });
};
