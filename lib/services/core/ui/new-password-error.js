const { notificationUI } = require("./components/notification");
const { wrap } = require("./components/wrap");
const { navigationButtonUI } = require("./components/buttons");

/**
 * Element used in case bigger error appears.
 * @param {string} errorMessage This text will be displayed in the error window.
 * @returns {string}
 */
const newPasswordErrorUI = (errorMessage) => {
  return wrap(`
      <div>
          ${notificationUI(errorMessage, "error")}
          <br />
          ${navigationButtonUI("Go back to login", "/login")}
      </div>
    `);
};

module.exports = newPasswordErrorUI;
