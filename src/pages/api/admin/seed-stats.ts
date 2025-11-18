import type { APIRoute } from 'astro';
import { runSeed } from '../../../lib/seedData';

export const GET: APIRoute = async () => {
  // Only allow if service key is present (admin check)
  if (!import.meta.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await runSeed();
    return new Response('Data seeded successfully', { status: 200 });
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
};
