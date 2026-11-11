# Code review

- The extension runs on YouTube and HBO Max.
- Before clicking Skip, the YouTube worker checks the page address, button visibility, and click position.
- After a debugger error, the extension waits 30 seconds before trying again.
- When you leave the page, the extension restores the previous mute setting and removes its badge.
- Announcements use an English voice installed on the device.

The automated tests simulate the player and debugger. The Chrome demo checks muting, the badge, and audio restoration on a sample page. See [test output](test-output.txt), [browser check](browser-validation.json), and [archive contents](archive-contents.txt).
