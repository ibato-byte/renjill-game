/* [スタート 第 4 回] 2026-11-26 スタート画面の「数字の札」を押せるように（見るだけの札だった。押したくなる所なのに何も起きなかった）
   [スタート S32] 今日の目標の札を押すと、ミッションが開く [スタート S33] 昇進の帯を押すと、きろくが開く [スタート S34] ベストの札を押すと、ランキングが開く [スタート S35] チモシーの札を押すと、購買部が開く
   [スタート S36] 押せる札は、キーボード（Tab → Enter・スペース）でも押せる。読み上げにも「ボタン」と伝わる */
(function () {
  const st = document.getElementById('sTitle'); if (!st) return;
  const target = t => { if (!t || !t.closest) return ''; if (t.closest('#tToday')) return 'btnMissions'; if (t.closest('#tCareer')) return 'btnRecords'; const sp = t.closest('.bank>span:not(.tog)'); return sp ? (sp.querySelector('#tBank') ? 'btnShop' : 'btnRank') : ''; };
  const go = e => { if (e.target.closest('button,a,input')) return; const id = target(e.target), b = id && document.getElementById(id); if (b && !b.hidden && !b.disabled) b.click(); };
  st.addEventListener('click', go);
  st.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('hm-tap')) { e.preventDefault(); e.stopPropagation(); go(e); } });
  /* [スタート S54] スタート画面で、キーボードの ← → でキャラクターを切りかえ（パソコン。前は Tab で 1 つずつ動かすしかなかった） [スタート S55] 数字の 1・2・3 でも えらべる */
  document.addEventListener('keydown', e => { if (st.hidden || e.altKey || e.ctrlKey || e.metaKey || (e.target.closest && e.target.closest('input,textarea,select'))) return; for (const s of document.querySelectorAll('.screen')) if (s !== st && !s.hidden) return;
    const cs = [...st.querySelectorAll('.chars .char')].filter(c => c.offsetParent && !c.hidden); if (cs.length < 2) return; const cur = cs.findIndex(c => c.getAttribute('aria-pressed') === 'true'); let to = -1;
    if (e.key === 'ArrowLeft') to = (cur - 1 + cs.length) % cs.length; else if (e.key === 'ArrowRight') to = (cur + 1) % cs.length; else if (/^[1-3]$/.test(e.key) && +e.key <= cs.length) to = +e.key - 1;
    if (to >= 0 && to !== cur) { e.preventDefault(); cs[to].click(); } });
  /* [スタート S68] キャラクターをえらんだ時・数字の札を押した時に、指に小さくコツッと返す（設定の「振動」に従う。弱め・オフもそのまま効く） [スタート S69] スタートを押した時は少し長めに */
  st.addEventListener('click', e => { try { if (typeof buzz !== 'function') return; const t = e.target; if (t.closest('#btnStart')) buzz(14); else if (t.closest('.chars .char') || t.closest('.hm-tap') || t.closest('.row .mini, .row2 .sub')) buzz(8); } catch (x) { } }, true);
  const mark = () => { for (const e of st.querySelectorAll('#tToday, #tCareer .career, .bank>span:not(.tog)')) if (!e.classList.contains('hm-tap')) { e.classList.add('hm-tap'); e.setAttribute('role', 'button'); e.tabIndex = 0; } };
  /* [スタート S79] パソコン：絵だけの丸いボタン（音・設定）にマウスを乗せると、名前が出る */
  /* [スタート S88] 読み上げ：今日の札は「今日の目標 74,000、今日のチモシー 120/300。ミッションを開く」と 1 つにまとめて読む（前は、数字と名前がばらばらに読まれた） [スタート S89] 昇進の帯も「課長 Lv.7、次の昇進まで 2,126。きろくを開く」とまとめて読む
     [スタート S90] スタンプ帳・えさ図鑑のボタンにマウスを乗せると、集めた数（30 / 85）が出る。読み上げにも数が入る */
  const say = () => { try { const td = st.querySelector('#tToday'); if (td && !td.hidden) { const parts = [...td.querySelectorAll('.tt-c')].filter(c => c.offsetParent).map(c => (c.querySelector('small') || {}).textContent + ' ' + ((c.querySelector('b') || {}).textContent || '').replace(/\s+/g, '') + (c.classList.contains('ok') ? ' ✓' : '')); const lb = parts.join('、') + '。' + tr('ミッションを開く', 'Open missions'); if (td.getAttribute('aria-label') !== lb) td.setAttribute('aria-label', lb); }
      const cr = st.querySelector('#tCareer .career'); if (cr) { const lb = [...cr.querySelectorAll('.cr-t,.cr-lv,small')].map(e => e.textContent.trim()).filter(Boolean).join(' ') + '。' + tr('きろくを開く', 'Open records'); if (cr.getAttribute('aria-label') !== lb) cr.setAttribute('aria-label', lb); }
      { const sb = document.getElementById('btnStart'), ch = st.querySelector('.chars .char[aria-pressed="true"] .nm'); if (sb && ch) { const lb = ch.textContent.trim() + ' ' + sb.textContent.trim(); if (sb.getAttribute('aria-label') !== lb) sb.setAttribute('aria-label', lb); } } /* [スタート S100] 読み上げ：スタートのボタンは「モチ スタート」と、だれで走るかも読む */
      for (const [id, n, m] of [['btnStamps', STAMP_ORDER.filter(k => SV.stamps[k]).length, STAMP_ORDER.length], ['btnZukan', ZUKAN_ORDER.filter(k => SV.zukan[k]).length, ZUKAN_ORDER.length]]) { const b = document.getElementById(id); if (!b) continue; const nm = (b.querySelector('em') || {}).textContent || '', tt = nm + ' ' + n + ' / ' + m; if (b.title !== tt) { b.title = tt; b.setAttribute('aria-label', tt); } } } catch (e) { } };
  const tips = () => { for (const id of ['btnMute', 'btnSet']) { const b = document.getElementById(id); if (!b) continue; const n = (b.getAttribute('aria-label') || b.textContent || '').trim(); if (n && b.title !== n) b.title = n; } };
  /* [スタート S80] チモシーの数がふえた時（走った後・ごほうびを受け取った後）、札から「+123」が小さくうき上がる（数字そのものは、すぐに新しい数になる） [スタート S81] ベストがふえた時は、札が金色に光る */
  const seen = { tBank: null, tBest: null }; const num = e => { const v = parseInt(String(e.textContent || '').replace(/[^0-9]/g, ''), 10); return isFinite(v) ? v : null; };
  const bump = () => { for (const id of ['tBank', 'tBest']) { const e = document.getElementById(id); if (!e) continue; const v = num(e), p = seen[id]; seen[id] = v; if (v == null || p == null || v <= p || st.hidden) continue; const chip = e.closest('.bank>span'); if (!chip) continue;
      if (id === 'tBank') { const f = document.createElement('i'); f.className = 'hm-plus'; f.setAttribute('aria-hidden', 'true'); f.textContent = '+' + (v - p).toLocaleString('en-US'); chip.appendChild(f); setTimeout(() => f.remove(), 1500); } else { chip.classList.remove('hm-up'); void chip.offsetWidth; chip.classList.add('hm-up'); setTimeout(() => chip.classList.remove('hm-up'), 2200); } } };
  /* [スタート S82] スタンプ帳のボタンのふちに、集めたスタンプの割合の輪（赤）。[スタート S83] えさ図鑑のボタンのふちに、見つけたえさの割合の輪（緑）。数字ではなく、輪の長さで「どのくらい集まったか」が分かる。全部そろうと金色 */
  const ring = () => { try { const set = (id, k) => { const b = document.getElementById(id); if (!b) return; let r = b.querySelector('.hm-pg'); if (!r) { r = document.createElement('i'); r.className = 'hm-pg'; r.setAttribute('aria-hidden', 'true'); b.appendChild(r); } const w = parseFloat(getComputedStyle(b, '::before').width) || 50; const kk = Math.max(0, Math.min(1, k)).toFixed(3), key = w + '|' + kk; if (r.dataset.k === key) return; r.dataset.k = key; r.style.width = r.style.height = w + 'px'; r.style.setProperty('--pg', kk); r.classList.toggle('full', k >= 1); };
      set('btnStamps', STAMP_ORDER.filter(id => SV.stamps[id]).length / Math.max(1, STAMP_ORDER.length)); set('btnZukan', ZUKAN_ORDER.filter(id => SV.zukan[id]).length / Math.max(1, ZUKAN_ORDER.length)); } catch (e) { } };
  addEventListener('resize', () => setTimeout(ring, 60));
  /* [スタート S98] ゲームを開いたまま別の画面へ行って、もどって来た時：スタート画面の数（今日の目標・今日のチモシー・チャレンジ）を読み直す（前は、もどっても開いた時のまま）
     [スタート S99] スタート画面を開いたまま日付が変わった時：1 分以内に「今日」の数を新しい日に切りかえる（前は、前の日の「300/300 ✓」が出たままだった） */
  const fresh = () => { try { if (st.hidden || typeof G === 'undefined' || G.mode !== 'title') return; for (const s2 of document.querySelectorAll('.screen')) if (s2 !== st && !s2.hidden) return; refreshTitle(); } catch (e) { } };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) fresh(); });
  { let day = ''; try { day = todayStr(); } catch (e) { } setInterval(() => { try { const d = todayStr(); if (d !== day) { day = d; fresh(); } } catch (e) { } }, 60000); }
  /* [よみ R122] 2026-11-28 左の列のボタンの名前（英語の「How to play」など）が、字の形によっては丸より広く、画面の左はしから 2px 出た（CI の機械）。はしから出る時だけ、名前の札を内側へずらす（丸はそのまま） */
  const keepIn = () => { try { for (const e of st.querySelectorAll('.row .mini em')) { if (e.style.transform) e.style.transform = ''; if (!e.offsetParent) continue; const r = e.getBoundingClientRect(), m = 3; let dx = 0; if (r.left < m) dx = m - r.left; else if (r.right > innerWidth - m) dx = innerWidth - m - r.right; if (dx) e.style.transform = 'translateX(' + dx.toFixed(1) + 'px)'; } } catch (e) { } };
  addEventListener('resize', () => setTimeout(keepIn, 80)); try { document.fonts && document.fonts.ready.then(() => keepIn()); } catch (e) { }
  mark(); tips(); bump(); ring(); say(); keepIn(); try { new MutationObserver(() => { mark(); tips(); bump(); ring(); say(); keepIn(); }).observe(st, { childList: true, subtree: true, characterData: true }); } catch (e) { }
})();
