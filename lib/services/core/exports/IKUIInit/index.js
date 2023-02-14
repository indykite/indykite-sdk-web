/**
 * Initializes the IKUI SDK, needs to be called before using other functions.
 * @param {Object} config
 * @param {string} config.tenantId
 * @param {string} config.applicationId Used to be called ClientID
 * @param {string} config.baseUri
 * @param {boolean} config.disableInlineStyles
 * @param {string | undefined} config.version
 * @param {Object} config.localeConfig
 */
const IKUIInit = (config) => {
  console.log("[IKUISDK] Init");
  window.IKSDK = { ...window.IKSDK };
  const oldConfig = window.IKSDK && window.IKSDK.config;
  window.IKSDK.config = { ...oldConfig, ...config };

  if (!window.IKSDK.config.disableInlineStyles) {
    console.warn("The inline styling is deprecated.");
    console.warn(
      'Import the CSS file to your root file and then init the config with "disableInlineStyles" property set to true. See the example below:',
    );
    console.warn(`
import "@indykiteone/indykite-sdk-web/dist/styles.css

IKUIInit({
  /* ... other properties */
  disableInlineStyles: true,
});
    `);
  }
};

module.exports = IKUIInit;
