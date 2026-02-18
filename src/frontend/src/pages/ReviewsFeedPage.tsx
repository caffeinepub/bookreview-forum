import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLatestReviews } from '../hooks/reviews/useLatestReviews';
import { useAddReview } from '../hooks/reviews/useReviewMutations';
import { Star, Heart, MessageCircle, Plus, X } from 'lucide-react';
import { formatDate } from '../utils/format';

export default function ReviewsFeedPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: reviews, isLoading } = useLatestReviews(50);
  const { mutate: addReview, isPending: isAdding } = useAddReview();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    rating: 5,
    reviewText: '',
  });

  const isAuthenticated = !!identity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReview(
      {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn || null,
        rating: BigInt(formData.rating),
        reviewText: formData.reviewText,
      },
      {
        onSuccess: () => {
          setFormData({ title: '', author: '', isbn: '', rating: 5, reviewText: '' });
          setShowForm(false);
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
            className={`w-4 h-4 ${star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Book Reviews</h1>
          <p className="text-muted-foreground mt-1">Discover what others are reading</p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Write Review'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
          <h2 className="text-xl font-bold text-foreground mb-4">Write a Review</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Book Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Author *</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">ISBN (optional)</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Rating *</label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Star{r !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Your Review *</label>
              <textarea
                value={formData.reviewText}
                onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isAdding}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isAdding ? 'Publishing...' : 'Publish Review'}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading reviews...</div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id.toString()}
              onClick={() => navigate({ to: '/review/$reviewId', params: { reviewId: review.id.toString() } })}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-soft transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-foreground mb-1">{review.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">by {review.author}</p>
                  <div className="flex items-center gap-4 mb-3">
                    {renderStars(Number(review.rating))}
                    <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                  <p className="text-foreground line-clamp-3">{review.reviewText}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{Number(review.likes)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>View comments</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No reviews yet. Be the first to share!</p>
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground">Login to write a review</p>
          )}
        </div>
      )}
    </div>
  );
}
