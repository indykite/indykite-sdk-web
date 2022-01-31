/**
 * Initializes the IKUI SDK, needs to be called before using other functions.
 * @param {string} config.tenantId
 * @param {string} config.applicationId Used to be called ClientID
 * @param {string} config.baseUri
 * @param {Object} config.localeConfig
 */
const IKUIInit = (config) => {
  console.log("[IKUISDK] Init");
  window.IKSDK = { ...window.IKSDK };
  const oldConfig = window.IKSDK && window.IKSDK.config;
  window.IKSDK.config = { ...oldConfig, ...config };
};

module.exports = IKUIInit;
