const handleRegister = require("../handleRegister");
const register = require("../register");
const registrationFormSetupRequest = require("../registrationFormSetupRequest");
const index = require("../index");

it("returns a correct reference", () => {
  expect(index.handleRegister).toBe(handleRegister);
  expect(index.register).toBe(register);
  expect(index.registrationFormSetupRequest).toBe(registrationFormSetupRequest);
});
