/**
 * KLABS — Futuristic 3D Website Preloader & Boot Sequence
 * Manages loading progress, spatial initialization telemetry, and smooth reveal.
 */

(function () {
  'use strict';

  function initPreloader() {
    const preloader = document.getElementById('site-preloader');
    if (!preloader) return;

    const counter = document.getElementById('preloader-counter');
    const bar = document.getElementById('preloader-bar-fill');
    const statusText = document.getElementById('preloader-status-text');

    let current = 0;
    const target = 100;
    const duration = 1200; // 1.2s total sequence
    const startTime = performance.now();

    const telemetryStages = [
      { at: 0, text: 'BOOT_SEQUENCE // INITIALIZING 3D SPATIAL CORE' },
      { at: 35, text: 'LOADING THREE.JS GEOMETRY & LIGHTING ARRAYS' },
      { at: 70, text: 'INITIALIZING ORBITAL PARTICLES & EMISSIVE BUFFERS' },
      { at: 95, text: 'KLABS 3D UNIVERSE ONLINE // READY' }
    ];

    function update() {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      current = Math.floor(eased * target);

      if (counter) counter.textContent = current + '%';
      if (bar) bar.style.width = current + '%';

      if (statusText) {
        for (let i = telemetryStages.length - 1; i >= 0; i--) {
          if (current >= telemetryStages[i].at) {
            statusText.textContent = telemetryStages[i].text;
            break;
          }
        }
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setTimeout(() => {
          preloader.classList.add('loaded');
          // Dispatch custom event for 3D engine to trigger intro camera move
          window.dispatchEvent(new CustomEvent('klabs:site-loaded'));
          setTimeout(() => {
            if (preloader.parentNode) {
              preloader.style.display = 'none';
            }
          }, 750);
        }, 180);
      }
    }

    requestAnimationFrame(update);

    // Failsafe safety fallback
    setTimeout(() => {
      if (!preloader.classList.contains('loaded')) {
        preloader.classList.add('loaded');
        window.dispatchEvent(new CustomEvent('klabs:site-loaded'));
      }
    }, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPreloader);
  } else {
    initPreloader();
  }
})();
