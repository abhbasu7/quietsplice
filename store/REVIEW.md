# Release review — 1.3.2

Reviewed runtime: manifest.json, background.js, content.js, ad-audio.js, hbo-intro.js and their tests. The loaded project E:/repos/ad-skip is the release repository. The earlier E:/repos/buildooor copy is not the commit or release target.

## Findings fixed

1. Unverified sites had content-script access. Removed Hulu, Disney+, Prime Video, Amazon, and their speculative shared markers. Release scope is the user-confirmed YouTube and HBO Max/Max implementation.
2. Debugger validation assumed its target was still YouTube. Added target-origin validation in the packaged inspection function and finite, nonnegative coordinate/source validation before input. Reject malformed tab identifiers. Existing sender/frame validation and hit testing remain.
3. Failed debugger access retried rapidly. Added 30-second error backoff and regression coverage; in-flight requests remain serialized in both content script and worker.
4. Page exit could announce Unmuting during navigation and retain its badge. Restore silently and clear the notice on pagehide. Handle pageshow, and restore/release detached video elements without reacquiring them.
5. Speech could select a remote default voice when no local English voice existed. Now speak only with an available local English voice. Speech errors cannot interrupt visual mute/restoration flow.
6. Release metadata and documentation were incomplete. Align package/manifest versions, set minimum Chrome 125, add original icons, store copy, privacy policy, support/privacy hosting instructions, CI, and an explicit allowlist packager.

## Verification

Full Node suite output: test-output.txt. Runtime JavaScript syntax checks pass. A separate headless Chrome run passed actual DOM/video mute-property and badge/restoration checks on tests/browser-check.html. Result and limits: browser-validation.json. Store screenshot was rendered from tests/browser-demo.html, clearly marked as simulated, and visually inspected with the promotional tile.

Archive listing/hash and allowlist/secret/CRC/source-byte checks: archive-contents.txt. No new runtime or packaging dependencies. Existing Pillow was used once to author icons/promo artwork; no dependency installation was needed.

## Remaining publication gates

The user's earlier YouTube and HBO live confirmations are recorded. Final hardened 1.3.2 live-service behavior, fullscreen on each real service, and trusted debugger input on the final build were not reverified because interactive browser tooling was unavailable. Synthetic/DOM/CDP mocks are labelled as such. Run the manual acceptance checklist before submission.

Repository supplied: https://github.com/abhbasu7/quietsplice. Support and privacy URLs are configured; verify them publicly after pushing. Publisher must complete truthful dashboard disclosures, review images/listing, and approve submission. No credentials, dummy URLs, or runtime placeholders are packaged. Source-code license selection remains the publisher's choice. No remote push, public publication, or store submission was performed.

Branding finalized as QuietSplice in 1.3.2; internal message names, metadata, images and archive names aligned. Runtime behavior remains the hardened 1.3.1 implementation.
