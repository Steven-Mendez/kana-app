# Tasks

- [x] 1. Implement SQLite/IndexedDB atomic account documents and account isolation.
- [x] 2. Migrate existing AsyncStorage records without deleting the originals.
- [x] 3. Implement explicit, repeatable guest import with existing-account preference precedence.
- [x] 4. Test transactional rollback, reopening, corrupt migration recovery, accepted/declined/repeated imports.
- [ ] 5. Verify SQLite durability after closing/reopening iOS and Android development builds.

- [x] 6. Integrate continuous practice, early failures and the legacy reset marker; verify account-scoped confirmed reset and preserved preferences.

Local verification is recorded in `docs/supabase-setup.md`. Keep this change active until its release verification is complete, then archive through OpenSpec.
