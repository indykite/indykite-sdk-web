const { setNotificationsState } = require("../../lib/notifications");

const ERROR_DESCRIPTION = "Unable to get a list of login/registration options";

/**
 * @param {{
 *   onFailCallback: (error: Error) => void;
 * }} args
 * @returns
 */
const fail = ({ onFailCallback = () => {} }) => {
  setNotificationsState({
    title: ERROR_DESCRIPTION,
    type: "error",
  });
  onFailCallback(new Error(ERROR_DESCRIPTION));
};

module.exports = fail;
