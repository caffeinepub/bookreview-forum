# Specification

## Summary
**Goal:** Allow users to upload and display optional images for reviews (book cover attachment) and user profiles (avatar), stored and served directly from the backend.

**Planned changes:**
- Backend: extend the `Review` model and canister methods to accept, validate (type/size), store, and return an optional book cover image with reviews.
- Frontend: update the “Write a Review” form to allow selecting an optional cover image with client-side validation and preview before publishing.
- Frontend: render the cover image on review cards and the review detail page when present, with clean fallback when absent.
- Backend: extend `UserProfile` to include an optional avatar image and support saving/updating it via the existing authenticated profile save flow, with type/size validation.
- Frontend: update the profile setup/edit modal to upload an optional avatar with validation + preview, and display the saved avatar somewhere in the signed-in UI.

**User-visible outcome:** Signed-in users can attach a book cover image to a review and see it in the feed and detail pages, and can upload/update a profile picture that appears in the app, all without using external image hosting.
