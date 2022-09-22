const { colors } = require("../../constants");

/**
 * @param {{
 *  label?: string;
 *  message?: string;
 *  type: 'error' | 'success' | 'info' | 'warn';
 * }} arguments
 * @returns
 */
const message = ({ label, message, type }) => {
  const disableInlineStyles = window.IKSDK.config.disableInlineStyles;
  const messageEl = document.createElement("div");
  messageEl.className = `IKUISDK-message message message-${type}`;
  messageEl.innerText = message || label || "";
  if (!disableInlineStyles) {
    messageEl.style.cssText = `
      margin: 16px 0;
      text-align: center;
      font-size: 9px;
      font-weight: 300;
      color: ${colors[type]};
      font-family: Rubik, sans-serif;
    `;
  }

  return messageEl;
};

module.exports = {
  message,
};
