const sendCredentialsForLoginOrRegister = require("../sendCredentialsForLoginOrRegister");
const sendVerifierForLoginOrRegister = require("../sendVerifierForLoginOrRegister");
const setupRequest = require("../setupRequest");
const index = require("../index");

it("loads correct sendCredentialsForLoginOrRegister function", () => {
  expect(index.sendCredentialsForLoginOrRegister).toBe(sendCredentialsForLoginOrRegister);
});

it("loads correct sendVerifierForLoginOrRegister function", () => {
  expect(index.sendVerifierForLoginOrRegister).toBe(sendVerifierForLoginOrRegister);
});

it("loads correct setupRequest function", () => {
  expect(index.setupRequest).toBe(setupRequest);
});
