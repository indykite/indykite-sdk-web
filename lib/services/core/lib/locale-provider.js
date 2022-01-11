const { getLocaleConfig } = require("./config");
const { enUSLocale } = require("../locale/en-US");
const IntlMessageFormat = require("intl-messageformat").default;

const findMessageByKey = (key) => {
  // Locale the user has defined
  const localeConfig = getLocaleConfig();

  const message = localeConfig.messages[key];
  if (message && message.length > 0) {
    // This means the message is defined in the locale the user has set
    return message;
  }

  // Fallback to English
  const defaultMessage = enUSLocale.messages[key];
  if (defaultMessage && defaultMessage.length > 0) {
    return defaultMessage;
  }

  return "";
};

const getLocalizedMessage = (key, values = {}) => {
  // Locale the user has defined
  const localeConfig = getLocaleConfig();

  const formattedMessage = new IntlMessageFormat(findMessageByKey(key), localeConfig.locale);

  return formattedMessage.format(values);
};

module.exports = {
  getLocalizedMessage,
};
