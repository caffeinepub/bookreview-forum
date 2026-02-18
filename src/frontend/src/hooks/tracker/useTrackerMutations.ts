import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../useActor';

export function useAddTrackedBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; author: string; isbn: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTrackedBook(data.title, data.author, data.isbn);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackedBooks'] });
    },
  });
}

export function useUpdateBookProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { bookId: bigint; status: string; percentage: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBookProgress(data.bookId, data.status, data.percentage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackedBooks'] });
    },
  });
}

export function useRemoveTrackedBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeTrackedBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trackedBooks'] });
      queryClient.invalidateQueries({ queryKey: ['readingMetrics'] });
    },
  });
}

export function useUpdateBookMetrics() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { bookId: bigint; pagesRead: bigint; hoursSpent: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.finishReadingSession(data.bookId, data.pagesRead, data.hoursSpent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['trackedBooks'] });
    },
  });
}

export function useFinishBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.finishBook();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingMetrics'] });
    },
  });
}
