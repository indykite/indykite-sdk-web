const { getLocalizedMessage } = require("../lib/locale-provider");
const { getElementIds } = require("../lib/config");
const { notificationUI } = require("../ui/components/notification");

////////////////////////////////////////////
///errors, success messages, notifications//
////////////////////////////////////////////

const notificationStatePath = "IKUISDK/notifciations";

const getNotificationsState = () => {
  const notificationState = localStorage.getItem(notificationStatePath);
  return notificationState ? JSON.parse(notificationState) : notificationState;
};

/**
 * Removes all notifications from UI-SDK.
 */
const cleanAllNotifications = () => localStorage.setItem(notificationStatePath, null);

/**
 * Updates notification state. Used for when we want to display notification on next render (for exmaple: successful
 * password reset redirects to login where we want the message to be displayed)
 * @param {{ title: string, type: "error" | "success" | "info" }} notification
 */
const setNotificationsState = (notification) => {
  if (!notification) cleanAllNotifications();

  const newNotifications = [notification];
  localStorage.setItem(notificationStatePath, JSON.stringify(newNotifications));
};

/**
 * Injects notification UI element into currently rendered UI. Good for error messages.
 * @param text
 * @param type
 * @returns {string|null}
 */
const setNotification = (text, type) => {
  const notificationsContainer = document.querySelector(
    `#${getElementIds().notificationContainer}`,
  );

  if (!notificationsContainer) return;

  if (!text) return (notificationsContainer.innerHTML = null);

  return (notificationsContainer.innerHTML = notificationUI(text, type));
};

/**
 * Used for displaying error messages like invalid password etc.
 * @param err
 */
const handleError = (err) => {
  if (window.IKSDK.config.onError) {
    window.IKSDK.config.onError(err);
  }
  // else if (err['~error'].code === 'error_code_invalid') {
  //   // error = 'Wrong username/password'
  //   // IKUICore(window.IKSDK.config)
  // }
  else {
    let message;
    if (err.label) {
      let values = {};
      if (err.extensions) {
        values = err.extensions;
      }
      message = getLocalizedMessage(err.label, values);
    }
    if (!message) {
      if (err.msg) {
        message = err.msg;
      } else {
        message = getLocalizedMessage("uisdk.general.error");
      }
    }
    setNotification(message, "error");
  }
};

const cleanError = () => setNotification();

module.exports = {
  handleError,
  cleanError,
  getNotificationsState,
  setNotificationsState,
  setNotification,
  cleanAllNotifications,
};
