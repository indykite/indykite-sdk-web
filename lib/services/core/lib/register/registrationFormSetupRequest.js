const { setupRequest } = require("../common");
const { flowTypes } = require("../../constants");

/**
 * Initiates authentication flow. And returns setupData object.
 * @param {Parameters<typeof setupRequest>[0]} [config]
 * @returns {Promise<setupObject>}
 */
const registrationFormSetupRequest = (config) => setupRequest(config, flowTypes.register);

module.exports = registrationFormSetupRequest;
