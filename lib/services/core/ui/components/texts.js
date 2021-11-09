const text = (text) => {
  const element = document.createElement("p");
  element.style.cssText =
    "font-family: 'Raleway', sans-serif;font-size: 14px;text-align: center; font-size: 16px;";
  element.innerText = text;

  return element;
};

module.exports = {
  text,
};
