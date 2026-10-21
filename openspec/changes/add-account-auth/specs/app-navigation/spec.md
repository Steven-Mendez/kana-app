## MODIFIED Requirements

### Requirement: Profile represents guest mode honestly

Profile SHALL show guest status or the restored account identity, current selection counts, and a working access entry. Guest study SHALL remain available without network access or automatic registration. Authenticated profiles SHALL show linked providers, synchronization status, linking and explicit sign-out. Profile SHALL NOT display invented statistics. A working practice action SHALL be available.

#### Scenario: Open guest profile

- **WHEN** the learner opens Profile
- **THEN** the guest screen shows the local selection and explains that practice works without an account
- **AND** the sign-in entry opens Google access and guest study, with Apple and email-code access only when individually enabled
- **AND** returning to practice preserves the selection
