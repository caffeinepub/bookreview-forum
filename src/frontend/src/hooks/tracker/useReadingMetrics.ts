import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import type { ReadingMetrics } from '../../backend';

export function useReadingMetrics() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;

  return useQuery<ReadingMetrics | null>({
    queryKey: ['readingMetrics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getReadingMetrics();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });
}
