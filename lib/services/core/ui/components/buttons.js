const { getOidcBgColor } = require("../../utils/oidc-style");
const { createIdFromString, createProviderName } = require("../../utils/helpers");
const { getLocalizedMessage } = require("../../lib/locale-provider");

const primaryButtonUI = ({ onClick, label, id }) => {
  const buttonEl = document.createElement("button");
  buttonEl.id = id;
  buttonEl.innerText = label;
  buttonEl.addEventListener("click", onClick);
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

  return buttonEl;
};

// Old version
const navigationButtonUI = (title, href) => `
  <p style="font-family: 'Rubik', sans-serif;font-size: 16px;text-align: center;">
      <a href="${href}">${title}</a>
  </p>
`;

// New version
const navButtonUI = ({ label, href, id, onClick }) => {
  const pEl = document.createElement("p");
  pEl.id = id;
  pEl.style.cssText =
    "font-family: 'Rubik', sans-serif;font-size: 12px;text-align: center; cursor: pointer;";

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
  aEl.style.cssText = "color: rgb(250, 250, 250); text-decoration: none;";

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
  const providerType = createIdFromString(data.name || data.prv);
  const isIndyKiteProvider = data.prv === "indykite.id";
  const providerName = createProviderName(data.name || data.prv);

  const buttonEl = document.createElement("button");
  buttonEl.className = `${providerType}-login-button oidc-button`;
  buttonEl.id = id;
  buttonEl.innerText = isIndyKiteProvider
    ? providerName
    : `${getLocalizedMessage("uisdk.login.oidc_text")} ${providerName}`;
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
