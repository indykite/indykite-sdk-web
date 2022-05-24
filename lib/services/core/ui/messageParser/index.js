const action = require("./action");
const fail = require("./fail");
const form = require("./form");
const logical = require("./logical");
const oidc = require("./oidc");
const message = require("./message");

/**
 * @param {{
 *   context: {
 *     "@type": string;
 *   };
 *   loginApp: {
 *     [optionId: string]: string;
 *   };
 * }} props
 */
const messageParser = (props) => {
  const { context } = props;
  switch (context["@type"]) {
    case "fail": {
      fail(props);
      break;
    }
    case "logical": {
      logical(props, (option) =>
        messageParser({
          ...props,
          context: option,
        }),
      );
      break;
    }
    case "oidc": {
      oidc(props);
      break;
    }
    case "action": {
      action(props);
      break;
    }
    case "form": {
      form(props);
      break;
    }
    case "message": {
      message(props);
      break;
    }
    default:
      throw new Error(`Unknown message type: "${context["@type"]}"`);
  }
};

module.exports = messageParser;
