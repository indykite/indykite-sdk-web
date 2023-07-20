const { getElementIds } = require("../../lib/config");
const storage = require("../../lib/storage");
const handleAction = require("../../lib/handleAction");
const { createRenderComponentCallback } = require("../../utils/helpers");
const { navButtonUI } = require("../components/buttons");

/**
 * @typedef {{
 *   alreadyHaveAnAccountButton: string;
 *   forgotPasswordButton: string;
 *   registerLinkButton: string;
 * }} Labels
 */

/**
 * @param {{
 *   context: {
 *     id: string;
 *     opts: {
 *       hint: string;
 *       icon: string;
 *       locale_key: string;
 *       "~ord": number;
 *     }[];
 *   };
 *   htmlContainer: HTMLElement;
 *   labels: {
 *     default: Labels;
 *     custom?: Partial<Labels>;
 *   };
 *   onFailCallback: (err: Error) => void;
 *   onRenderComponent?: () => HTMLElement|undefined;
 *   onSuccessCallback: (newContext: unknown) => void;
 *   paths: {
 *     forgotPassword: string;
 *     login: string;
 *     registration: string;
 *   };
 * }} arguments
 */
const action = ({
  context = {},
  htmlContainer,
  labels,
  onFailCallback,
  onRenderComponent,
  onSuccessCallback,
  paths,
}) => {
  const { default: defaultLabels, custom: customLabels } = labels;
  const {
    forgotPassword: forgotPasswordPath,
    login: loginPath,
    registration: registrationPath,
  } = paths || {};
  const elementIds = getElementIds();
  (context.opts || []).forEach((actionOption) => {
    const handleClick = (redirectPath) => async () => {
      try {
        const newContext = await handleAction({
          id: context["@id"],
          action: actionOption.hint,
        });
        if (redirectPath) {
          storage.setPendingResponse(newContext);
          location.href = window.location.search
            ? redirectPath + window.location.search
            : redirectPath;
        } else {
          onSuccessCallback(newContext);
        }
      } catch (err) {
        if (redirectPath) {
          location.href = window.location.search
            ? redirectPath + window.location.search
            : redirectPath;
          console.error(
            "Temporary fallback: Redirection will not work in the future. Make sure your authentication flow is setup correctly (action node outputs must not be empty).",
          );
        } else if (onFailCallback) {
          onFailCallback(err);
        }
        console.error(err);
      }
    };

    let buttonLabel;
    let buttonId;
    let clickHandler;
    let actionName;
    let redirectPath;

    switch (actionOption.hint) {
      case "login": {
        buttonLabel =
          (customLabels && customLabels.alreadyHaveAnAccountButton) ||
          defaultLabels.alreadyHaveAnAccountButton;
        buttonId = elementIds.loginBtn;
        clickHandler = handleClick(loginPath);
        actionName = "alreadyRegistered";
        redirectPath =
          window.location.search && loginPath ? loginPath + window.location.search : loginPath;
        break;
      }
      case "register": {
        buttonLabel =
          (customLabels && customLabels.registerLinkButton) || defaultLabels.registerLinkButton;
        buttonId = elementIds.registrationBtn;
        clickHandler = handleClick(registrationPath);
        actionName = "register";
        redirectPath =
          window.location.search && registrationPath
            ? registrationPath + window.location.search
            : registrationPath;
        break;
      }
      case "forgotten": {
        buttonLabel =
          (customLabels && customLabels.forgotPasswordButton) ||
          defaultLabels.forgotPasswordButton;
        buttonId = elementIds.forgotPasswordBtn;
        clickHandler = handleClick(forgotPasswordPath);
        actionName = "forgotten";
        redirectPath =
          window.location.search && forgotPasswordPath
            ? forgotPasswordPath + window.location.search
            : forgotPasswordPath;
        break;
      }
      default: {
        buttonLabel = actionOption.locale_key;
        actionName = actionOption.hint;
        clickHandler = handleClick();
      }
    }

    const button = navButtonUI({
      label: buttonLabel,
      id: buttonId,
      onClick: clickHandler,
    });

    htmlContainer.appendChild(
      createRenderComponentCallback(
        onRenderComponent,
        button,
        "action",
        actionName,
        buttonLabel,
        redirectPath,
      ),
    );
  });
};

module.exports = action;
