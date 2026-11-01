# SEO for the public app (app/): the game page's title/description/structured data, a crawlable guide page in Japanese and English,
# robots.txt and sitemap.xml. Called from build.py. Text only says true things about the game (no ratings, no fake reviews).
import json, html, datetime, os
SITE = 'https://hay-dash.coana.co.jp/'
TODAY = datetime.date.today().isoformat()
PLACES = json.load(open('seo_places.json')) if os.path.exists('seo_places.json') else []
INDEXNOW_KEY = '7f3c9b2e5a1d4c8e9b6a2f1e3d5c7a9b'  # public by design: proves the site owner pings IndexNow (Bing etc.)

TITLE_JA = 'レンとジルのチモシーダッシュ｜無料のうさぎランゲーム（スマホ・PCですぐ遊べる）'
DESC_JA = ('うさぎの課長レンと部下ジルが、チモシーを集めながら東京をかけぬける無料のランゲーム。登録なし・ダウンロードなしで、'
           'スマホでもPCでもブラウザですぐ遊べます。浅草・渋谷・東京タワー・空港など{n}か所以上の名所、季節のイベント、みんなのランキング。').format(n=max(80, len(PLACES)) // 10 * 10)
DESC_EN = ('A free runner game: two office bunnies dash across Tokyo collecting hay. No sign-up or download, play in your phone or PC browser. '
           '{n}+ Tokyo spots and a leaderboard.').format(n=max(80, len(PLACES)) // 10 * 10)

def game_ld():
  return {
    '@context': 'https://schema.org', '@type': ['VideoGame', 'WebApplication'], 'name': 'レンとジルのチモシーダッシュ', 'alternateName': ['Ren & Jill: Hay Dash', 'チモシーダッシュ'],
    'url': SITE, 'image': SITE + 'og.png', 'description': DESC_JA, 'inLanguage': ['ja', 'en'], 'genre': ['ランゲーム', 'Endless runner', 'Casual'],
    'gamePlatform': ['Web browser', 'iPhone', 'Android', 'PC'], 'applicationCategory': 'GameApplication', 'operatingSystem': 'Any (web browser)',
    'playMode': 'SinglePlayer', 'isAccessibleForFree': True, 'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'JPY'},
    'character': [{'@type': 'Person', 'name': 'レン（Ren）', 'description': 'ホーランドロップのうさぎの課長'}, {'@type': 'Person', 'name': 'ジル（Jill）', 'description': 'ネザーランド・ドワーフのうさぎの部下'}],
    'dateModified': TODAY,
  }

def head_tags():
  ld = json.dumps(game_ld(), ensure_ascii=False)
  return ('<title>%s</title><link rel="canonical" href="%s">' % (html.escape(TITLE_JA), SITE) +
          '<meta name="robots" content="index,follow,max-image-preview:large">'
          '<script type="application/ld+json">%s</script>' % ld)

def noscript():
  return ('<noscript><div style="max-width:560px;margin:40px auto;padding:20px;background:#FFF7E8;color:#3B2A20;border-radius:16px;font-family:sans-serif">'
          '<h1>レンとジルのチモシーダッシュ</h1><p>%s</p><p>このゲームは JavaScript をオンにすると遊べます。<a href="guide">遊び方とキャラクター紹介</a>・<a href="ranking">みんなのランキング</a></p></div></noscript>') % html.escape(DESC_JA)

CSS = ''':root{--ink:#3B2A20;--soft:#7A6550;--paper:#FFF7E8;--line:#E3D3BC;--gold:#C9962F;--tie:#D9A21B}
*{box-sizing:border-box}body{margin:0;background:#F4ECE0;color:var(--ink);font-family:"Zen Maru Gothic","Hiragino Sans","Noto Sans CJK JP","Noto Sans JP",system-ui,sans-serif;line-height:1.75}
main{max-width:760px;margin:0 auto;padding:16px 16px 56px}a{color:#2D6CB5}
header{text-align:center;padding:22px 0 8px}header small{letter-spacing:.2em;color:var(--soft);font-weight:800}header h1{margin:6px 0 4px;font-size:clamp(24px,6.6vw,38px);line-height:1.3;word-break:keep-all}header p{margin:0;color:var(--soft);font-weight:700}
.play{display:block;margin:18px auto 8px;max-width:360px;text-align:center;background:var(--ink);color:#fff;text-decoration:none;font-weight:900;font-size:20px;padding:14px;border-radius:16px;box-shadow:0 4px 0 #1c140f}
.lang{text-align:center;font-size:14px;margin:4px 0 0}
section{background:var(--paper);border:2px solid var(--line);border-radius:18px;padding:18px 18px 12px;margin:16px 0}
h2{font-size:21px;margin:0 0 8px}h3{font-size:17px;margin:12px 0 2px}p{margin:6px 0 10px}
.chars{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}.chars figure{margin:0;background:#fff;border-radius:14px;padding:10px;text-align:center;border:2px solid var(--line)}
.chars img{width:100%;max-width:200px;height:auto;aspect-ratio:1/1}.chars figcaption{font-size:14px;text-align:left}.chars b{font-size:17px}
ul{padding-left:1.2em;margin:6px 0 10px}.places{columns:2;column-gap:20px;font-size:14px}.places li{break-inside:avoid;margin:0 0 6px}
dt{font-weight:900;margin-top:10px}dd{margin:2px 0 8px}footer{text-align:center;color:var(--soft);font-size:13px;margin-top:24px}
@media (max-width:480px){.places{columns:1}}'''

def page(lang):
  ja = lang == 'ja'; L = (lambda a, b: a if ja else b)
  url = SITE + ('guide' if ja else 'guide-en')
  title = L('遊び方とキャラクター紹介｜レンとジルのチモシーダッシュ（無料のうさぎランゲーム）', 'Ren & Jill: Hay Dash – free bunny runner game | How to play')
  desc = L(DESC_JA, DESC_EN)
  faq = [
    (L('無料で遊べますか？', 'Is it free?'), L('はい。すべて無料で遊べます。課金や広告はありません。', 'Yes. Everything is free to play, with no in-app purchases or ads.')),
    (L('登録やダウンロードは必要ですか？', 'Do I need to sign up or download anything?'), L('いりません。ブラウザでページを開くだけで遊べます。ホーム画面に追加すると、アプリのように起動でき、電波がなくても遊べます。', 'No. Just open the page in your browser. Add it to your home screen to launch it like an app, even offline.')),
    (L('スマホでもPCでも遊べますか？', 'Can I play on a phone and a PC?'), L('はい。スマホはスワイプ、PCは矢印キー（またはWASD）で操作します。', 'Yes. Swipe on a phone; use the arrow keys (or WASD) on a PC.')),
    (L('機種変更したらデータはどうなりますか？', 'What happens to my progress if I change phones?'), L('前の端末で ⚙ →「引き継ぎコードを出す」を押し、新しい端末で ⚙ →「この端末に引き継ぐ」に8文字のコードを入れると、続きから遊べます（ログイン不要）。', 'On the old device tap ⚙ → “Get a transfer code”, then on the new one tap ⚙ → “Move progress here” and enter the 8 letters. No sign-in needed.')),
    (L('ランキングはありますか？', 'Is there a leaderboard?'), L('あります。アプリ版で遊ぶと記録がのり、だれでも「みんなのランキング」で見られます（今月・歴代）。名前は12文字までで、決めていない人は番号で表示されます。', 'Yes. Runs in the app version go on the public leaderboard (this month and all time). Names are up to 12 characters; unnamed players show as a number.')),
    (L('友だちと競えますか？', 'Can I challenge friends?'), L('結果をシェアすると、リンクにあなたの点数が入ります。開いた人に「挑戦状」が届き、こえるとクリアです。', 'When you share a result, the link carries your score. Whoever opens it gets a challenge to beat it.')),
  ]
  ld = [{'@context': 'https://schema.org', '@type': 'FAQPage', 'inLanguage': lang, 'mainEntity': [{'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faq]},
        {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': 1, 'name': L('チモシーダッシュ', 'Hay Dash'), 'item': SITE}, {'@type': 'ListItem', 'position': 2, 'name': L('遊び方', 'How to play'), 'item': url}]}]
  places = ''.join('<li><b>%s</b>：%s</li>' % (html.escape(p['ja']), html.escape(p['nja'])) if ja else '<li><b>%s</b>: %s</li>' % (html.escape(p['en']), html.escape(p['nen'])) for p in PLACES)
  e = html.escape
  body = f'''<main>
<header><small>REN &amp; JILL ・ HAY DASH</small><h1>{L('レンとジルの<wbr>チモシーダッシュ', 'Ren &amp; Jill: Hay Dash')}</h1><p>{L('寝坊した課長と、東京をかけぬけて出社！ 無料のうさぎランゲーム', 'Two office bunnies, one mad dash across Tokyo. A free runner game.')}</p></header>
<a class="play" href="./{'' if ja else '?lang=en'}">{L('今すぐ無料で遊ぶ ▶', 'Play free now ▶')}</a>
<p class="lang">{L('<a href="guide-en" hreflang="en">English</a>', '<a href="guide" hreflang="ja">日本語</a>')} ・ <a href="ranking">{L('みんなのランキング', 'Leaderboard')}</a></p>
<section><h2>{L('どんなゲーム？', 'What is it?')}</h2>
<p>{L('朝8時、うさぎの課長レンが寝坊！ 部下のジルといっしょに、家から駅、電車、オフィス、そして夕方の東京の名所までを走りぬけます。道に落ちているチモシー（うさぎの主食の牧草）を集め、障害物をよけて、できるだけ遠くまで進みましょう。',
 'It is 8 a.m. and Ren, the boss bunny, has overslept! With his assistant Jill he races from his home to the station, onto the train, through the office and out to Tokyo sights in the evening. Grab the hay (a rabbit’s staple food) along the way, dodge everything else and see how far you get.')}</p>
<p>{L('遊ぶたびに行き先が変わり、分かれ道で寄り道を選べます。季節ごとに限定の帽子や飾りが登場します。', 'The route changes every run and you choose detours at forks. Each season brings limited-time hats and decorations.')}</p></section>
<section><h2>{L('遊び方', 'How to play')}</h2><ul>
<li>{L('<b>左右にスワイプ</b>（矢印キー ← →）：レーンを変えてよける', '<b>Swipe left/right</b> (arrow keys ← →): change lanes to dodge')}</li>
<li>{L('<b>上にスワイプ</b>（↑）：ジャンプ。<b>下にスワイプ</b>（↓）：スライディング', '<b>Swipe up</b> (↑): jump. <b>Swipe down</b> (↓): slide')}</li>
<li>{L('<b>曲がり角</b>では矢印の方向へスワイプ', 'At a <b>corner</b>, swipe the way the arrow points')}</li>
<li>{L('チモシーを食べるとゲージがたまり、いっぱいになると<b>もぐもぐフィーバー</b>（ぶつかっても平気・スコア2倍）', 'Eating fills the munch meter; when it is full you get a <b>munch fever</b> (crash-proof, double score)')}</li>
<li>{L('うさぎが食べてはいけない物（チョコレートなど）をとると、ふらふらに。えさ図鑑で確かめよう', 'Food that is bad for rabbits (chocolate, for example) makes you woozy: check the food book')}</li></ul>
<p>{L('ミッション、スタンプ帳（名所のスタンプ集め）、えさ図鑑、購買部（帽子やネクタイの着せ替え）もあります。', 'There are missions, a stamp book of Tokyo sights, a food book and a shop with hats and ties to dress up in.')}</p></section>
<section><h2>{L('キャラクター', 'Characters')}</h2><div class="chars">
<figure><img src="img/ren.webp" width="200" height="200" alt="{L('レン：ネクタイをしたホーランドロップのうさぎ', 'Ren: a Holland Lop bunny in a tie')}" loading="lazy"><figcaption><b>{L('レン', 'Ren')}</b><br>{L('課長・ホーランドロップ。たれ耳とネクタイがトレードマーク。牧草が大好きで、チモシーが20%多くもらえる。', 'The boss, a Holland Lop with floppy ears and a tie. A hay lover: +20% hay.')}</figcaption></figure>
<figure><img src="img/jill.webp" width="200" height="200" alt="{L('ジル：丸メガネと社員証のネザーランド・ドワーフのうさぎ', 'Jill: a Netherland Dwarf bunny with round glasses and an ID badge')}" loading="lazy"><figcaption><b>{L('ジル', 'Jill')}</b><br>{L('部下・ネザーランド・ドワーフ。立ち耳に丸メガネと社員証。段取り上手で、パワーアップが30%長く続く。', 'His assistant, a Netherland Dwarf with upright ears, round glasses and an ID badge. Organized: power-ups last 30% longer.')}</figcaption></figure>
<figure><img src="img/pom.webp" width="200" height="200" alt="{L('ポム：赤いはちまきのキンクマハムスター', 'Pom: a golden hamster in a red sweatband')}" loading="lazy"><figcaption><b>{L('ポム', 'Pom')}</b><br>{L('体育会系の新入社員、キンクマハムスター。走っていると、どこかで会えるかも。会えたら、ポムでも走れるようになる。', 'The sporty new hire, a golden hamster. You might bump into him on the road, and once you have, you can run as Pom too.')}</figcaption></figure></div></section>
<section><h2>{L('走れる東京の名所', 'Tokyo spots on the way')}</h2><p>{L(f'スタンプ帳に集められる場所は{len(PLACES)}か所。一部を紹介します。', f'{len(PLACES)} places to collect in the stamp book. Some of them:')}</p><ul class="places">{places}</ul></section>
<section><h2>{L('よくある質問', 'FAQ')}</h2><dl>{''.join(f'<dt>{e(q)}</dt><dd>{e(a)}</dd>' for q, a in faq)}</dl></section>
<a class="play" href="./{'' if ja else '?lang=en'}">{L('今すぐ無料で遊ぶ ▶', 'Play free now ▶')}</a>
<footer>{L('えさの情報は一般的な目安です（出典：長野県動物愛護センター）。', 'Food notes are general guidance (source: Nagano Prefecture Animal Welfare Center).')}<br>© Ren &amp; Jill</footer>
</main>'''
  return f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(desc)}"><link rel="canonical" href="{url}">
<link rel="alternate" hreflang="ja" href="{SITE}guide"><link rel="alternate" hreflang="en" href="{SITE}guide-en"><link rel="alternate" hreflang="x-default" href="{SITE}guide">
<meta property="og:type" content="article"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{SITE}og.png"><meta property="og:locale" content="{L('ja_JP', 'en_US')}">
<meta name="twitter:card" content="summary_large_image"><link rel="icon" href="./favicon.png"><meta name="theme-color" content="#3B2A20">
<style>{CSS}</style><script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script></head><body>{body}</body></html>'''

def write(app='app'):
  open(f'{app}/guide.html', 'w').write(page('ja')); open(f'{app}/guide-en.html', 'w').write(page('en'))
  open(f'{app}/robots.txt', 'w').write(f'User-agent: *\nAllow: /\nDisallow: /feed.json\n\nSitemap: {SITE}sitemap.xml\n')
  urls = [('', '1.0', 'daily'), ('guide', '0.8', 'weekly'), ('guide-en', '0.7', 'weekly'), ('ranking', '0.6', 'daily')]
  open(f'{app}/sitemap.xml', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ''.join(f'  <url><loc>{SITE}{u}</loc><lastmod>{TODAY}</lastmod><changefreq>{f}</changefreq><priority>{p}</priority></url>\n' for u, p, f in urls) + '</urlset>\n')
  open(f'{app}/{INDEXNOW_KEY}.txt', 'w').write(INDEXNOW_KEY)
