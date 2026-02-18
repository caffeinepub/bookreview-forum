import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import ReviewsFeedPage from './pages/ReviewsFeedPage';
import ReviewDetailPage from './pages/ReviewDetailPage';
import ReadingTrackerPage from './pages/ReadingTrackerPage';
import ReaderDashboardPage from './pages/ReaderDashboardPage';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <ProfileSetupModal />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ReviewsFeedPage,
});

const reviewDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review/$reviewId',
  component: ReviewDetailPage,
});

const trackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tracker',
  component: ReadingTrackerPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: ReaderDashboardPage,
});

const routeTree = rootRoute.addChildren([indexRoute, reviewDetailRoute, trackerRoute, dashboardRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Development-only route verification
if (import.meta.env.DEV) {
  const expectedRoutes = ['/', '/review/$reviewId', '/tracker', '/dashboard'];
  const registeredRoutes: string[] = routeTree.children?.map(r => r.path) || [];
  const missingRoutes = expectedRoutes.filter(route => !registeredRoutes.includes(route));
  
  if (missingRoutes.length > 0) {
    console.warn('⚠️ Route configuration warning: Missing routes:', missingRoutes);
  } else {
    console.log('✅ All expected routes are registered:', expectedRoutes);
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
