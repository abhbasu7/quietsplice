# Privacy policy — Buildooor Ad Skip & Mute

Effective date: November 9, 2026. Applies to version 1.3.1.

Buildooor runs locally in desktop Chrome/Edge on YouTube and HBO Max/Max pages. It detects player controls and ad labels, mutes detected ad videos, shows status notices, and can activate YouTube Skip and HBO Skip Intro controls.

## Data use

The extension does not collect or transmit personal information to its developer or any analytics service. It has no account, advertising, analytics, telemetry, remote configuration, or extension-initiated network requests. It does not store browsing history or use persistent storage.

Player state, video source identifiers and control coordinates are processed temporarily in memory to identify a control and check a playback transition. They are not sent to a server or saved. Diagnostic results and error messages may appear in the local browser developer console. If you choose to share logs or screenshots in a support issue, review them first; third-party website content may contain personal information.

## Permissions

Site access is requested only for www.youtube.com and max.com/hbomax.com subdomains and apex domains. The debugger permission is used only to validate YouTube's visible Skip control, send mouse input to it, and check the resulting state. Chrome's permission warning describes broader access than this implementation uses. The worker rejects requests from other sites, frames and extensions, accepts no arbitrary coordinates or commands, and detaches after each attempt.

## Audio and speech

Muting changes the webpage video element, not your computer or browser-wide volume. Its prior mute state is restored after a detected break. Announcements use an available local English speech-synthesis voice only; no voice is requested when one is unavailable. Speech processing is provided by the browser and operating system. Notices remain visible without speech.

## Third-party services and control

YouTube and HBO Max remain governed by their own privacy policies; this extension does not change their data practices. Disable or remove the extension using your browser's extensions page. There is no stored user data to delete. Refreshing or removing the extension during an ad may require manually restoring the player's mute state.

## Contact and changes

Use the support link on the extension's Chrome Web Store listing to contact the publisher. This policy must be hosted at the URL supplied in that listing. Material changes will be reflected in this document and the store disclosures before release.
