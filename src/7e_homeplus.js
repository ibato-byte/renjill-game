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
  const tips = () => { for (const id of ['btnMute', 'btnSet']) { const b = document.getElementById(id); if (!b) continue; const n = (b.getAttribute('aria-label') || b.textContent || '').trim(); if (n && b.title !== n) b.title = n; } };
  /* [スタート S80] チモシーの数がふえた時（走った後・ごほうびを受け取った後）、札から「+123」が小さくうき上がる（数字そのものは、すぐに新しい数になる） [スタート S81] ベストがふえた時は、札が金色に光る */
  const seen = { tBank: null, tBest: null }; const num = e => { const v = parseInt(String(e.textContent || '').replace(/[^0-9]/g, ''), 10); return isFinite(v) ? v : null; };
  const bump = () => { for (const id of ['tBank', 'tBest']) { const e = document.getElementById(id); if (!e) continue; const v = num(e), p = seen[id]; seen[id] = v; if (v == null || p == null || v <= p || st.hidden) continue; const chip = e.closest('.bank>span'); if (!chip) continue;
      if (id === 'tBank') { const f = document.createElement('i'); f.className = 'hm-plus'; f.setAttribute('aria-hidden', 'true'); f.textContent = '+' + (v - p).toLocaleString('en-US'); chip.appendChild(f); setTimeout(() => f.remove(), 1500); } else { chip.classList.remove('hm-up'); void chip.offsetWidth; chip.classList.add('hm-up'); setTimeout(() => chip.classList.remove('hm-up'), 2200); } } };
  mark(); tips(); bump(); try { new MutationObserver(() => { mark(); tips(); bump(); }).observe(st, { childList: true, subtree: true, characterData: true }); } catch (e) { }
})();
