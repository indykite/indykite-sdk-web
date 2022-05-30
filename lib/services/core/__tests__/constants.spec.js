describe("colors", () => {
  const { colors } = require("../constants");
  test("error is red", () => {
    const { error } = colors;
    expect(error).toBe("rgb(240, 93, 85)");
  });
  test("success is green", () => {
    const { success } = colors;
    expect(success).toBe("rgb(182, 251, 145)");
  });
  test("info is white", () => {
    const { info } = colors;
    expect(info).toBe("rgb(250, 250, 250)");
  });
});

describe("flowTypes", () => {
  const { flowTypes } = require("../constants");
  test("register", () => {
    const { register } = flowTypes;
    expect(typeof register).toBe("string");
    expect(register).toBe("register");
  });
  test("login", () => {
    const { login } = flowTypes;
    expect(typeof login).toBe("string");
    expect(login).toBe("customer");
  });
});
