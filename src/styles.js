/**
 * Inject Shades of Purple Tweakpane styles
 */
// @fixme Use a better way to inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = `
  :root {
    --tp-base-background-color: hsla(243, 33%, 25%, 1.00);
    --tp-base-shadow-color: hsla(0, 0%, 0%, 0.25);
    --tp-button-background-color: hsla(49, 96%, 54%, 1.00);
    --tp-button-background-color-active: hsla(49, 96%, 39%, 1.00);
    --tp-button-background-color-focus: hsla(49, 96%, 44%, 1.00);
    --tp-button-background-color-hover: hsla(49, 96%, 49%, 1.00);
    --tp-button-foreground-color: hsla(240, 35%, 18%, 1.00);
    --tp-container-background-color: hsla(0, 0%, 0%, 0.20);
    --tp-container-background-color-active: rgba(38, 38, 38, 0.20);
    --tp-container-background-color-focus: rgba(26, 26, 26, 0.20);
    --tp-container-background-color-hover: rgba(13, 13, 13, 0.20);
    --tp-container-foreground-color: hsla(249, 65%, 76%, 1.00);
    --tp-groove-foreground-color: hsla(0, 0%, 0%, 0.50);
    --tp-input-background-color: hsla(240, 35%, 18%, 1.00);
    --tp-input-background-color-active: rgba(55, 55, 114, 1.00);
    --tp-input-background-color-focus: hsla(240, 35%, 33%, 1.00);
    --tp-input-background-color-hover: rgba(38, 38, 79, 1.00);
    --tp-input-foreground-color: hsla(0, 0%, 100%, 0.90);
    --tp-label-foreground-color: hsla(249, 65%, 76%, 1.00);
    --tp-monitor-background-color: hsla(0, 0%, 0%, 0.50);
    --tp-monitor-foreground-color: hsla(249, 65%, 76%, 1.00);
  }
  
  body .tp-dfwv {
    min-width: 300px;
    z-index: 999999999999;
  }
  body input.tp-txtv_i {
    background-color: var(--tp-input-background-color);
  }
  /* Input and monitor view */
  body .tp-lblv_v {
    min-width: 180px;
  }
  /* scrollable panels */
  .tp-fldv .tp-brkv {
    max-height: 300px;
    overflow-y: auto !important;
  }



  canvas.layersp5-layer {
    transition: transform 1s ease, margin-top 1s ease;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer {
    transform-style: preserve-3d;
    transform: rotateX(45deg) rotateY(-15deg) rotate(45deg);
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(1) {
    margin-top: 20px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(2) {
    margin-top: 0px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(3) {
    margin-top: -20px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(4) {
    margin-top: -40px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(5) {
    margin-top: -60px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(6) {
    margin-top: -80px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(7) {
    margin-top: -100px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(8) {
    margin-top: -120px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(9) {
    margin-top: -140px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(10) {
    margin-top: -160px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(11) {
    margin-top: -180px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(12) {
    margin-top: -200px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(13) {
    margin-top: -220px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(14) {
    margin-top: -240px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(15) {
    margin-top: -260px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(16) {
    margin-top: -280px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(17) {
    margin-top: -300px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(18) {
    margin-top: -320px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(19) {
    margin-top: -340px;
  }
  .layersp5-layers-wrap.explode canvas.layersp5-layer:nth-child(20) {
    margin-top: -360px;
  }



  /* p5.catpure */
  .p5c-container {display: none !important}
  `
  document.head.appendChild(style)
}