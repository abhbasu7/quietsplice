# Chrome Web Store submission copy

Name: QuietSplice — Ad Skip & Mute
Suggested category: Accessibility.
Language: English.
Short description: Skip available YouTube ads, mute detected YouTube and HBO Max ads, and skip HBO intros with clear status notices.

## Detailed description

Make ad breaks quieter on YouTube and HBO Max in your desktop browser.

QuietSplice mutes detected ad videos and displays a small Ad muted badge throughout the break. When the ad ends, it restores the previous mute state and displays Unmuting. Your volume setting stays unchanged; videos you already muted stay muted.

On YouTube, it activates the official Skip button once that control is visible and enabled. On HBO Max / Max, it also clicks the visible Skip Intro button. It does not skip HBO commercial breaks.

Muted and Unmuting announcements use an available local English voice. Visual status works without speech. YouTube's own speaker icon may not reflect the temporary video mute state.

No account, analytics, browsing-history storage or extension-initiated network requests. No subscription to this extension is required. You still need access to the services and content you watch.

Important permission information: YouTube skipping uses Chrome's debugger API for browser-level mouse input. Chrome may display a debugging banner and a broad permission warning. The extension validates the visible control and detaches after the attempt. Close DevTools on the video tab if input is interrupted.

Desktop browser pages only; not TV/mobile native apps. Site layout changes can affect detection. Some ads may not be detected. This extension is independently developed and is not affiliated with YouTube, Google, HBO Max, or Warner Bros. Discovery.

## Single purpose

Reduce interruptions in supported video players by muting detected ad breaks and activating available ad-skip or intro-skip controls, with accessible status feedback.

## Permission justification: debugger

YouTube can ignore clicks sent by a page script. QuietSplice uses Chrome's debugger API to click the visible Skip button. It checks that the tab is on YouTube and that the button is available and unobstructed. It disconnects the debugger after each attempt.

## Site access

- YouTube. Detect ad breaks, mute the video, and click Skip when available.
- HBO Max and Max. Detect ad breaks, mute the video, and click Skip Intro when available.

## Privacy disclosures

QuietSplice reads player controls on the supported sites. It uses that information in the browser to mute and restore audio or click a player button. It stores no browsing history, sends no data to the developer, and runs only code included in the extension.

## Required publisher fields

Support URL: https://github.com/abhbasu7/quietsplice/issues
Privacy policy URL: https://github.com/abhbasu7/quietsplice/blob/main/PRIVACY.md
Homepage: https://github.com/abhbasu7/quietsplice
