# Buildooor Ad Skip & Mute

A dependency-free desktop Chrome/Edge extension for quieter ad breaks on **YouTube and HBO Max / Max**.

- Mutes detected ad videos while preserving your volume and previous mute state.
- Shows **Ad muted** throughout the break and **Unmuting** when audio is restored.
- Activates YouTube's visible enabled Skip button using browser-level input.
- Clicks HBO's visible Skip Intro control; HBO commercial breaks are muted, not skipped.
- Optional spoken feedback uses an available local English voice. Without it, text feedback still works.

## Install locally

Extract the release ZIP into a permanent folder, or clone this repository. Open `chrome://extensions` or `edge://extensions`, enable Developer mode, choose Load unpacked, and select the folder containing manifest.json. Review the debugger permission, then refresh video tabs. Keep the folder in place. To update, replace the files, reload the extension, and refresh the tabs.

No Node, Python, server, account with this extension, or build step is needed to run it. Access to HBO content still requires the appropriate subscription.

## Permissions and privacy

YouTube can ignore synthetic clicks. The debugger permission lets the worker independently validate and activate the official visible Skip control using browser-level input. Chrome's warning describes broad debugger capabilities; this implementation is restricted to YouTube and fixed commands. A debugging banner may appear. Close DevTools on the YouTube tab while skipping.

Site access is limited to YouTube and HBO Max/Max domains. Hulu, Rumble, Disney+, Prime Video, and Amazon are not supported in this release. No analytics, persistent storage, browsing-history collection, or extension-initiated network requests. See [Privacy policy](PRIVACY.md).

## Behavior and limits

The extension mutes the video element, not Chrome or your PC. YouTube's own speaker icon may not update. A 1.2-second grace interval prevents unmuting between consecutive ads. Existing mute settings and volume are preserved. Refreshing or disabling the extension mid-ad may require manually unmuting the player. Site changes, hidden ad indicators, and browser timer throttling can affect behavior. Native mobile/TV apps are not supported.

The user confirmed YouTube and HBO primary flows during development. Release hardening has automated regression coverage. Final version 1.3.1 live-service smoke testing remains pending; see [release checklist](store/RELEASE-CHECKLIST.md).

## Develop and package

Node.js 22+ runs `npm test` (no npm install needed). Python 3.10+ standard library runs `python scripts/package_release.py`. The packaging script uses a fixed allowlist, validates manifest paths, scans packaged text for common secret patterns, writes dist/buildooor-1.3.1.zip and SHA-256, and lists every archive member. Generated dist files are ignored by Git. Icons were created using existing Pillow tooling; Pillow is not a runtime or packaging dependency.

The source repository includes tests, a clearly labelled standalone demo page, store assets, and submission copy. The release ZIP contains runtime files and the privacy policy only. No source-code license has been selected; choose one before describing a public repository as open source.

## Release 1.3.1

Restrict site access to confirmed services; validate page origin and coordinates before YouTube input; back off after debugger failures; restore detached videos and remove notices on page exit; use only local English speech voices; add icons, release verification, and store materials.

Independent project; not affiliated with YouTube, Google, HBO Max, or Warner Bros. Discovery.
