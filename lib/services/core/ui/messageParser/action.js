const { getElementIds } = require("../../lib/config");
const { createRenderComponentCallback } = require("../../utils/helpers");
const { navButtonUI } = require("../components/buttons");

/**
 * @typedef {{
 *   alreadyHaveAnAccountButton: string;
 *   forgotPasswordButton: string;
 *   registerButton: string;
 * }} Labels
 */

/**
 * @param {{
 *   context: {
 *     opts: {
 *       hint: string;
 *       icon: string;
 *       locale_key: string;
 *       "~ord": number;
 *     }[];
 *   };
 *   htmlContainer: HTMLElement;
 *   isRegistration: boolean;
 *   labels: {
 *     default: Labels;
 *     custom?: Partial<Labels>;
 *   };
 *   onRenderComponent?: () => HTMLElement|undefined;
 *   paths: {
 *     forgotPassword: string;
 *     login: string;
 *     registration: string;
 *   };
 * }} arguments
 */
const action = ({
  context,
  htmlContainer,
  isRegistration,
  labels = {},
  onRenderComponent,
  paths = {},
}) => {
  const { default: defaultLabels, custom: customLabels } = labels;
  const {
    forgotPassword: forgotPasswordPath,
    login: loginPath,
    registration: registrationPath,
  } = paths;
  const elementIds = getElementIds();
  if (isRegistration) {
    const buttonLabel =
      (customLabels && customLabels.alreadyHaveAnAccountButton) ||
      defaultLabels.alreadyHaveAnAccountButton;
    const alreadyRegisteredNavBtn = navButtonUI({
      id: elementIds.loginBtn,
      label: buttonLabel,
      href: loginPath + document.location.search,
    });
    htmlContainer.appendChild(
      createRenderComponentCallback(
        onRenderComponent,
        alreadyRegisteredNavBtn,
        "action",
        "alreadyRegistered",
        buttonLabel,
        loginPath + document.location.search,
      ),
    );
  } else {
    (context.opts || []).forEach((actionOption) => {
      switch (actionOption.hint) {
        case "forgotten": {
          const buttonLabel =
            (customLabels && customLabels.forgotPasswordButton) ||
            defaultLabels.forgotPasswordButton;
          const forgotPasswordBtn = navButtonUI({
            id: elementIds.forgotPasswordBtn,
            label: buttonLabel,
            href: forgotPasswordPath + document.location.search,
          });

          htmlContainer.appendChild(
            createRenderComponentCallback(
              onRenderComponent,
              forgotPasswordBtn,
              "action",
              "forgotten",
              buttonLabel,
              forgotPasswordPath + document.location.search,
            ),
          );
          break;
        }
        case "register": {
          const buttonLabel =
            (customLabels && customLabels.registerButton) || defaultLabels.registerButton;
          const createNewAccountBtn = navButtonUI({
            id: elementIds.registrationBtn,
            label: buttonLabel,
            href: registrationPath,
          });
          htmlContainer.appendChild(
            createRenderComponentCallback(
              onRenderComponent,
              createNewAccountBtn,
              "action",
              "register",
              buttonLabel,
              registrationPath,
            ),
          );
          break;
        }
      }
    });
  }
};

module.exports = action;
