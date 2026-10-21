## Decisions

Adapt the original focused drill and summary patterns as React Native components. Keep the current native TextInput and Action components: they already implement focus continuity, accessibility, and keyboard submission across platforms. No new picker/sheet/control library is needed.

The input remains mounted across prompt changes. Its row reserves equal side slots and the submit slot remains present after grading, removing horizontal recentering. A feedback component reserves two lines at ordinary font sizes and expands for long answers or accessibility text. The kana and input underline use success/error roles; text feedback continues to carry the meaning without color.

Keep the existing measured keyboard viewport sizing and all reducer/persistence guards. Use immediate state feedback without new animation dependencies or delayed typing. Extract only cohesive presentation components; do not rewrite the state machine.

Compute current and best session streak from immutable grades, with revealed answers breaking the streak. No timers or historical streak storage. Results show accuracy, correct/incorrect counts, best streak, and each mistake's original submitted answer (or revealed marker) next to the canonical correction. Existing mistake-review/repeat semantics stay unchanged.

The active continuous-input and Practice redesign changes are existing baseline work. Preserve their behavior and leave their archives to their owning work; only archive this change after validation.
