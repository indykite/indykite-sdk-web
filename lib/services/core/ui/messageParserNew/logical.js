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
 * }} params
 * @param {(option: Option) => void} optionCallback
 */
const logical = ({ context }, optionCallback) => {
  if (context.op !== "or") {
    throw new Error(`Incorrect operation (${context.op}) of logic type.`);
  }

  const sortedOptions = ((context && context.opts) || []).sort(sortOptions);
  sortedOptions.forEach((option) => optionCallback(option));
};

module.exports = logical;
