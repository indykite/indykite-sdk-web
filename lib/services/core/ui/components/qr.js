const qrcode = require("qrcode");

/**
 * @param {"S" | "M" | "L"} size
 */
const sizeToScale = (size) => {
  switch (size) {
    case "S":
      return 2;
    case "M":
      return 3;
    case "L":
      return 4;
    case "H":
      return 5;
    default:
      return 4;
  }
};

/**
 * @param {{
 *   '@id': string;
 *   '@type': string;
 *   cnt: string;
 *   cor: 'L' | 'M' | 'Q' | 'H';
 *   enc: string;
 *   kind: string;
 *   size: string;
 *   ~ord: number;
 *   ~ui: string;
 * }} arguments
 * @returns
 */
const qr = async ({ cnt, cor, size }) => {
  const disableInlineStyles = window.IKSDK.config.disableInlineStyles;
  const wrapperEl = document.createElement("div");
  wrapperEl.className = "IKUISDK-qr";
  const canvasEl = document.createElement("canvas");
  wrapperEl.appendChild(canvasEl);
  await qrcode.toCanvas(canvasEl, cnt, {
    errorCorrectionLevel: cor,
    scale: sizeToScale(size),
  });
  if (!disableInlineStyles) {
    wrapperEl.style.cssText = `
      display: flex;
      width: 100%;
      justify-content: center;
    `;
  }

  return wrapperEl;
};

module.exports = {
  qr,
};
