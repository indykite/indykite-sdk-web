const { createRenderComponentCallback } = require("../../utils/helpers");
const { divider } = require("../components/divider");
const { text } = require("../components/texts");

const optionTypeOrder = ["form", "action", null, ["oidc", "webauthn"]];
const defaultIndex = optionTypeOrder.indexOf(null);
const getOptionIndex = (optionType) => {
  const index = optionTypeOrder.findIndex((optionTypeItem) => {
    if (Array.isArray(optionTypeItem)) {
      return optionTypeItem.includes(optionType);
    }
    return optionTypeItem === optionType;
  });
  return index === -1 ? defaultIndex : index;
};

const haveSameOptionIndex = (a, b) => {
  return getOptionIndex(a) === getOptionIndex(b);
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
  const options = (context && context.opts) || [];
  const sortedOptions = options.sort(sortOptions);
  sortedOptions.forEach((option, index) => {
    if (index > 0 && !haveSameOptionIndex(option["@type"], sortedOptions[index - 1]["@type"])) {
      const hr = divider();
      htmlContainer.appendChild(
        createRenderComponentCallback(onRenderComponent, hr, "separator"),
      );
      if (["oidc", "webauthn"].includes(option["@type"])) {
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
