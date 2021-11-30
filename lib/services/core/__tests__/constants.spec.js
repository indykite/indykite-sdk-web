describe("colors", () => {
  const { colors } = require('../constants');
  test("error is red", () => {
    const { error } = colors;
    expect(error).toBe("red");
  });
  test("success is green", () => {
    const { success } = colors;
    expect(success).toBe("#B6FB91");
  });
  test("info is white", () => {
    const { info } = colors;
    expect(info).toBe("white");
  });
});

describe("flowTypes", () => {
  const { flowTypes } = require("../constants");
  test("register", () => {
    const { register } = flowTypes;
    expect(typeof register).toBe('string');
    expect(register).toBe('register');
  });
  test("login", () => {
    const { login } = flowTypes;
    expect(typeof login).toBe("string");
    expect(login).toBe("customer");
  });
});
