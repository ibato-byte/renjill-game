#!/usr/bin/env python3
"""feed.json の「新作」（latest）を、公式サイトと同じ renjill-media/episodes.json の一番新しい公開済みの回に合わせる。
- 変わったときだけ app/feed.json を書き直す（codes・news など、ほかの項目はそのまま）。変わらなければ何もしない
- 新作のリンクは YouTube ショート（ID があれば）、なければ公式サイトのエピソード一覧
- 標準ライブラリだけ。GitHub Actions の feed-sync.yml が投稿のあと（12:40・19:40）に動かす

  python3 tools/feed_sync.py                 … episodes.json を取りに行く
  python3 tools/feed_sync.py --source FILE   … 手元のファイルで試す（ネットワークに出ない）
"""
import datetime as dt, json, os, pathlib, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
FEED = ROOT / "app" / "feed.json"
SRC = "https://raw.githubusercontent.com/ibato-byte/renjill-media/main/episodes.json"
SITE = "https://renjill.coana.co.jp/#episodes"
JST = dt.timezone(dt.timedelta(hours=9))


def text(v, lang):
    if isinstance(v, dict): return v.get(lang) or ""
    return v if isinstance(v, str) and lang == "ja" else ""


def latest_of(eps, today):
    done = [e for e in eps if isinstance(e, dict) and e.get("ep") and (e.get("date") or "")[:10] <= today]
    if not done: return None
    e = max(done, key=lambda x: x["date"][:10])
    ja = text(e.get("title"), "ja") or e.get("caption_ja") or ""
    en = text(e.get("title"), "en") or text(e.get("caption"), "en") or e.get("caption_en") or ""
    yt = e.get("youtube_id") or ""
    return {"date": e["date"][:10], "ja": ja, "en": en, "url": f"https://www.youtube.com/shorts/{yt}" if yt else SITE}


def main(argv):
    src = argv[argv.index("--source") + 1] if "--source" in argv else None
    raw = pathlib.Path(src).read_text(encoding="utf-8") if src else urllib.request.urlopen(SRC, timeout=30).read().decode("utf-8")
    data = json.loads(raw)
    eps = data if isinstance(data, list) else data.get("episodes", [])
    now = dt.datetime.now(JST)
    new = latest_of(eps, now.date().isoformat())
    feed = json.loads(FEED.read_text(encoding="utf-8"))
    changed = bool(new) and new != feed.get("latest")
    if changed:
        feed["latest"] = new
        feed["updated"] = now.isoformat(timespec="seconds")
        FEED.write_text(json.dumps(feed, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("feed.json の新作:", json.dumps(feed.get("latest"), ensure_ascii=False), "（更新）" if changed else "（変わらず）")
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a") as f: f.write(f"changed={'true' if changed else 'false'}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
