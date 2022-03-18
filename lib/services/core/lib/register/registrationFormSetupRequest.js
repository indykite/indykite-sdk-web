const { setupRequest } = require("../common");
const { flowTypes } = require("../../constants");

/**
 * Initiates authentication flow. And returns setupData object.
 * @param {Parameters<typeof setupRequest>[0]} [config]
 * @returns {Promise<setupObject>}
 */
const registrationFormSetupRequest = (config) =>
  setupRequest(Object.assign({ args: { flow: flowTypes.register } }, config));

module.exports = registrationFormSetupRequest;
