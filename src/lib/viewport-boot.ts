/**
 * Runs before paint:
 * - stable hero height (must not update again on scroll)
 * - html.is-desktop / is-phone so desklanding2/3 art layers apply immediately
 */
export const VIEWPORT_BOOT_SCRIPT = `(function(){try{var vv=window.visualViewport;var h=Math.round(Math.min(window.innerHeight||1/0,vv&&vv.height||1/0,document.documentElement.clientHeight||1/0));var w=Math.round(Math.max(window.innerWidth,vv&&vv.width||0,document.documentElement.clientWidth||0));if(!isFinite(h)||h<=0)h=window.innerHeight;var r=document.documentElement;r.style.setProperty('--hero-height',h+'px');r.style.setProperty('--app-height',h+'px');r.style.setProperty('--app-width',w+'px');var desktop=w>=768;r.classList.toggle('is-desktop',desktop);r.classList.toggle('is-phone',!desktop);r.dataset.viewport=desktop?'desktop':'phone';r.classList.add('is-scroll-locked');}catch(e){}})();`;
