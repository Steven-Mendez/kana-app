# Tasks

- [x] 1. Implement persistent event/settings queues and foreground/mutation/retry synchronization with backoff.
- [x] 2. Implement authenticated Edge reconciliation, deterministic FSRS replay and optimistic transactional commits.
- [x] 3. Verify concurrent/out-of-order reviews, lost acknowledgements, no-op retries, conflicts, settings ordering and disposed account loops.
- [x] 4. Document operation, data preservation and full-history synchronization limits.
- [ ] 5. Run the two-device offline/reconnect and account-switch acceptance matrix on development builds against staging.

- [x] 6. Implement and verify durable account reset identities, reset generations and rejection of stale-device events, including retries after background acknowledgement.

- [x] 7. Apply migrations to the authorized remote project, deploy with function-local Deno configuration, and verify remote schema, privileges and endpoint authentication.

Local verification is recorded in `docs/supabase-setup.md`. Keep this change active until its release verification is complete, then archive through OpenSpec.
