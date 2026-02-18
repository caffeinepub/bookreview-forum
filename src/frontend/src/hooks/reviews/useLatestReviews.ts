import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Review } from '../../backend';

export function useLatestReviews(limit: number = 50) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['reviews', 'latest', limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLatestReviews(BigInt(limit));
    },
    enabled: !!actor && !actorFetching,
  });
}
