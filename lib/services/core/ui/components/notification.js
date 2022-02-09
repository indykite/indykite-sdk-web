const { colors } = require("../../constants");
const { getElementIds } = require("../../lib/config");
const { notificationText } = getElementIds();
/**
 *
 * @param text Text of the notification.
 * @param {"info"|"success"|"error"} type Has to be one of "error", "success"
 * @returns {string}
 * @constructor
 */
const notificationUI = (text = "Unknown notification title.", type = "info") => {
  return `
  <div style="border: 1px solid ${colors[type]}; border-radius: 3px; padding:" +
    " 5px;">
      <span id='${notificationText}' style="color: ${colors[type]}">${text}</span>
    </div>
  </div>
`;
};

module.exports = {
  notificationUI,
};
