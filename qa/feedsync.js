// feed_sync の点検（python）：削除された動画を「新作」にしない
const { execFileSync } = require('child_process'); const path = require('path');
try { process.stdout.write(execFileSync('python3', [path.join(__dirname, 'feedsync.py')]).toString()); } catch (e) { process.stdout.write(String(e.stdout || '') + 'FEEDSYNC NG'); }
