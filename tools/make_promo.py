#!/usr/bin/env python3
"""ゲームの紹介動画（app/promo/promo_s.mp4＝文字入り、promo_yt.mp4＝文字なし）を作り直す。

  python3 build.py && cp app/feed.json dist/
  node qa/promo_frames.js /tmp/promo/frames                 # ゲームの画面を 1 コマずつ（18 秒ぶん）
  node tools/promo_art.js dist/test.html /tmp/promo/art <フォントのフォルダ>   # 文字と、最後の 4 秒
  python3 tools/make_promo.py /tmp/promo/frames /tmp/promo/art app/promo

- 22 秒・1080×1920・30コマ/秒。音は tools/promo_bgm.m4a（前の紹介動画と同じ曲）。
- 見た目を大きく変えたら作り直す（古い見た目のままの紹介動画を出し続けない）。
- できあがりは自分で確かめる：長さ 22.0 秒・絵と音がある・最初と最後のコマが真っ黒でない（下の check）。
"""
import glob, json, os, shutil, subprocess, sys, tempfile

FPS = 30
# 文字を出す時間（秒）。場面の表（qa/promo_frames.js の PLAN）と合わせる
CAPS = [(0, 0.0, 3.0), (1, 6.0, 11.5), (2, 11.5, 14.5), (3, 14.5, 18.0)]
ENC = ["-c:v", "libx264", "-preset", "slow", "-crf", "23", "-maxrate", "3600k", "-bufsize", "7200k", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
       "-movflags", "+faststart", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-shortest"]
VF = "scale=in_color_matrix=bt601:in_range=pc:out_color_matrix=bt709:out_range=tv,format=yuv420p"


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit("ffmpeg が失敗: " + r.stderr[-600:])


def check(path):
    j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate,nb_frames", "-of", "json", path], capture_output=True, text=True).stdout)
    v = [s for s in j["streams"] if s["codec_type"] == "video"][0]; a = [s for s in j["streams"] if s["codec_type"] == "audio"]
    d = float(j["format"]["duration"]); bad = []
    if abs(d - 22.0) > 0.1: bad.append("長さ %.2f 秒" % d)
    if (v["width"], v["height"]) != (1080, 1920): bad.append("大きさ %sx%s" % (v["width"], v["height"]))
    if v["r_frame_rate"] != "30/1": bad.append("コマ数 " + v["r_frame_rate"])
    if not a: bad.append("音がない")
    for t in (0.2, 21.8):  # 最初と最後が真っ黒・真っ白でない
        y = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(t), "-i", path, "-frames:v", "1", "-vf", "scale=16:16,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
        if not y or max(y) - min(y) < 24: bad.append("%.1f 秒のコマが単色" % t)
    if bad: sys.exit(path + " が変: " + " / ".join(bad))
    print("OK", path, "%.2f 秒" % d, os.path.getsize(path) // 1024, "KB")


def main():
    frames, art, out = sys.argv[1:4]
    audio = os.path.join(os.path.dirname(os.path.abspath(__file__)), "promo_bgm.m4a")
    tmp = tempfile.mkdtemp(); n = 0
    for d in sorted(glob.glob(os.path.join(frames, "*/"))) + [os.path.join(art, "end/")]:
        for f in sorted(glob.glob(d + "*.jpg")):
            os.symlink(os.path.abspath(f), os.path.join(tmp, "%05d.jpg" % n)); n += 1
    if n != 22 * FPS: sys.exit("コマ数が %d（%d のはず）" % (n, 22 * FPS))
    base = ["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", os.path.join(tmp, "%05d.jpg")]
    # 文字なし（YouTube 用）
    run(base + ["-i", audio, "-vf", VF, "-map", "0:v", "-map", "1:a"] + ENC + [os.path.join(out, "promo_yt.mp4")])
    # 文字入り：文字は 0.18 秒でふわっと出て、0.15 秒で消える
    ins, fc, last = [], [], "[0:v]"
    for k, (i, t0, t1) in enumerate(CAPS):
        ins += ["-loop", "1", "-framerate", str(FPS), "-t", "%.3f" % (t1 - t0), "-i", os.path.join(art, "cap_%d.png" % i)]
        fc.append("[%d:v]format=rgba,fade=t=in:st=0:d=0.18:alpha=1,fade=t=out:st=%.3f:d=0.15:alpha=1,setpts=PTS+%.3f/TB[c%d]" % (k + 2, t1 - t0 - 0.15, t0, k))
        fc.append("%s[c%d]overlay=0:0:eof_action=pass[v%d]" % (last, k, k)); last = "[v%d]" % k
    fc.append("%s%s[vo]" % (last, VF))
    run(base + ["-i", audio] + ins + ["-filter_complex", ";".join(fc), "-map", "[vo]", "-map", "1:a"] + ENC + [os.path.join(out, "promo_s.mp4")])
    shutil.rmtree(tmp)
    for f in ("promo_yt.mp4", "promo_s.mp4"): check(os.path.join(out, f))


if __name__ == "__main__":
    main()
