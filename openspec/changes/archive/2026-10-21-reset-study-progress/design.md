## Decisions

Reuse the existing Settings data section and Action components. Keep selection reset separate. Opening the confirmation never writes storage; confirm explicitly names all progress on this device and its irreversible nature. Disable duplicate actions during reset and show success only after deletion completes. Preserve unrelated storage keys.

Use the existing serialized review queue. Write a small durable reset-intent marker before deleting all catalog review keys, then remove the marker last. Reads and commits first complete any pending reset, so partial deletion cannot silently expose mixed old/new progress. An interrupted or failed reset remains retryable after restart. AsyncStorage multiRemove deletes only review keys, never global clear.

The shipped app currently has no account synchronization. Do not modify or publish the other session's uncommitted Supabase implementation. The UI explicitly says this device, with no promise to reset a future cloud account.
