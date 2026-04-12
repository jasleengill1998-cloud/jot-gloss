// Minimal health check — no dependencies, just returns JSON immediately
export default function handler(_request: Request): Response {
  return new Response(
    JSON.stringify({ ok: true, time: Date.now() }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  )
}
