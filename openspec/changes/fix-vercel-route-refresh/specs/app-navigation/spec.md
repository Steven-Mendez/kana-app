## ADDED Requirements

### Requirement: Static web routes resolve on direct requests

The production web host SHALL serve the exported HTML document for an existing route requested without its `.html` extension. This SHALL support direct links and browser refreshes for primary, secondary and nested routes. Static assets SHALL retain their paths and unknown paths SHALL NOT be rewritten to the home screen.

#### Scenario: Reload an internal route

- **WHEN** a learner opens or refreshes `/profile`, `/settings` or `/practice`
- **THEN** the host serves that route's exported document without a hosting 404

#### Scenario: Open a nested authentication callback

- **WHEN** the browser requests `/auth/callback` with authentication query parameters
- **THEN** the callback route loads and retains the query parameters for authentication handling

#### Scenario: Request an unknown route

- **WHEN** the browser requests a path that has no exported document
- **THEN** the host preserves not-found behavior instead of serving the home screen
