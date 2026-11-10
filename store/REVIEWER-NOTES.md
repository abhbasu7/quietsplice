# Reviewer notes

Buildooor 1.3.1 is a Manifest V3 desktop extension with no runtime dependencies or remotely hosted code. Its scope is YouTube and HBO Max/Max only.

YouTube: visit www.youtube.com, start an ad-supported video, and wait for a skippable ad. Ad inventory varies; a Skip control is not guaranteed on each play. The extension mutes detected ad playback and activates only the visible enabled Skip control. Already-muted playback remains muted. The badge persists until the ad ends plus a 1.2-second grace interval.

HBO: sign into your own HBO Max account with an ad-supported subscription and play content with an ad break. No credentials or subscriptions are bundled. The visible player-ux-ad-label triggers muting; its disappearance triggers restoration. The exact visible player-ux-skip-button with aria-label Skip Intro can be activated during an intro. HBO commercials are never skipped by the extension.

Close DevTools on the YouTube tab during skip testing. Chrome may display a debugging banner. The debugger worker accepts only same-extension, top-frame messages from www.youtube.com; independently validates origin and control state; and detaches in finally. A declined or unavailable permission produces a local diagnostic and retry backoff rather than continuous input.

Speech requires a local English system voice and may require interaction with the page. It is optional feedback; text and muting work without it. The extension does not collect, persist, or send user data. The source identifier returned by validation is held only during an attempt and is not logged or stored.

Automated Node tests and a standalone browser fixture cover local logic. User confirmed working YouTube and HBO primary flows before release hardening. Final 1.3.1 real-service smoke testing remains a publisher release gate. Store screenshots show the real badge script running in a clearly labelled simulated player, not a live HBO or YouTube session.
