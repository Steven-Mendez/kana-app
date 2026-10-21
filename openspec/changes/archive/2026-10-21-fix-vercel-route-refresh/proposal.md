# Why

Refreshing an internal production URL returns a hosting 404 because Expo exports individual HTML files and Vercel is not configured to resolve their extensionless URLs.

# What Changes

- Enable Vercel clean URLs for the existing static Expo export.
- Preserve individual route documents, assets and unknown-path 404 behavior.

# Capabilities

## New Capabilities

None.

## Modified Capabilities

- `app-navigation`: direct requests and reloads resolve exported web routes.

# Impact

Only Vercel deployment configuration changes. A new deployment is required for production to receive the fix.
