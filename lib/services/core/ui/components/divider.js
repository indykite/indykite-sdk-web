const divider = () => {
  const element = document.createElement("hr");
  element.style.cssText = "border-color: rgb(111, 120, 132); opacity: 0.35; margin-bottom: 20px;";

  return element;
};

module.exports = {
  divider,
};
