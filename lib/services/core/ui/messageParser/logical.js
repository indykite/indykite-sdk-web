const optionTypeOrder = ["form", "action", null, "oidc"];
const fixedOptionTypes = ["message"];
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
  if (fixedOptionTypes.includes(a["@type"]) || fixedOptionTypes.includes(b["@type"])) {
    return 0;
  }

  const aTypeIndex = getOptionIndex(a["@type"]);
  const bTypeIndex = getOptionIndex(b["@type"]);

  if (aTypeIndex === bTypeIndex) {
    const aOrd = a["~ord"];
    const bOrd = b["~ord"];

    return aOrd - bOrd;
  }

  return aTypeIndex - bTypeIndex;
};

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
const logical = ({ context, htmlContainer, labels, onRenderComponent }, optionCallback) => {
  if (context.op !== "or") {
    throw new Error(`Incorrect operation (${context.op}) of logic type.`);
  }

  const { default: defaultLabels, custom: customLabels } = labels;

  // TODO: Remove this filter after webauthn is implemented
  const filteredOptions = ((context && context.opts) || []).filter(
    (option) => option["@type"] !== "webauthn",
  );
  const sortedOptions = filteredOptions.sort(sortOptions);
  sortedOptions.forEach((option) => optionCallback(option));
};

module.exports = logical;
