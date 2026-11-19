# メニュー画面（ホーム）の見た目：絵のボタン（SVG）と並び。src/head.html の </style> の前に入れる CSS を作る
import urllib.parse, re, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
INK='#3B2A20'; GOLD='#E9B44C'; GOLDD='#C48E2B'; CREAM='#FBF6EE'; RED='#D9584C'; GREEN='#6DB36A'; BLUE='#5B8DBF'; BLUED='#355F86'; PAPER='#FFFFFF'
def svg(body): return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="%s" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">%s</svg>' % (INK, body)
IC = {
 'missions': f'<rect x="7" y="6" width="18" height="21" rx="3" fill="{CREAM}"/><rect x="12" y="3.5" width="8" height="5" rx="2" fill="{GOLD}"/><path d="M11.5 15.5l2.6 2.6 5.6-5.8" stroke="{GREEN}" stroke-width="2.6"/><path d="M11.5 22.5h9" stroke-width="1.8"/>',
 'stamps': f'<path d="M4.5 9l7.5-3 8 3 7.5-3v17l-7.5 3-8-3-7.5 3z" fill="{CREAM}"/><path d="M12 6v17M20 9v17" stroke-width="1.4" opacity=".55"/><path d="M16 21s5-4.6 5-8.4a5 5 0 0 0-10 0c0 3.800 5 8.400 5 8.400z" fill="{RED}"/><circle cx="16" cy="12.600" r="1.700" fill="{CREAM}" stroke="none"/>',
 'zukan': f'<path d="M16 9c-2.500-2-6-2.600-10-2v17c4-.6 7.500 0 10 2 2.500-2 6-2.600 10-2V7c-4-.6-7.500 0-10 2z" fill="{CREAM}"/><path d="M16 9v17" stroke-width="1.6"/><path d="M8.500 19c0-4 2-6.500 5-7.500 0 4-1.500 6.500-5 7.500z" fill="{GREEN}" stroke-width="1.5"/><path d="M19 13h4.500M19 17h4.500" stroke-width="1.6" opacity=".7"/>',
 'shop': f'<path d="M6 14v12h20V14" fill="{CREAM}"/><path d="M4 9.500L6.500 5h19L28 9.500v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" fill="{GOLD}"/><path d="M10 5.500v6M16 5.500v6M22 5.500v6" stroke-width="1.3" opacity=".6"/><rect x="13" y="18" width="6" height="8" rx="1" fill="{BLUE}"/>',
 'how': f'<circle cx="16" cy="16" r="11.500" fill="{BLUE}"/><path d="M12.300 12.800a3.800 3.800 0 1 1 5.600 3.400c-1.200.7-1.900 1.400-1.900 2.800" stroke="{CREAM}" stroke-width="2.600"/><circle cx="16" cy="22.700" r="1.500" fill="{CREAM}" stroke="none"/>',
 'rank': f'<path d="M5 11l5.500 5L16 7.500l5.500 8.500L27 11l-2.200 12.500H7.200z" fill="{GOLD}"/><path d="M8 26.500h16" stroke-width="2.400"/><circle cx="16" cy="18.500" r="1.800" fill="{RED}" stroke="none"/>',
 'name': f'<rect x="4.500" y="9" width="23" height="16" rx="3.500" fill="{CREAM}"/><path d="M4.500 13.500h23" stroke="none"/><path d="M5.500 9.800h21a2.500 2.500 0 0 1 1 2v2.200h-23v-2.200a2.500 2.500 0 0 1 1-2z" fill="{BLUE}" stroke="none"/><rect x="4.500" y="9" width="23" height="16" rx="3.500"/><path d="M13 5.500v5M19 5.500v5" stroke-width="2.200"/><path d="M9.500 19.500h13" stroke-width="2.400"/>',
 'chat': f'<path d="M5 8.500a3.500 3.500 0 0 1 3.500-3.500h15A3.500 3.500 0 0 1 27 8.500v9a3.500 3.500 0 0 1-3.500 3.500H15l-6 5.500V21h-.5A3.500 3.500 0 0 1 5 17.500z" fill="{CREAM}"/><circle cx="11" cy="13" r="1.600" fill="{INK}" stroke="none"/><circle cx="16" cy="13" r="1.600" fill="{INK}" stroke="none"/><circle cx="21" cy="13" r="1.600" fill="{INK}" stroke="none"/>',
 'records': f'<path d="M5 26.500h22"/><rect x="7" y="17" width="4.600" height="9.500" rx="1.200" fill="{CREAM}"/><rect x="13.700" y="11.500" width="4.600" height="15" rx="1.200" fill="{GOLD}"/><rect x="20.400" y="6" width="4.600" height="20.500" rx="1.200" fill="{RED}"/>',
 'practice': f'<path d="M9 28V4.500"/><path d="M9 6h13.500l-3 4.500 3 4.500H9z" fill="{GREEN}"/><path d="M5.500 28h8" stroke-width="2.400"/>',
 'rev': f'<path d="M24.500 16a8.500 8.500 0 1 1-2.700-6.200" stroke-width="2.600"/><path d="M24.800 5v6h-6" fill="none" stroke-width="2.600"/>',
 'sound': f'<path d="M5 12.500h4.500L15.500 7v18l-6-5.500H5z" fill="{CREAM}"/><path d="M19.500 12a5.500 5.500 0 0 1 0 8M22.800 8.500a10 10 0 0 1 0 15"/>',
 'mute': f'<path d="M5 12.500h4.500L15.500 7v18l-6-5.500H5z" fill="{CREAM}"/><path d="M20 12.500l7 7M27 12.500l-7 7" stroke="{RED}" stroke-width="2.400"/>',
 'gear': f'<path d="M16 4.500l2 .3.900 2.700 2.300 1 2.500-1.300 2.100 2.100-1.300 2.500 1 2.300 2.700.9v3l-2.700.9-1 2.300 1.300 2.500-2.100 2.100-2.500-1.300-2.300 1-.9 2.700h-3l-.9-2.700-2.300-1-2.500 1.300-2.100-2.100 1.300-2.500-1-2.300-2.700-.9v-3l2.700-.9 1-2.300L5.200 9.300l2.100-2.100 2.500 1.300 2.300-1 .9-2.700z" fill="{CREAM}" stroke-width="1.700"/><circle cx="16" cy="16.500" r="3.600" fill="{GOLD}"/>',
 'globe': f'<circle cx="16" cy="16" r="11" fill="{BLUE}"/><path d="M5 16h22M16 5c3.200 3 4.800 6.700 4.800 11S19.200 24 16 27c-3.200-3-4.800-6.700-4.800-11S12.800 8 16 5z" stroke="{CREAM}" stroke-width="1.800" fill="none"/><circle cx="16" cy="16" r="11"/>',
 'target': f'<circle cx="16" cy="16" r="11" fill="{CREAM}"/><circle cx="16" cy="16" r="7" fill="{RED}" stroke-width="1.6"/><circle cx="16" cy="16" r="3" fill="{CREAM}" stroke-width="1.4"/>',
 'leaf': f'<path d="M16 28V12" stroke="{GREEN}" stroke-width="2.4"/><path d="M16 14c-1-5 1-9 5-10 1 5-1 9-5 10zM16 19c-4-3-8-3-10-1 2 4 6 4 10 1zM16 22c3-3 7-4 10-2-2 4-6 4-10 2z" fill="{GREEN}" stroke="{INK}" stroke-width="1.4"/>',
 'hay': '',
}
def uri(k): return "url(\"data:image/svg+xml," + urllib.parse.quote(svg(IC[k]), safe="/:=' ,.-") .replace('%20',' ') + "\")"
css = open(HERE + '/home.css').read()
for k in IC: css = css.replace('ICON(%s)' % k, uri(k))
assert 'ICON(' not in css, re.findall(r'ICON\(\w+\)', css)
src = HERE + '/../../src/head.html'; s = open(src).read()
A = '/* ==== HOME-V2 START ==== */'; B = '/* ==== HOME-V2 END ==== */'
if A in s: s = s[:s.index(A)] + s[s.index(B) + len(B) + 1:]
i = s.rindex('</style>'); s = s[:i] + A + '\n' + css.strip() + '\n' + B + '\n' + s[i:]
open(src, 'w').write(s); print('css bytes', len(css))
