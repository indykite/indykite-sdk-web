const queryString = require("query-string");
const { getBaseUri } = require("../lib/config");
const axios = require("axios");
const packageJson = require("../../../../package.json");

/**
 *
 * @returns {number}
 */
const getUnixTimeStamp = () => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Generates the redirect callback uri without the need to specify the full url
 * @param {string} redirectUri
 * @returns {string}
 */
const generateRedirectUri = (redirectUri) => {
  if (redirectUri && redirectUri.startsWith("http")) {
    return redirectUri;
  } else if (redirectUri) {
    // FYI We could use new Url(), but that's not supported in IE
    return `${window.location.origin}/${redirectUri.replace(/^\/*/, "")}`;
  } else {
    return window.location.origin;
  }
};

/**
 * Returns true in case we are over the limit after we
 * add the seconds to the current time.
 *
 * @param {number} limit (in seconds)
 * @param {number} seconds
 * @returns {boolean} currentTime + seconds > limit
 */
const isTokenExpired = (limit, seconds) => {
  const currentTime = getUnixTimeStamp();
  return currentTime + seconds > limit;
};

/**
 *
 * @param {string} [accessToken]
 * @param {object} headers
 * @returns {object} Headers with accessToken if given
 */
const addAuthorizationTokenToHeaders = (accessToken, headers = {}) => {
  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`;
  }

  return headers;
};

const isTypeLogical = (data) => data && data["@type"] === "logical";
const hasOptsField = (data) => data && Array.isArray(data.opts) && data.opts.length;

/**
 * Checks whether the authentication flow should be treated as logical.
 * @param {object} [data.type] !!!! expects data["@type"] actually !!!!
 * @param {object} [data.opts]
 * @returns {boolean}
 */
const treatAsTypeLogical = (data) => data && isTypeLogical(data) && hasOptsField(data);
const treatAsTypeOidc = (data) => data && data["@type"] === "oidc";

const getOidcBaseUrl = (originalParams) => {
  return `${getBaseUri()}/o/oauth2/auth?${queryString.stringify(originalParams)}`;
};

const getOidcFinalUrlWithLoginVerifier = (originalParams, loginVerifier) =>
  `${getOidcBaseUrl(originalParams)}&login_verifier=${loginVerifier}`;

/**
 * @param {string} url
 * @param {'GET'|'POST'} method
 * @param {*} data
 * @param {{[key: string]: string;}} headers
 */
const sendRequest = (url, method, data, config = {}) => {
  const headers = config.headers || {};
  headers["ikui-version"] = packageJson.version;
  const { actionName, ...restConfig } = config;
  if (actionName) {
    headers["ikui-action-name"] = actionName;
  }
  let requestFn;
  switch (method) {
    case "GET":
      requestFn = axios.get;
      break;
    default:
      requestFn = axios.post;
  }

  return requestFn(url, data, {
    ...restConfig,
    headers,
  });
};

/**
 * Create a callback which allows a user to modify a pre-generated component or to
 * create a custom component using onRenderComponent function. In case this function is
 * undefined or it doesn't return a new component it will return the default component.
 * @template DC
 * @template ARGS
 * @template C
 * @param {(component: DC, ...restArgs: ARGS) => C} onRenderComponent
 * @param {DC} component
 * @param {ARGS} restArgs
 * @returns {DC|C}
 */
const createRenderComponentCallback = (onRenderComponent, component, ...restArgs) => {
  if (typeof onRenderComponent === "function") {
    const customComponent = onRenderComponent(component, ...restArgs);
    return customComponent || component;
  }
  return component;
};

const createIdFromString = (text) => {
  if (["google.com", "facebook.com", "microsoft.com", "linkedin.com"].includes(text)) {
    return text.replace(".com", "").toLowerCase();
  }

  return text
    .replace(/[\.\/\\]/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toLowerCase();
};

const createProviderName = (text) => {
  if (["google.com", "facebook.com", "microsoft.com", "linkedin.com"].includes(text)) {
    return text.replace(".com", "").toLowerCase();
  }

  return text.toLowerCase();
};

module.exports = {
  createIdFromString,
  createProviderName,
  createRenderComponentCallback,
  getUnixTimeStamp,
  isTokenExpired,
  addAuthorizationTokenToHeaders,
  treatAsTypeLogical,
  treatAsTypeOidc,
  getOidcFinalUrlWithLoginVerifier,
  getOidcBaseUrl,
  generateRedirectUri,
  sendRequest,
};
