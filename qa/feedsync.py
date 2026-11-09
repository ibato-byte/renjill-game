# feed_sync の点検（2026-11-09）：新作のリンク先の動画が削除・非公開なら、その回はとばして前の見られる回にする。ネットには出ない
import importlib.util, pathlib, sys
p = pathlib.Path(__file__).resolve().parent.parent / "tools" / "feed_sync.py"
spec = importlib.util.spec_from_file_location("fs", p); fs = importlib.util.module_from_spec(spec); spec.loader.exec_module(fs)
eps = [{"ep": "a", "date": "2026-11-06", "title": {"ja": "全員に返信"}, "youtube_id": "OK1"}, {"ep": "b", "date": "2026-11-08", "title": {"ja": "了解です"}, "youtube_id": "GONE"}, {"ep": "c", "date": "2026-11-10", "title": {"ja": "未来"}, "youtube_id": "OK2"}]
alive = lambda y: y != "GONE"
a = fs.latest_of(eps, "2026-11-09", alive); b = fs.latest_of(eps, "2026-11-11", alive); c = fs.latest_of(eps, "2026-11-09", lambda y: True)
ok = a and a["ja"] == "全員に返信" and a["url"].endswith("OK1") and b["url"].endswith("OK2") and c["url"].endswith("GONE")
print(a, b, c); print("FEEDSYNC OK" if ok else "FEEDSYNC NG"); sys.exit(0 if ok else 1)
