const { getOidcBgColor } = require("../oidc-style");

describe("getOidcBgColor", () => {
  it("returns a correct color", () => {
    expect(getOidcBgColor("facebook")).toBe("rgb(255, 255, 255)");
    expect(getOidcBgColor("microsoft")).toBe("rgb(255, 255, 255)");
    expect(getOidcBgColor("google")).toBe("rgb(255, 255, 255)");
    expect(getOidcBgColor("linkedin")).toBe("rgb(255, 255, 255)");
    expect(getOidcBgColor("authenteq")).toBe("rgb(255, 255, 255)");
    expect(getOidcBgColor("indykite.id")).toBe("rgb(255, 183, 82)");
    expect(getOidcBgColor()).toBe("rgb(255, 255, 255)");
  });
});
