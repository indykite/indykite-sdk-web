const handleLogin = require("../handleLogin");
const isAuthenticated = require("../isAuthenticated");
const login = require("../login");
const loginSetup = require("../loginSetup");
const initOidcAuthorizationRequest = require("../initOidcAuthorizationRequest");
const skipIfLogged = require("../skipIfLogged");
const oidcCallback = require("../oidcCallback");
const index = require("../index");

it("returns correct references", () => {
  expect(index.handleLogin).toBe(handleLogin);
  expect(index.isAuthenticated).toBe(isAuthenticated);
  expect(index.login).toBe(login);
  expect(index.loginSetup).toBe(loginSetup);
  expect(index.initOidcAuthorizationRequest).toBe(initOidcAuthorizationRequest);
  expect(index.skipIfLogged).toBe(skipIfLogged);
  expect(index.oidcCallback).toBe(oidcCallback);
});
