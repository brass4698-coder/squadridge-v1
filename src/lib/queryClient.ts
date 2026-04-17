import { QueryClient } from '@tanstack/react-query';
import { isRecoverableNetworkError } from './errors';

const MAX_QUERY_RETRIES = 3;
const MAX_MUTATION_RETRIES = 2;

function retryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 30_000);
}

function shouldRetry(failureCount: number, error: unknown, max: number): boolean {
  if (failureCount >= max) return false;
  return isRecoverableNetworkError(error);
}

/**
 * TanStack Query deduplicates in-flight observers for the same query key + queryFn automatically.
 */
export function createAppQueryClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => shouldRetry(failureCount, error, MAX_QUERY_RETRIES),
        retryDelay,
        refetchOnWindowFocus: false,
        networkMode: 'offlineFirst',
      },
      mutations: {
        retry: (failureCount, error) => shouldRetry(failureCount, error, MAX_MUTATION_RETRIES),
        retryDelay,
        networkMode: 'offlineFirst',
      },
    },
  });

  // Stale times by query domain (partial key match). More specific prefixes after broader ones where needed.
  client.setQueryDefaults(['auth'], {
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
  client.setQueryDefaults(['profile'], { staleTime: 60_000 });
  client.setQueryDefaults(['squad'], { staleTime: 30_000 });
  client.setQueryDefaults(['squad', 'peerProfiles'], { staleTime: 60_000 });
  client.setQueryDefaults(['moderator'], { staleTime: 300_000 });
  client.setQueryDefaults(['messages'], { staleTime: 10_000 });
  client.setQueryDefaults(['mod'], { staleTime: 30_000 });
  client.setQueryDefaults(['ledger'], { staleTime: 300_000 });

  return client;
}
