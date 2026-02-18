import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import { useInternetIdentity } from '../useInternetIdentity';
import type { TrackedBook } from '../../backend';

export function useTrackedBooks() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;

  return useQuery<TrackedBook[]>({
    queryKey: ['trackedBooks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTrackedBooks();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
  });
}
