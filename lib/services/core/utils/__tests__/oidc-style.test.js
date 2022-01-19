const { getOidcBgColor, getOidcColor } = require("../oidc-style");

describe("getOidcBgColor", () => {
  it("returns a correct color", () => {
    expect(getOidcBgColor("facebook")).toBe("rgb(24, 119, 242)");
    expect(getOidcBgColor("microsoft")).toBe("rgb(255, 255, 255)");
    expect(getOidcBgColor("google")).toBe("rgb(255, 255, 255)");
    expect(getOidcBgColor("linkedin")).toBe("rgb(40, 103, 178)");
    expect(getOidcBgColor("authenteq")).toBe("rgb(255, 109, 51)");
    expect(getOidcBgColor()).toBe("rgb(43, 130, 180)");
  });
});

describe("getOidcColor", () => {
  it("returns a correct color", () => {
    expect(getOidcColor("facebook")).toBe("rgb(255, 255, 255)");
    expect(getOidcColor("microsoft")).toBe("rgb(115, 115, 115)");
    expect(getOidcColor("google")).toBe("rgb(115, 115, 115)");
    expect(getOidcColor("linkedin")).toBe("rgb(255, 255, 255)");
    expect(getOidcColor("authenteq")).toBe("rgb(255, 255, 255)");
    expect(getOidcColor()).toBe("rgb(255, 255, 255)");
  });
});
