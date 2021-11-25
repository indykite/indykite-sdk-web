const singleOidcSetup = require('./singleOidcSetup');
const storage = require("../storage");
const { generateRedirectUri, sendRequest } = require("../../utils/helpers");

/**
 * Call this function with and action id parameter. Request will be sent to server and you will be redirected to
 * identity providers website. The id can be found in data returned by IKUIUserAPI.loginSetup function.
 * @param {string | null} id Id of an action.
 * @param {string | null} redirectUri
 * @param {string | null} threadId
 */
 const oidcSetup = async (id, redirectUri, threadId = null) => {
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
