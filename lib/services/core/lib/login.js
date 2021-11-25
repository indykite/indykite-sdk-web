const queryString = require("query-string");
const storage = require("./storage");
const oidcSetup = require("./login-fns/oidcSetup");
const { sendRequest } = require("../utils/helpers");
const {
  setupRequest,
  sendCredentialsForLoginOrRegister,
  sendVerifierForLoginOrRegister,
} = require("./common");
const { getElementIds, getBaseAuthUrl } = require("./config");
const { cleanAllNotifications, cleanError } = require("./notifications");
const { treatAsTypeLogical, getOidcFinalUrlWithLoginVerifier } = require("../utils/helpers");

const skipIfLogged = (data) => {
  if (data && data["@type"] === "success" && data.verifier) {
    const originalParams = storage.getOidcOriginalParams();
    storage.clearOidcData();
    if (originalParams) {
      window.location = getOidcFinalUrlWithLoginVerifier(originalParams, data.verifier);
    }
    return true;
  }

  return false;
};

/**
 * @typedef SuccessResponse
 * @property {string} token
 * @property {string} refresh_token
 * @property {string} token_type
 * @property {timestamp} expiration
 * @property {number} expires_in seconds
 */

/**
 * @typedef ErrorObject
 * @property {string} code
 * @property {string} msg
 */

/**
 * @typedef ErrorResponse
 * @property {string} type "@type"
 * @property {ErrorObject} ~error
 */

/**
 * Login handler expose the functionality which you can connect to your custom login UI.
 * @param {string} email
 * @param {string} password
 * @param {object} setupData Result of the function loginSetup
 * @returns {Promise<SuccessResponse | ErrorResponse>}
 */
const login = async (email, password, setupData = null) => {
  if (setupData && typeof setupData === "object") {
    const data = setupData;
    const hasOptsField = treatAsTypeLogical(data);
    return handleLogin({
      id: hasOptsField ? data.opts.filter((o) => o["@type"] === "form")[0]["@id"] : undefined,
      emailValueParam: email,
      passwordValueParam: password,
    });
  } else {
    const data = await loginSetup(window.IKSDK.config);
    return login(email, password, data);
  }
};

/**
 * Initiates authentication flow. And returns setupData object. In case of OIDC flow automatically redirects when there is already valid session detected.
 * @param [config]
 * @returns {Promise<setupObject>} setupObject is then supposed to be passed as a third parameter to IKUIUserAPI.login("my@mail.com", "Passw0rd", setupObject)
 */
const loginSetup = async (config) => {
  try {
    const setupResult = await setupRequest(config);
    skipIfLogged(setupResult);
    return setupResult;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const oidcCallback = async () => {
  const parsedParams = queryString.parse(window.location.search);

  try {
    // sending params received from oidc provider
    const thid = storage.getThreadId();
    const url = getBaseAuthUrl();
    const data = {
      state: parsedParams.state,
      code: parsedParams.code,
      "@type": "oidc",
      "~thread": {
        thid: thid,
      },
    };

    const responseOne = await sendRequest(url, "POST", data, {
      actionName: "oidc-callback",
    });
    const thid2 = responseOne.data["~thread"] && responseOne.data["~thread"].thid;

    if (responseOne.data["@type"] === "fail") {
      throw responseOne.data;
    }

    if (responseOne.data["@type"] === "oidc") {
      await oidcSetup({ threadId: thid2 });
    } else {
      // We are at the end of te flo

      // sending verifier in order to receive token

      const data2 = {
        "~thread": {
          thid: thid2,
        },
        "@type": "verifier",
        cv: storage.getCv(),
      };
      const requestTokenResponse = await sendRequest(url, "POST", data2, {
        actionName: "oidc-verifier",
      });

      // store tokens
      if (requestTokenResponse.data["@type"] === "success") {
        await storage.storeOnLoginSuccess(requestTokenResponse.data);
      }

      return requestTokenResponse.data;
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const handleLogin = async ({ id, onSuccessCallback, emailValueParam, passwordValueParam }) => {
  cleanError();
  const originalParams = storage.getOidcOriginalParams(); // If there is data we are in oidc flow
  const valuesFromParameters = emailValueParam !== null || passwordValueParam !== null;

  const { inputEmail: inputEmailId, inputPassword: inputPasswordId } = getElementIds();
  const inputEmail = document.querySelector(`#${inputEmailId}`);
  const inputPassword = document.querySelector(`#${inputPasswordId}`);

  try {
    // Sending credentials
    const response = await sendCredentialsForLoginOrRegister({
      emailValueParam: valuesFromParameters ? emailValueParam : inputEmail.value,
      passwordValueParam: valuesFromParameters ? passwordValueParam : inputPassword.value,
      id,
    });

    if (!response || !response.data) {
      throw "Oops something went wrong when sending credentials to the indentity provider server.";
    }

    if (response.data["~error"]) {
      throw response.data;
    }

    // Verifier
    const callBackTHID = response.data["~thread"] && response.data["~thread"].thid;
    const secondResponse = await sendVerifierForLoginOrRegister(callBackTHID);

    // TODO: Does this ever work?
    if (secondResponse.data["~error"]) {
      throw secondResponse.data;
    }

    await storage.storeOnLoginSuccess(secondResponse.data);
    cleanAllNotifications();

    if (originalParams) {
      storage.clearOidcData();
      window.location = getOidcFinalUrlWithLoginVerifier(originalParams, response.data.verifier);
      return;
    }

    // Callback hooks when using built-in UI
    if (onSuccessCallback) {
      onSuccessCallback(secondResponse.data);
    } else if (window.IKSDK.registeredCallback) {
      window.IKSDK.registeredCallback(secondResponse.data);
    }

    return secondResponse.data;
  } catch (err) {
    throw err;
  }
};
const requiredQueryParams = [
  "login_app", // dashboard uri/pathname
  "redirect_uri", // where we want to end up on success
  "response_type",
  "client_id",
  "state",
  "scope",
  "nonce",
];

const isConfigMissingField = (config, requiredFields = requiredQueryParams) => {
  return requiredFields.find((field) => !config[field]);
};

/**
 * This would be used by third party application which wants to have possibility to authenticate its users
 * against other identity provider server. Through the params you can config the initial redirecting query
 * respecting official oauth2 protocol. You have to make sure the server will cooperate with your application.
 * @param {string} oauth2Host
 * @param {string} queryParams.login_app
 * @param {string} queryParams.redirect_uri
 * @param {string} queryParams.response_type OAuth 2.0 Response Type value that determines the authorization
 * processing flow to be used, including what parameters are returned from the endpoints used. When using the Authorization Code Flow, this value is code.
 * @param {string} queryParams.client_id OAuth 2.0 Client Identifier valid at the Authorization Server.
 * @param {string} queryParams.state Opaque value used to maintain state between the request and the callback. Typically, Cross-Site Request Forgery (CSRF, XSRF) mitigation is done by cryptographically binding the value of this parameter with a browser cookie.
 * @param {string} queryParams.scope
 * @param {string} queryParams.nonce
 * @returns {string | void} Returns name of missing config if any.
 */
const initOidcAuthorizationRequest = (oauth2Host, queryParams) => {
  const missingField = isConfigMissingField(queryParams);
  if (missingField) {
    return `Your config is not complete. Please provide ${missingField} base on documentation.`;
  }

  const queryParamsStringified = queryString.stringify(queryParams);

  window.location = `${oauth2Host}/o/oauth2/auth?${queryParamsStringified}`;
};

/**
 * @param {string | undefined} userId
 * @returns {Promise<boolean>}
 */
const isAuthenticated = async (userId) => {
  const { accessToken } = await storage.getTokens(userId);
  return !!accessToken;
};

module.exports = {
  handleLogin,
  isAuthenticated,
  login,
  loginFormSetupRequest: loginSetup,
  initOidcAuthorizationRequest,
  skipIfLogged,
  loginSetup,
  oidcCallback,
};
