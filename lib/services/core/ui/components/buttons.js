const { getOidcBgColor } = require("../../utils/oidc-style");
const { createIdFromString, createProviderName } = require("../../utils/helpers");

const primaryButtonUI = ({ onClick, label, id }) => {
  const disableInlineStyles = window.IKSDK.config.disableInlineStyles;
  const buttonEl = document.createElement("button");
  buttonEl.className = "IKUISDK-primary-btn";
  buttonEl.id = id;
  buttonEl.innerText = label;
  buttonEl.addEventListener("click", onClick);
  if (!disableInlineStyles) {
    buttonEl.style.cssText = `
      cursor: pointer;
      display: block; 
      margin: 16px 0; 
      width: 100%;
      font-family: 'Rubik', sans-serif;
      font-size: 11px;
      border-radius: 5px;
      border:none;
      color: rgb(10, 10, 10);
      height: 32px;
      background: rgb(255, 183, 82); 
    `;
  }

  return buttonEl;
};

// Old version
const navigationButtonUI = (title, href) => {
  const button = navButtonUI({
    label: title,
    href: href || "#",
  });
  return button.outerHTML;
};

// New version
const navButtonUI = ({ label, href, id, onClick }) => {
  const disableInlineStyles = window.IKSDK.config.disableInlineStyles;
  const pEl = document.createElement("p");
  if (id) {
    pEl.id = id;
  }
  pEl.className = "IKUISDK-action-btn";

  const aEl = document.createElement("a");
  if (onClick) {
    aEl.addEventListener("click", (ev) => {
      ev.preventDefault();
      onClick(ev);
    });
  } else if (href) {
    aEl.href = href;
  }
  aEl.innerText = label;
  if (!disableInlineStyles) {
    pEl.style.cssText =
      "font-family: 'Rubik', sans-serif;font-size: 12px;text-align: center; cursor: pointer; margin-bottom: 16px;";
    aEl.style.cssText = "color: rgb(250, 250, 250); text-decoration: none;";
  }

  pEl.appendChild(aEl);

  return pEl;
};

/**
 * @param {{
 *   data: {
 *     name?: string;
 *     prv: string;
 *   },
 *   onClick: () => void;
 *   id: string;
 * }} parameter
 * @returns
 */
const oidcButtonUI = ({ data, onClick, id }) => {
  const disableInlineStyles = window.IKSDK.config.disableInlineStyles;
  const providerType = createIdFromString(data.name || data.prv);
  const isIndyKiteProvider = data.prv === "indykite.id";
  const providerName = createProviderName(data.name || data.prv);

  const buttonEl = document.createElement("button");
  buttonEl.className = `${providerType}-login-button IKUISDK-btn oidc-button`;
  if (isIndyKiteProvider) {
    buttonEl.classList.add("ik-provider");
  }
  buttonEl.id = id;
  buttonEl.innerText = providerName;
  if (!disableInlineStyles) {
    buttonEl.style.cssText = `
      display: block;
      width: 100%;
      cursor: pointer;
      font-family: 'Rubik', sans-serif;
      font-size: 11px;
      border:none;
      border-radius: 5px;
      color: rgb(10, 10, 10);
      height: 32px;
      margin-bottom: 8px;
      background-color: ${getOidcBgColor(data.prv)};
      position: relative;
      text-align: ${isIndyKiteProvider ? "center" : "left"};
      padding-left: ${isIndyKiteProvider ? "0px" : "64px"};
    `;
  }

  buttonEl.addEventListener("click", (e) => {
    e.preventDefault();
    onClick && onClick();
  });

  return buttonEl;
};

module.exports = {
  navigationButtonUI,
  primaryButtonUI,
  navButtonUI,
  oidcButtonUI,
};
