import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useTrackedBooks } from '../hooks/tracker/useTrackedBooks';
import { useReadingMetrics } from '../hooks/tracker/useReadingMetrics';
import { useAddTrackedBook, useUpdateBookProgress, useRemoveTrackedBook, useUpdateBookMetrics } from '../hooks/tracker/useTrackerMutations';
import { Plus, X, Trash2, BookOpen, Save } from 'lucide-react';

export default function ReadingTrackerPage() {
  const { identity } = useInternetIdentity();
  const { data: books, isLoading } = useTrackedBooks();
  const { data: metrics } = useReadingMetrics();
  const { mutate: addBook, isPending: isAdding } = useAddTrackedBook();
  const { mutate: updateProgress } = useUpdateBookProgress();
  const { mutate: removeBook } = useRemoveTrackedBook();
  const { mutate: updateMetrics, isPending: isUpdatingMetrics } = useUpdateBookMetrics();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
  });
  const [bookMetrics, setBookMetrics] = useState<Record<string, { pages: string; hours: string }>>({});

  const isAuthenticated = !!identity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBook(
      {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn || null,
      },
      {
        onSuccess: () => {
          setFormData({ title: '', author: '', isbn: '' });
          setShowForm(false);
        },
      }
    );
  };

  const handleStatusChange = (bookId: bigint, status: string, currentPercentage: bigint) => {
    updateProgress({ bookId, status, percentage: currentPercentage });
  };

  const handlePercentageChange = (bookId: bigint, percentage: string, currentStatus: string) => {
    const numPercentage = Math.min(100, Math.max(0, Number(percentage) || 0));
    updateProgress({ bookId, status: currentStatus, percentage: BigInt(numPercentage) });
  };

  const handleMetricsChange = (bookId: string, field: 'pages' | 'hours', value: string) => {
    setBookMetrics((prev) => ({
      ...prev,
      [bookId]: {
        pages: field === 'pages' ? value : prev[bookId]?.pages || '0',
        hours: field === 'hours' ? value : prev[bookId]?.hours || '0',
      },
    }));
  };

  const handleSaveMetrics = (bookId: bigint) => {
    const bookIdStr = bookId.toString();
    const pages = Math.max(0, Number(bookMetrics[bookIdStr]?.pages || 0));
    const hours = Math.max(0, Number(bookMetrics[bookIdStr]?.hours || 0));
    
    updateMetrics(
      { bookId, pagesRead: BigInt(pages), hoursSpent: BigInt(hours) },
      {
        onSuccess: () => {
          setBookMetrics((prev) => {
            const updated = { ...prev };
            delete updated[bookIdStr];
            return updated;
          });
        },
      }
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-12 text-center shadow-soft">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-foreground mb-2">My Reading Tracker</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to track your reading progress and manage your personal book list.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Reading Tracker</h1>
          <p className="text-muted-foreground mt-1">Track your reading progress</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Book'}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
          <h2 className="text-xl font-bold text-foreground mb-4">Add a Book</h2>
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">ISBN (optional)</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={isAdding}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isAdding ? 'Adding...' : 'Add Book'}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading your books...</div>
      ) : books && books.length > 0 ? (
        <div className="space-y-4">
          {books.map((book) => {
            const bookIdStr = book.id.toString();
            const hasUnsavedMetrics = !!bookMetrics[bookIdStr];
            return (
              <div key={bookIdStr} className="bg-card border border-border rounded-lg p-6 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-foreground mb-1">{book.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">by {book.author}</p>
                    {book.isbn && (
                      <p className="text-xs text-muted-foreground mb-4">ISBN: {book.isbn}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                        <select
                          value={book.progress.status}
                          onChange={(e) => handleStatusChange(book.id, e.target.value, book.progress.percentage)}
                          className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="Not started">Not started</option>
                          <option value="In progress">In progress</option>
                          <option value="Finished">Finished</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Progress (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={Number(book.progress.percentage)}
                          onChange={(e) => handlePercentageChange(book.id, e.target.value, book.progress.status)}
                          className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>
                    <div className="mb-4 bg-accent/30 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${Number(book.progress.percentage)}%` }}
                      />
                    </div>
                    <div className="border-t border-border pt-4">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Reading Session</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Pages Read</label>
                          <input
                            type="number"
                            min="0"
                            value={bookMetrics[bookIdStr]?.pages || '0'}
                            onChange={(e) => handleMetricsChange(bookIdStr, 'pages', e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Hours Spent</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={bookMetrics[bookIdStr]?.hours || '0'}
                            onChange={(e) => handleMetricsChange(bookIdStr, 'hours', e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => handleSaveMetrics(book.id)}
                            disabled={isUpdatingMetrics || !hasUnsavedMetrics}
                            className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            {isUpdatingMetrics ? 'Saving...' : 'Save Session'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBook(book.id)}
                    className="text-destructive hover:text-destructive/80 transition-colors p-2"
                    title="Remove book"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No books in your tracker yet.</p>
          <p className="text-sm text-muted-foreground">Click "Add Book" to start tracking your reading!</p>
        </div>
      )}
    </div>
  );
}
