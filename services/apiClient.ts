
import { supabase } from './SupabaseClient';

/**
 * Wrapper around fetch that automatically adds the Authorization header
 * with the current Supabase session token.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const { data: { session } } = await supabase.auth.getSession();

    // Create new headers object from options or empty
    const headers = new Headers(options.headers || {});

    // Add Authorization header if session exists
    if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    // Default to JSON content type if not specified and body is present
    if (options.body && !headers.has('Content-Type') && typeof options.body === 'string') {
        try {
            JSON.parse(options.body as string);
            headers.set('Content-Type', 'application/json');
        } catch (e) {
            // Not JSON, do nothing
        }
    }

    return fetch(url, { ...options, headers });
}
