# Reviewer notes

QuietSplice runs on desktop YouTube and HBO Max.

On YouTube, play a video with a skippable ad. QuietSplice mutes the video and clicks Skip when the button becomes available. Close DevTools on that tab so the extension can use Chrome's debugger API.

On HBO Max, play a title with an ad break on an ad-supported account. Look for the Ad muted badge during the break. The extension restores the previous mute setting when the show resumes. For an episode with a Skip Intro button, check that the intro advances when the button appears.

The debugger runs only for YouTube Skip. The extension checks the page and button position before sending the click, then disconnects the debugger. The extension waits 30 seconds after a debugger error before trying again.

Spoken notices use a local English voice if one is available. The store screenshot shows the badge on a simulated player.
