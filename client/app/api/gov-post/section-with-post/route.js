export async function GET(request) {
  return new Response(JSON.stringify({ message: 'section-with-post' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
