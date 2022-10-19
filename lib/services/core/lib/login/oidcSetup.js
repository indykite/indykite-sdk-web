const singleOidcSetup = require("./singleOidcSetup");
const storage = require("../storage");
const { generateRedirectUri, sendRequest } = require("../../utils/helpers");
const { getBaseAuthUrl } = require("../config");

/**
 * @typedef {{
 *   id?: string | null;
 *   redirectUri?: string | null;
 *   threadId?: string | null;
 *   loginApp?: string;
 *   url?: string;
 * }} OidcSetupOptions
 */

/**
 * Call this function with and action id parameter. Request will be sent to server and you will be redirected to
 * identity providers website. The id can be found in data returned by IKUIUserAPI.loginSetup function.
 * @param {string | null | OidcSetupOptions} idOrOptions Id of an action.
 * @param {string | null} redirectUri
 * @param {string | null} threadId
 */
const oidcSetup = async (idOrOptions, redirectUri, threadId = null) => {
  if (idOrOptions !== null && typeof idOrOptions === "object") {
    return oidcSetupWithOptions(idOrOptions);
  } else {
    return oidcSetupWithOptions({ id: idOrOptions, redirectUri, threadId });
  }
};

/**
 * @param {OidcSetupOptions} param0
 */
const oidcSetupWithOptions = async ({ id, redirectUri, threadId, loginApp, url: oidcUrl }) => {
  if (typeof oidcUrl === "string" && oidcUrl.length > 0) {
    storage.setOidcActionId(id);
    window.location.href = oidcUrl;
    return;
  }

  const url = getBaseAuthUrl();
  let data = {
    "~thread": {
      thid: threadId ? threadId : storage.getThreadId(),
    },
    "@type": "oidc",
  };

  // In case we have id of the action send it too
  if (id) {
    data["@id"] = id;
  }

  // In case we have the redirectUri add it to the request
  if (redirectUri) {
    data["redirectUri"] = generateRedirectUri(redirectUri);
  }

  if (loginApp) {
    data["params"] = {
      login_app: loginApp,
    };
  }

  try {
    const requestResult = await sendRequest(url, "POST", data, {
      actionName: "oidc-setup",
    });

    singleOidcSetup(requestResult.data);
  } catch (err) {
    console.error(err);
  }
};

module.exports = oidcSetup;
