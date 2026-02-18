# Deployment Smoke Check

This checklist helps verify that the deployed application works correctly after publication.

## Pre-Deployment Checks

Before publishing, run these checks locally:

- [ ] Application builds successfully without errors (`npm run build`)
- [ ] All TypeScript type checks pass (`npm run typescript-check`)
- [ ] No console errors in development mode
- [ ] All core routes render correctly locally

## Post-Publication Verification

After publishing to production, perform these checks on the **published URL**:

### 1. Build Verification

- [ ] **Check build identifier**: Scroll to the footer and verify the build identifier (format: `vX.X-YYYYMMDDHHMMSS`) matches the expected published draft version
- [ ] The build identifier should be different from any previous published version
- [ ] Note the build identifier for reference: `________________`

### 2. Core Routes Load Successfully

Test each route by directly visiting the URL:

- [ ] **Home/Reviews Feed** (`/`): Loads without errors, displays reviews or empty state
- [ ] **Reading Tracker** (`/tracker`): Loads without errors, shows tracker interface or login prompt
- [ ] **Reader Dashboard** (`/dashboard`): Loads without errors, shows dashboard or login prompt
- [ ] No 404 errors, blank pages, or redirect loops on any route

### 3. Navigation Verification

#### Desktop Navigation (screen width ≥ 768px)

- [ ] Header displays "Book Readers" branding with book icon
- [ ] Primary navigation links visible in header: "Reviews", "My Tracker", "Dashboard"
- [ ] Click "Reviews" → navigates to `/` successfully
- [ ] Click "My Tracker" → navigates to `/tracker` successfully
- [ ] Click "Dashboard" → navigates to `/dashboard` successfully
- [ ] Active route is highlighted in navigation
- [ ] Login button is visible and functional

#### Mobile Navigation (screen width < 768px)

- [ ] Header displays "Book Readers" branding
- [ ] Menu icon (hamburger) is visible in header
- [ ] Click menu icon → mobile navigation sheet opens from right
- [ ] Mobile menu displays all navigation links: "Reviews", "My Tracker", "Dashboard"
- [ ] Click "Reviews" in mobile menu → navigates to `/` and closes menu
- [ ] Click "My Tracker" in mobile menu → navigates to `/tracker` and closes menu
- [ ] Click "Dashboard" in mobile menu → navigates to `/dashboard` and closes menu
- [ ] Active route is highlighted in mobile menu
- [ ] Login button is visible and functional

### 4. Authentication Flow (Desktop/Laptop Focus)

Test authentication on **desktop/laptop browsers** (Chrome, Firefox, Safari, Edge):

#### Initial Login

- [ ] Click "Login" button
- [ ] Internet Identity popup/tab opens successfully (not blocked)
- [ ] Complete authentication in Internet Identity
- [ ] After authentication, redirected back to application
- [ ] Login button changes to "Logout"
- [ ] User profile setup modal appears (if first-time user)
- [ ] Can enter name and save profile successfully

#### Session Persistence

- [ ] Refresh the page → user remains logged in
- [ ] Navigate between routes → user remains logged in
- [ ] Close and reopen browser tab → user remains logged in (session persists)

#### Logout

- [ ] Click "Logout" button
- [ ] User is logged out successfully
- [ ] Login button reappears
- [ ] Protected content is hidden/replaced with login prompts

#### Error Handling

- [ ] Check browser console for authentication errors
- [ ] No "User is already authenticated" errors
- [ ] No popup-blocked errors (or proper fallback shown)
- [ ] Error messages are user-friendly if authentication fails

### 5. Core Functionality Smoke Tests

#### Reviews Feed

- [ ] Reviews display correctly with ratings, titles, authors
- [ ] Can add a new review (if logged in)
- [ ] Can like/unlike reviews (if logged in)
- [ ] Can view review details by clicking on a review
- [ ] Comments section works on review detail page

#### Reading Tracker

- [ ] Login prompt shown if not authenticated
- [ ] Can add a new book to tracker (if logged in)
- [ ] Can update book progress (if logged in)
- [ ] Progress bars display correctly
- [ ] Can remove books from tracker (if logged in)

#### Reader Dashboard

- [ ] Login prompt shown if not authenticated
- [ ] Reading statistics display correctly (if logged in)
- [ ] Stat tiles show: pages read, books finished, hours spent, etc.
- [ ] No data errors or loading states stuck

### 6. Visual and UX Checks

- [ ] Footer displays copyright with current year
- [ ] Footer includes "Built with ❤️ using caffeine.ai" attribution
- [ ] Footer includes build identifier
- [ ] Caffeine.ai link includes proper UTM parameters
- [ ] No layout breaks on mobile (320px - 768px width)
- [ ] No layout breaks on tablet (768px - 1024px width)
- [ ] No layout breaks on desktop (≥1024px width)
- [ ] Color scheme is consistent (warm coral/peach primary, sage green accents)
- [ ] Dark mode works correctly (if implemented)

### 7. Browser Console Checks

Open browser developer tools (F12) and check:

- [ ] No JavaScript errors in console
- [ ] No failed network requests (except expected 404s for optional resources)
- [ ] No authentication-related errors
- [ ] No React warnings or errors
- [ ] API calls to backend canister succeed

### 8. Performance and Loading

- [ ] Initial page load completes in reasonable time (<5 seconds)
- [ ] No infinite loading states
- [ ] Loading indicators appear and disappear appropriately
- [ ] Images and assets load correctly

## Troubleshooting Guide

### If Dashboard is not reachable:

1. Check that `/dashboard` route is defined in `App.tsx`
2. Verify navigation links point to correct paths
3. Check browser console for routing errors
4. Verify TanStack Router is configured correctly

### If authentication fails on desktop:

1. Check browser console for detailed error messages
2. Verify Internet Identity configuration in `internetIdentityConfig.ts`
3. Check that popup blockers are not interfering
4. Try clearing browser cache and cookies
5. Test in incognito/private browsing mode
6. Verify `useInternetIdentity` hook error handling

### If build identifier doesn't match:

1. Verify the build process completed successfully
2. Check that the published deployment used the latest build artifacts
3. Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Verify CDN cache has been invalidated (if applicable)

### If routes return 404:

1. Verify routing configuration in `App.tsx`
2. Check that all routes are properly registered
3. Verify deployment includes all necessary route files
4. Check server/CDN configuration for SPA routing

## Sign-Off

- [ ] All checks completed successfully
- [ ] Build identifier verified: `________________`
- [ ] Tested by: `________________`
- [ ] Date: `________________`
- [ ] Browser(s) tested: `________________`
- [ ] Issues found (if any): `________________`

---

**Note**: This checklist should be completed for every production deployment to ensure quality and catch issues early.
