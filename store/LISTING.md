# Chrome Web Store submission copy

Name: QuietSplice — Ad Skip & Mute
Category suggestion: Accessibility (publisher must select the appropriate current dashboard category).
Language: English.
Visibility: Public after publisher approval.
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

Required to activate YouTube's visible enabled Skip control using browser-level input when synthetic DOM clicks are ignored. A top-frame content script sends a fixed request; the service worker independently validates the target, calculates coordinates, checks visibility and hit testing, rechecks after hover, sends Input.dispatchMouseEvent, checks a transition, and detaches. Runtime.evaluate executes only validation code shipped in the extension. No page-supplied commands, arbitrary coordinates, remote code, network instrumentation, or other-site debugging is accepted.

## Site-access justification

www.youtube.com: detect/mute ads and locate available Skip controls.
*.hbomax.com and *.max.com (including apex): detect the visible Ad label, mute and restore ad audio, and activate the exact Skip Intro control. No access is requested for Hulu, Rumble, Disney+, Amazon or other unverified services.

## Privacy dashboard answers to verify against current form

No user data is collected/transmitted to the developer. The extension processes website/player state locally and transiently for its stated purpose. No data is sold, used for unrelated purposes, or used to determine creditworthiness. All extension logic is packaged locally; no remotely hosted code is used. Publisher must review the exact dashboard questions and answer consistently with PRIVACY.md and the submitted code.

## Required publisher fields

Support URL: https://github.com/abhbasu7/quietsplice/issues
Privacy policy URL: https://github.com/abhbasu7/quietsplice/blob/main/PRIVACY.md
Homepage: https://github.com/abhbasu7/quietsplice
Verify all links while signed out after pushing main and before submitting the store listing.
