const { getOidcColor, getOidcBgColor } = require("../../utils/oidc-style");
const { createIdFromString, createProviderName } = require("../../utils/helpers");

const primaryButtonUI = ({ onClick, label, id }) => {
  const buttonEl = document.createElement("button");
  buttonEl.id = id;
  buttonEl.innerText = label;
  buttonEl.addEventListener("click", onClick);
  buttonEl.style.cssText = `
    cursor: pointer;
    display: block; 
    margin: 20px 0; 
    width: 100%;
    font-family: 'Raleway', sans-serif;
    font-size: 16px;
    border-radius: 6px;
    border:none;
    color: white;
    height: 50px;
    background: linear-gradient(90deg, #02A9AE 0%, #01C6AB 100%);    
  `;

  return buttonEl;
};

// Old version
const navigationButtonUI = (title, href) => `
  <p style="font-family: 'Raleway', sans-serif;font-size: 16px;text-align: center;">
      <a href="${href}">${title}</a>
  </p>
`;

// New version
const navButtonUI = ({ label, href, id, onClick }) => {
  const pEl = document.createElement("p");
  pEl.id = id;
  pEl.style.cssText =
    "font-family: 'Raleway', sans-serif;font-size: 16px;text-align: center; cursor: pointer;";

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
  aEl.style.cssText = "color: rgb(255, 255, 255); text-decoration: none;";

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

  const buttonEl = document.createElement("button");
  buttonEl.className = `${providerType}-login-button oidc-button`;
  buttonEl.id = id;
  buttonEl.innerText = createProviderName(data.name || data.prv);
  buttonEl.style.cssText = `
    display: block;
    width: 100%;
    cursor: pointer;
    font-family: 'Raleway', sans-serif;
    font-size: 16px;
    border:none;
    border-radius: 6px;
    color: ${getOidcColor(providerType)};
    height: 50px;
    margin-bottom: 20px;
    background-color: ${getOidcBgColor(providerType)};
    position: relative;
    text-transform: capitalize`;
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
