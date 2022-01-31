const { setupRequest } = require("../common");
const skipIfLogged = require("./skipIfLogged");

/**
 * Initiates authentication flow. And returns setupData object. In case of OIDC flow automatically redirects when there is already valid session detected.
 * @param [config]
 * @returns {Promise<setupObject>} setupObject is then supposed to be passed as a third parameter to IKUIUserAPI.login("my@mail.com", "Passw0rd", setupObject)
 */
const loginSetup = async (config) => {
  try {
    const setupResult = await setupRequest(config);
    if (skipIfLogged(setupResult)) {
      return {};
    }
    return setupResult;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = loginSetup;
