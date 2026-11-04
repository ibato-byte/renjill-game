# ゲームサイト（itch.io など）に出す版

`node portal/make.mjs` で、サイトごとの zip を `portal/dist/` に作る（中身は index.html 1枚）。
index.html は、公開中のゲーム https://hay-dash.coana.co.jp/?ref=<サイト名> を画面いっぱいに表示するだけ。
だから、ゲームを直して公開すれば、ゲームサイトの版も自動で新しくなる（zip を上げ直さなくてよい）。
どのサイトから来た人かは ?ref= で数える（src/1_data.js の REF_OK と qa/kpi.mjs の SRCS に同じ言葉を入れておく）。
