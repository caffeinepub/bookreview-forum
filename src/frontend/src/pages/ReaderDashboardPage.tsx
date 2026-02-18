import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useReadingMetrics } from '../hooks/tracker/useReadingMetrics';
import { useTrackedBooks } from '../hooks/tracker/useTrackedBooks';
import { BookOpen, Clock, BookMarked, CheckCircle2 } from 'lucide-react';

export default function ReaderDashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: metrics, isLoading: metricsLoading } = useReadingMetrics();
  const { data: books, isLoading: booksLoading } = useTrackedBooks();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-12 text-center shadow-soft">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Reader Dashboard</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to view your reading statistics and progress.
          </p>
        </div>
      </div>
    );
  }

  const isLoading = metricsLoading || booksLoading;

  const totalPages = metrics?.totalPages ? Number(metrics.totalPages) : 0;
  const totalHours = metrics?.totalHours ? Number(metrics.totalHours) : 0;
  const totalBooksFinished = metrics?.totalBooks ? Number(metrics.totalBooks) : 0;
  const totalBooksTracked = books?.length || 0;

  const stats = [
    {
      label: 'Pages Read',
      value: totalPages.toLocaleString(),
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Hours Spent',
      value: totalHours.toLocaleString(),
      icon: Clock,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Books Tracked',
      value: totalBooksTracked.toLocaleString(),
      icon: BookMarked,
      color: 'text-accent-foreground',
      bgColor: 'bg-accent',
    },
    {
      label: 'Books Finished',
      value: totalBooksFinished.toLocaleString(),
      icon: CheckCircle2,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reader Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your reading journey and achievements</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading your statistics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-soft transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {books && books.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
              <h2 className="text-xl font-bold text-foreground mb-4">Currently Reading</h2>
              <div className="space-y-4">
                {books
                  .filter((book) => book.progress.status === 'In progress')
                  .slice(0, 5)
                  .map((book) => (
                    <div key={book.id.toString()} className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{book.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">by {book.author}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{Number(book.progress.percentage)}%</p>
                          <p className="text-xs text-muted-foreground">Complete</p>
                        </div>
                        <div className="w-24 bg-accent/30 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${Number(book.progress.percentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                {books.filter((book) => book.progress.status === 'In progress').length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No books currently in progress</p>
                )}
              </div>
            </div>
          )}

          {totalBooksFinished > 0 && (
            <div className="bg-gradient-to-br from-primary/10 to-accent/20 border border-border rounded-lg p-8 text-center shadow-soft">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Great Progress!</h3>
              <p className="text-muted-foreground">
                You've finished {totalBooksFinished} {totalBooksFinished === 1 ? 'book' : 'books'} and read{' '}
                {totalPages.toLocaleString()} pages. Keep up the amazing work!
              </p>
            </div>
          )}

          {totalBooksTracked === 0 && (
            <div className="bg-card border border-border rounded-lg p-12 text-center shadow-soft">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold text-foreground mb-2">Start Your Reading Journey</h3>
              <p className="text-muted-foreground">
                Head to the tracker to add your first book and start tracking your progress!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
