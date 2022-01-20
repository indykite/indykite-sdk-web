/**
 * Helper function to prevent from displaying components multiple times in case of rerenders for example.
 * @param {HTMLElement} parent
 * @param {HTMLElement} child
 */
const updateParentElement = ({ parent, child }) => {
  while (parent && parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }

  parent.appendChild(child);
};

module.exports = updateParentElement;
