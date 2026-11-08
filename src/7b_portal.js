/* ================= game portals (CrazyGames) =================
   Only when the game is played inside CrazyGames (HOST_PORTAL). Our own site and the other portals stay exactly as they are: no SDK, no ads.
   - Their rules: no links that lead out to a playable web version (share buttons, our site, the guide, the ranking page), ads only through their SDK.
   - Their SDK is told when a run is being played (gameplayStart / gameplayStop) and when loading ends.
   - Ads: only a rewarded ad the player chooses ("watch an ad to keep going" on the retry screen). Never a forced ad.
     Off until feed.json says "cgAds": true (CrazyGames does not allow ads during its first test launch). */
const PORTAL = (() => {
  const on = HOST_PORTAL === 'crazygames';
  let sdk = null, ready = false, inPlay = false, adBusy = false;
  const adsWanted = () => !!(FEED && FEED.cgAds === true);
  function load() {
    if (!on) return;
    document.documentElement.classList.add('portal-cg');
    { const g = $('#tGuide'), p = g && g.parentNode; if (p) p.innerHTML = '<span class="nw">COANA TOKYO</span>'; } // the guide and our site are links out; keep only the name
    // anything that opens a page outside the game is switched off here, even if it was missed by the CSS below
    document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href]'); if (a && /^https?:/i.test(a.getAttribute('href') || '') && !a.download) { e.preventDefault(); e.stopPropagation(); } }, true);
    const s = document.createElement('script'); s.src = 'https://sdk.crazygames.com/crazygames-sdk-v3.js'; s.async = true;
    s.onload = async () => { try { sdk = window.CrazyGames && window.CrazyGames.SDK; if (!sdk) return; await sdk.init(); ready = sdk.environment === 'crazygames' || sdk.environment === 'local'; if (ready) { try { sdk.game.loadingStop(); } catch (e) { } } } catch (e) { reportErr(e); } };
    document.head.appendChild(s);
    // tell the portal when a run is actually being played (they use it to time their own ads and to count play time)
    setInterval(() => { if (!ready) return; const p = G.mode === 'play' || G.mode === 'countdown'; if (p !== inPlay) { inPlay = p; try { p ? sdk.game.gameplayStart() : sdk.game.gameplayStop(); } catch (e) { } } }, 250);
  }
  function adOK() { return on && ready && adsWanted() && !adBusy; }
  // the rewarded ad on the retry screen: continue only when the ad was watched to the end
  function rewardRevive() {
    if (!adOK()) return; adBusy = true; clearInterval(rvTimer);
    const done = ok => { adBusy = false; try { if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume(); } catch (e) { } if (ok) doRevive('ad'); else { $('#rvHave').textContent = t('adFail'); setTimeout(() => { if (G.mode === 'dead') endRun(); }, 1200); } };
    try {
      sdk.ad.requestAd('rewarded', {
        adStarted: () => { try { musicStop(); if (AU.ctx) AU.ctx.suspend(); } catch (e) { } },
        adFinished: () => done(true),
        adError: () => done(false),
      });
    } catch (e) { done(false); }
  }
  return { on, load, adOK, rewardRevive };
})();
PORTAL.load();
{ const b = $('#btnRvAd'); if (b) b.onclick = () => { SFX.ui(); PORTAL.rewardRevive(); }; }
