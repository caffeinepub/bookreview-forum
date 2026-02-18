# Specification

## Summary
**Goal:** Fix Internet Identity login so it works reliably on desktop/laptop browsers and provides clear, actionable feedback when it fails.

**Planned changes:**
- Reproduce and resolve the desktop/laptop Internet Identity authentication failure so the Login button completes the flow and the app switches to a non-anonymous identity without a hard refresh.
- Harden `AuthClient.login()` configuration to always supply correct, production-safe `identityProvider` and (when required) `derivationOrigin` values, including safe fallbacks when environment values are missing.
- Add resilient desktop/laptop login UX handling for common failure modes (popup blocked, interrupted login, stale authenticated state), including clear English error messages and useful console logs for debugging.

**User-visible outcome:** On Chrome/Safari (or Chrome/Firefox) on desktop/laptop, users can click Login and successfully authenticate with Internet Identity; authenticated-only features work immediately, and any login failures show a clear message with debug details logged to the console.
