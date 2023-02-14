const { getThreadId } = require("../storage");

// Locals
const IDSDKConfig = require("../config");
const { sendRequest } = require("../../utils/helpers");

/**
 * @param {{
 *   emailValueParam: string;
 *   id: string;
 *   passwordValueParam: string;
 * }} param0
 * @returns
 */
const sendCredentialsForLoginOrRegister = ({ emailValueParam, passwordValueParam, id }) => {
  const thid = getThreadId();
  const url = IDSDKConfig.getBaseAuthUrl();

  return sendRequest(
    url,
    "POST",
    {
      "~thread": {
        thid: thid,
      },
      "@type": "form",
      "@id": id,
      username: emailValueParam,
      password: passwordValueParam,
    },
    {
      actionName: "username-password-login",
    },
  );
};

module.exports = sendCredentialsForLoginOrRegister;
