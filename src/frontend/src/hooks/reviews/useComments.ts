import { useQuery } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { Comment, ReviewId } from '../../backend';

export function useComments(reviewId: ReviewId) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ['comments', reviewId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComments(reviewId);
    },
    enabled: !!actor && !actorFetching,
  });
}
