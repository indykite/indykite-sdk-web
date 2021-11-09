const getOidcBgColor = (type) => {
  switch (type) {
    case "facebook":
      return "rgb(24, 119, 242)";
    case "microsoft":
      return "rgb(255, 255, 255)";
    case "google":
      return "rgb(255, 255, 255)";
    case "linkedin":
      return "rgb(40, 103, 178)";
    case "authenteq":
      return "rgb(255, 109, 51)";
    default:
      return "rgb(43, 130, 180)";
  }
};

const getOidcColor = (type) => {
  switch (type) {
    case "google":
    case "microsoft":
      return "rgb(115, 115, 115)";
    default:
      return "rgb(255, 255, 255)";
  }
};

module.exports = {
  getOidcBgColor,
  getOidcColor,
};
