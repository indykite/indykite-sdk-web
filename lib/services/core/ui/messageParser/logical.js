const { createRenderComponentCallback } = require("../../utils/helpers");
const { divider } = require("../components/divider");
const { text } = require("../components/texts");

const optionTypeOrder = ["form", "action", null, "oidc"];
const defaultIndex = optionTypeOrder.indexOf(null);
const getOptionIndex = (optionType) => {
  const index = optionTypeOrder.indexOf(optionType);
  return index === -1 ? defaultIndex : index;
};

/**
 * TODO: Sorting should be done in the console.
 * Remove this sorting after it's implemented in the console.
 */
const sortOptions = (a, b) => {
  const aTypeIndex = getOptionIndex(a["@type"]);
  const bTypeIndex = getOptionIndex(b["@type"]);

  if (aTypeIndex === bTypeIndex) {
    const aOrd = a["~ord"];
    const bOrd = b["~ord"];

    return aOrd === bOrd ? 0 : aOrd - bOrd;
  }

  return aTypeIndex - bTypeIndex;
};

/**
 * @typedef {{
 *   orOtherOptions: string;
 * }} Labels
 */

/**
 * @typedef {{
 *   "@type": string;
 * }} Option
 */

/**
 * @param {{
 *   context: {
 *     op: string;
 *     opts: Option[];
 *   };
 *   htmlContainer: HTMLElement;
 *   labels: {
 *     default: Labels;
 *     custom?: Partial<Labels>;
 *   };
 *   onRenderComponent?: () => HTMLElement|undefined;
 * }} params
 * @param {(option: Option) => void} optionCallback
 */
const logical = ({ context, htmlContainer, labels = {}, onRenderComponent }, optionCallback) => {
  if (context.op !== "or") {
    throw new Error(`Incorrect operation (${context.op}) of logic type.`);
  }

  const { default: defaultLabels, custom: customLabels } = labels;

  // TODO: Remove this filter after webauthn is implemented
  const filteredOptions = ((context && context.opts) || []).filter(
    (option) => option["@type"] !== "webauthn",
  );
  const sortedOptions = filteredOptions.sort(sortOptions);
  sortedOptions.forEach((option, index) => {
    if (index > 0 && option["@type"] !== sortedOptions[index - 1]["@type"]) {
      const hr = divider();
      htmlContainer.appendChild(
        createRenderComponentCallback(onRenderComponent, hr, "separator"),
      );
      if (option["@type"] === "oidc") {
        const otherMethodsHintEl = text(
          (customLabels && customLabels.orOtherOptions) || defaultLabels.orOtherOptions,
        );
        otherMethodsHintEl.className = "oidc-options-label";
        htmlContainer.appendChild(otherMethodsHintEl);
      }
    }
    optionCallback(option);
  });
};

module.exports = logical;
