# QuietSplice Ad Skip & Mute

A dependency-free desktop Chrome/Edge extension for quieter ad breaks on **YouTube and HBO Max / Max**.

- Mutes detected ad videos while preserving your volume and previous mute state.
- Shows **Ad muted** throughout the break and **Unmuting** when audio is restored.
- Activates YouTube's visible enabled Skip button using browser-level input.
- Clicks HBO's visible Skip Intro button. During HBO ads, it mutes the video.
- Optional spoken feedback uses an available local English voice. Without it, text feedback still works.

## Install locally

Extract the release ZIP into a permanent folder, or clone this repository. Open `chrome://extensions` or `edge://extensions`, enable Developer mode, choose Load unpacked, and select the folder containing manifest.json. Review the debugger permission, then refresh video tabs. Keep the folder in place. To update, replace the files, reload the extension, and refresh the tabs.

No Node, Python, server, account with this extension, or build step is needed to run it. Access to HBO content still requires the appropriate subscription.

## Permissions and privacy

YouTube can ignore synthetic clicks. QuietSplice uses Chrome's debugger permission to check and click the visible Skip button on YouTube. A debugging banner may appear. Close DevTools on the YouTube tab while skipping.

Site access is limited to YouTube and HBO Max/Max domains. Hulu, Rumble, Disney+, Prime Video, and Amazon are not supported in this release. No analytics, persistent storage, browsing-history collection, or extension-initiated network requests. See [Privacy policy](PRIVACY.md).

## Behavior and limits

The extension mutes the video element, not Chrome or your PC. YouTube's own speaker icon may not update. A 1.2-second grace interval prevents unmuting between consecutive ads. Existing mute settings and volume are preserved. Refreshing or disabling the extension mid-ad may require manually unmuting the player. Site changes, hidden ad indicators, and browser timer throttling can affect behavior. Native mobile/TV apps are not supported.

## Develop and package

Node.js 22+ runs `npm test` (no npm install needed). Python 3.10+ standard library runs `python scripts/package_release.py`. Add `--minimal` for a runtime-only unpacked-test ZIP. The packaging script uses a fixed allowlist, validates manifest paths, scans packaged text for common secret patterns, writes a versioned ZIP and SHA-256 to dist/, and lists every archive member. Generated dist files are ignored by Git. Icons were created using existing Pillow tooling; Pillow is not a runtime or packaging dependency.

The source repository includes tests, a clearly labelled standalone demo page, store assets, and submission copy. The release ZIP contains runtime files and the privacy policy only. No source-code license has been selected; choose one before describing a public repository as open source.

## Release 1.3.4

Use the QuietSplice message name for YouTube Skip and retry once when the background worker gives no reply.

## Release 1.3.2

Restrict site access to confirmed services; validate page origin and coordinates before YouTube input; back off after debugger failures; restore detached videos and remove notices on page exit; use only local English speech voices; add icons, release verification, and store materials.

Independent project; not affiliated with YouTube, Google, HBO Max, or Warner Bros. Discovery.

## Project and support

[Source repository](https://github.com/abhbasu7/quietsplice) · [Report an issue](https://github.com/abhbasu7/quietsplice/issues) · [Public privacy policy](https://github.com/abhbasu7/quietsplice/blob/main/PRIVACY.md)
