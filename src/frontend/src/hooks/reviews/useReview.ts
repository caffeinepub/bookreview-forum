import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Review, ReviewId } from '../../backend';

export function useReview(reviewId: ReviewId) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Review | null>({
    queryKey: ['review', reviewId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getReview(reviewId);
    },
    enabled: !!actor && !actorFetching,
  });
}
