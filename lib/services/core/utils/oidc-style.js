const getOidcBgColor = (provider) => {
  return provider === "indykite.id" ? "rgb(255, 183, 82)" : "rgb(255, 255, 255)";
};

module.exports = {
  getOidcBgColor,
};
