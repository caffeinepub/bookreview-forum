import { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useLatestReviews } from '../hooks/reviews/useLatestReviews';
import { useAddReview } from '../hooks/reviews/useReviewMutations';
import { Star, Heart, MessageCircle, Plus, X, Upload, Image as ImageIcon } from 'lucide-react';
import { formatDate } from '../utils/format';
import { validateImageFile, createPreviewUrl, revokePreviewUrl } from '../utils/uploadValidation';
import { ExternalBlob } from '../backend';
import { useExternalBlobImageUrl } from '../hooks/useExternalBlobImageUrl';

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
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = !!identity;

  useEffect(() => {
    return () => {
      if (coverPreview) {
        revokePreviewUrl(coverPreview);
      }
    };
  }, [coverPreview]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setCoverError(validation.error || 'Invalid image');
      setCoverFile(null);
      if (coverPreview) {
        revokePreviewUrl(coverPreview);
        setCoverPreview(null);
      }
      return;
    }

    setCoverError(null);
    setCoverFile(file);
    if (coverPreview) {
      revokePreviewUrl(coverPreview);
    }
    setCoverPreview(createPreviewUrl(file));
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverError(null);
    if (coverPreview) {
      revokePreviewUrl(coverPreview);
      setCoverPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let coverBlob: ExternalBlob | undefined = undefined;
    if (coverFile) {
      const bytes = new Uint8Array(await coverFile.arrayBuffer());
      coverBlob = ExternalBlob.fromBytes(bytes);
    }

    addReview(
      {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn || null,
        rating: BigInt(formData.rating),
        reviewText: formData.reviewText,
        cover: coverBlob,
      },
      {
        onSuccess: () => {
          setFormData({ title: '', author: '', isbn: '', rating: 5, reviewText: '' });
          handleRemoveCover();
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
              <label className="block text-sm font-medium text-foreground mb-2">Book Cover (optional)</label>
              <div className="space-y-2">
                {coverPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-32 h-48 object-cover rounded-md border border-border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleCoverChange}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-md cursor-pointer hover:bg-muted/80 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Cover
                    </label>
                    <span className="text-xs text-muted-foreground">JPEG, PNG, or WebP (max 2MB)</span>
                  </div>
                )}
                {coverError && <p className="text-sm text-destructive">{coverError}</p>}
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
            <ReviewCard key={review.id.toString()} review={review} navigate={navigate} renderStars={renderStars} />
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

function ReviewCard({ review, navigate, renderStars }: any) {
  const coverUrl = useExternalBlobImageUrl(review.cover);

  return (
    <div
      onClick={() => navigate({ to: '/review/$reviewId', params: { reviewId: review.id.toString() } })}
      className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-soft transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {coverUrl && (
          <img
            src={coverUrl}
            alt={`${review.title} cover`}
            className="w-20 h-28 object-cover rounded-md border border-border flex-shrink-0"
          />
        )}
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
  );
}
