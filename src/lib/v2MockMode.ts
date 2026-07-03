/**
 * When true, v2 facilitator/participant surfaces use fixture data instead of live Supabase.
 * Set VITE_V2_MOCK_DATA=false in staging/production pilot environments.
 */
export function isV2MockDataEnabled(): boolean {
  const flag = import.meta.env.VITE_V2_MOCK_DATA;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return import.meta.env.DEV;
}
