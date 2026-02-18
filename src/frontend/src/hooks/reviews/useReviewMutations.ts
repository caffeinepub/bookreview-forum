import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';
import type { ReviewId, Rating } from '../../backend';

export function useAddReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      author: string;
      isbn: string | null;
      rating: Rating;
      reviewText: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addReview(data.title, data.author, data.isbn, data.rating, data.reviewText);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useLikeReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: ReviewId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.likeReview(reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review'] });
    },
  });
}

export function useUnlikeReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: ReviewId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unlikeReview(reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review'] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { reviewId: ReviewId; user: string; commentText: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(data.reviewId, data.user, data.commentText);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.reviewId.toString()] });
    },
  });
}
