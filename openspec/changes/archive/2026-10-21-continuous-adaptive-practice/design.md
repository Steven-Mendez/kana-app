## Decisions

Keep FSRS responsible for durable memory state. A separate weighted random sampler chooses from the exact session pool: unseen, difficult and long-unreviewed cards receive greater weight using ts-fsrs get_retrievability; the latest incorrect answer adds a temporary multiplier. Recently correct cards lose that multiplier. Exclude the immediately previous character when alternatives exist, and soften the second-most recent character. Every other selected character retains positive probability, including future-due cards. Free practice uses uniform random sampling with the same immediate-repeat protection.

Pass the next sampled card into the reducer as an action so reducer transitions remain deterministic. Retain immutable grades for the session summary and append prompts as needed. Accuracy divides by graded attempts, not selection size. Repeated mistakes remain separate attempts in the summary, but the mistake drill pool deduplicates identities.

Load saved progress once for a session, update the in-memory map from each successful commit, and block next/finish until persistence succeeds. Allow intentional early failures in the existing storage service. Before committing, check the saved state: new or due cards and Again update FSRS; additional successful answers before due only affect the transient session. Show distinct feedback for practice-only answers. Do not use an arbitrary 12-hour cooldown, response-time grading or changed retention/fuzz settings. Keep stable review identities on retries. Due-only dashboard entry rechecks eligibility once, then continues within that snapshot without introducing new kana.

Reuse the existing Action and styling components. Finish practice displays results even with an unanswered prompt; unfinished drafts do not count. Close continues to return to selection. No fixed total or completion progress bar is shown.

## Isolation

Implement and test in a clean worktree based on the committed app. Commit/push only this change; leave the other session's Supabase worktree untouched.

## Research review

The user supplied a hybrid-practice proposal. Adopt its anti-cramming separation: early successful repetitions do not produce extra FSRS events or increase stability; confirmed failures still inform the model. The installed ts-fsrs 5.4.2 already handles short-term stability and its actual formula includes a stability-dependent factor absent from the supplied example. Use its own recall probability rather than implementing a substitute forgetting curve.

Sources: [ts-fsrs API](https://open-spaced-repetition.github.io/ts-fsrs/classes/FSRS.html), installed version's `next_short_term_stability` and `get_retrievability` implementations. Sampling multipliers are explicit product heuristics, not scientifically optimized weights. Keep 90% retention, existing Good/Again grading and disabled fuzz; no evidence establishes the supplied speed thresholds or 94–95% target for this app. Free practice stays isolated; no new database fields or practice metrics are introduced during the separate Supabase integration.
