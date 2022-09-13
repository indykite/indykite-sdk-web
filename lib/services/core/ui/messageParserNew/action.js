const { getElementIds } = require("../../lib/config");
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
 *   onFailCallback: (err: Error) => void;
 *   onRenderComponent?: () => HTMLElement|undefined;
 *   onSuccessCallback: (newContext: unknown) => void;
 * }} arguments
 */
const action = ({
  actionLabels = {},
  context = {},
  htmlContainer,
  onFailCallback,
  onRenderComponent,
  onSuccessCallback,
}) => {
  const elementIds = getElementIds();
  (context.opts || []).forEach((actionOption) => {
    const handleClick = async () => {
      try {
        const newContext = await handleAction({
          id: context["@id"],
          action: actionOption.hint,
        });
        onSuccessCallback(newContext);
      } catch (err) {
        if (onFailCallback) {
          onFailCallback(err);
        }
        console.error(err);
      }
    };

    const localeKey = actionOption.locale_key;
    const buttonLabel = actionLabels[localeKey] || localeKey;
    const buttonId = `${elementIds.btnPrefix}-action-${actionOption.hint}`;
    const actionName = actionOption.hint;

    const button = navButtonUI({
      label: buttonLabel,
      id: buttonId,
      onClick: handleClick,
    });

    htmlContainer.appendChild(
      createRenderComponentCallback(onRenderComponent, button, "action", actionName, buttonLabel),
    );
  });
};

module.exports = action;
