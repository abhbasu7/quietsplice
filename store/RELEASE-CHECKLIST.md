# Release checklist — 1.3.1

## Prepared locally

- Scope restricted to YouTube and HBO Max/Max; unverified site access removed.
- Original icons and small promotional image.
- Privacy policy, store copy, and reviewer notes.
- Explicit runtime-file allowlist and verified release ZIP.
- Automated checks and recorded output in store/test-output.txt.
- No runtime dependencies, analytics, secrets, databases, or remote code.

## Publisher actions before submission

- Host PRIVACY.md publicly (GitHub Pages or another accessible website) and enter its URL in the dashboard.
- Set a working public support URL and verify support/contact fields in the dashboard.
- Run final 1.3.1 smoke checks on YouTube and HBO: mute, skip where offered, restore, pre-muted playback, consecutive ads, and fullscreen.
- Review generated store images. The screenshot is explicitly a simulated demo; replace/add real-service screenshots if desired, ensuring no account details are visible.
- Review all privacy and permission disclosures against the current dashboard questions.
- Confirm publisher account verification/2FA, upload the versioned ZIP, choose public visibility, and submit for review only after approval.

No store submission, external publication, GitHub repository creation, remote push, or license selection is performed by this preparation. GitHub source publication requires choosing a repository and, if desired, a source-code license. A public Git repository without a license does not grant an open-source license.

## Evidence limits

YouTube and HBO primary flows were reported working by the user. Automated checks do not establish compatibility with every current site variation. Final hardened build real-service smoke check remains pending because computer-control initialization was unavailable. Browser demo evidence is real DOM behavior on a simulated page, not live streaming-service integration.
