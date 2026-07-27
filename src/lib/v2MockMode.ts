/**
 * When true, v2 facilitator/participant surfaces use fixture data instead of live Supabase.
 * Set VITE_V2_MOCK_DATA=false in staging/production pilot environments.
 */
export function isV2MockDataEnabled(): boolean {
  return import.meta.env.VITE_V2_MOCK_DATA === 'true';
}
