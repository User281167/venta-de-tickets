import { createClient } from 'npm:@supabase/supabase-js@2';

interface JwtHookPayload {
  user_id: string;
  claims: Record<string, unknown>;
}

interface JwtHookResponse {
  claims: {
    app_metadata: {
      role: string | null;
    };
  };
}

Deno.serve(async (req: Request): Promise<Response> => {
  const payload: JwtHookPayload = await req.json();
  const { user_id } = payload;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user_id)
      .single();

    if (error || !data) {
      console.error('jwt-hook: failed to fetch role', error?.message ?? 'user not found');
      return buildResponse(null);
    }

    return buildResponse(data.role);
  } catch (err) {
    console.error('jwt-hook: unexpected error', err instanceof Error ? err.message : err);
    return buildResponse(null);
  }
});

function buildResponse(role: string | null): Response {
  const body: JwtHookResponse = {
    claims: {
      app_metadata: { role },
    },
  };
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
  });
}
