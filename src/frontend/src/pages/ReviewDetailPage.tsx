import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useReview } from '../hooks/reviews/useReview';
import { useComments } from '../hooks/reviews/useComments';
import { useLikeReview, useUnlikeReview, useAddComment } from '../hooks/reviews/useReviewMutations';
import { useGetCallerUserProfile } from '../hooks/auth/useCallerUserProfile';
import { Star, Heart, ArrowLeft, Send } from 'lucide-react';
import { formatDate } from '../utils/format';
import { useState } from 'react';
import { useExternalBlobImageUrl } from '../hooks/useExternalBlobImageUrl';

export default function ReviewDetailPage() {
  const { reviewId } = useParams({ from: '/review/$reviewId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: review, isLoading: reviewLoading } = useReview(BigInt(reviewId));
  const { data: comments, isLoading: commentsLoading } = useComments(BigInt(reviewId));
  const { data: userProfile } = useGetCallerUserProfile();
  const { mutate: likeReview, isPending: isLiking } = useLikeReview();
  const { mutate: unlikeReview, isPending: isUnliking } = useUnlikeReview();
  const { mutate: addComment, isPending: isAddingComment } = useAddComment();
  const [commentText, setCommentText] = useState('');
  const coverUrl = useExternalBlobImageUrl(review?.cover);

  const isAuthenticated = !!identity;
  const hasLiked = review?.likedBy.some((p) => p.toString() === identity?.getPrincipal().toString());

  const handleLikeToggle = () => {
    if (!review) return;
    if (hasLiked) {
      unlikeReview(review.id);
    } else {
      likeReview(review.id);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !userProfile) return;
    addComment(
      {
        reviewId: BigInt(reviewId),
        user: userProfile.name,
        commentText: commentText.trim(),
      },
      {
        onSuccess: () => {
          setCommentText('');
        },
      }
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
    );
  };

  if (reviewLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-muted-foreground">Loading review...</div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Review not found</h2>
          <p className="text-muted-foreground mb-6">The review you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Back to Reviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Reviews
      </button>

      <div className="bg-card border border-border rounded-lg p-8 shadow-soft">
        <div className="flex gap-6 mb-6">
          {coverUrl && (
            <img
              src={coverUrl}
              alt={`${review.title} cover`}
              className="w-32 h-48 object-cover rounded-md border border-border flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{review.title}</h1>
            <p className="text-lg text-muted-foreground mb-4">by {review.author}</p>
            {review.isbn && (
              <p className="text-sm text-muted-foreground mb-4">ISBN: {review.isbn}</p>
            )}
            <div className="flex items-center gap-4 mb-4">
              {renderStars(Number(review.rating))}
              <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none mb-6">
          <p className="text-foreground whitespace-pre-wrap">{review.reviewText}</p>
        </div>

        <div className="flex items-center gap-4 pt-6 border-t border-border">
          {isAuthenticated ? (
            <button
              onClick={handleLikeToggle}
              disabled={isLiking || isUnliking}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                hasLiked
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              } disabled:opacity-50`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
              <span>{Number(review.likes)}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="w-4 h-4" />
              <span>{Number(review.likes)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Comments ({comments?.length || 0})
        </h2>

        {isAuthenticated && userProfile && (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={isAddingComment || !commentText.trim()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {isAddingComment ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        )}

        {commentsLoading ? (
          <div className="text-center py-6 text-muted-foreground">Loading comments...</div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id.toString()} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-foreground">{comment.user}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-foreground">{comment.commentText}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground mt-2">Login to add a comment</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
