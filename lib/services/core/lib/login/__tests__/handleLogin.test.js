const storage = require("../../storage");
const { getOidcFinalUrlWithLoginVerifier } = require("../../../utils/helpers");
const {
  sendCredentialsForLoginOrRegister,
  sendVerifierForLoginOrRegister,
} = require("../../common");
const handleLogin = require("../handleLogin");

jest.mock("../../storage");
jest.mock("../../notifications");
jest.mock("../../../utils/helpers");
jest.mock("../../common");

const originalLocation = window.location;

beforeAll(() => {
  delete window.location;
  window.IKSDK = {
    registeredCallback: jest.fn(),
  };
});

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(document, "querySelector").mockImplementation((selector) => {
    switch (selector) {
      case "#IKUISDK-username":
        return { value: "email-param-from-input" };
      case "#IKUISDK-password":
        return { value: "password-param-from-input" };
      default:
        return {};
    }
  });
  getOidcFinalUrlWithLoginVerifier.mockImplementation(() => "/path/to/redirect");
});

afterEach(() => {
  document.querySelector.mockRestore();
  delete window.location;
});

afterAll(() => {
  window.location = originalLocation;
});

let returnedValue;

describe("when email and password are passed via arguments", () => {
  const onSuccessCallback = jest.fn();

  describe("when it is not an OIDC flow", () => {
    describe("when the responses are correct", () => {
      describe("when the first request returns a 'verifier' message type", () => {
        describe("when onSuccessCallback function is passed", () => {
          beforeEach(async () => {
            sendCredentialsForLoginOrRegister.mockImplementation(() => {
              return {
                data: {
                  "~thread": {
                    thid: "thread-id",
                  },
                  verifier: "verifier-token",
                  "@type": "verifier",
                },
              };
            });

            sendVerifierForLoginOrRegister.mockImplementation(() => {
              return {
                data: {
                  consentChallenge: "consent-challenge-token",
                },
              };
            });

            returnedValue = await handleLogin({
              id: "login-id",
              emailValueParam: "email-param",
              passwordValueParam: "password-param",
              onSuccessCallback,
            });
          });

          it("sends correct credentials", () => {
            expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
            expect(sendCredentialsForLoginOrRegister.mock.calls[0]).toEqual([
              {
                id: "login-id",
                emailValueParam: "email-param",
                passwordValueParam: "password-param",
              },
            ]);
          });

          it("sends correct verifier", () => {
            expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
            expect(sendVerifierForLoginOrRegister.mock.calls[0]).toEqual(["thread-id"]);
          });

          it("stores login data", () => {
            expect(storage.storeOnLoginSuccess).toBeCalledTimes(1);
            expect(storage.storeOnLoginSuccess.mock.calls[0]).toEqual([
              {
                consentChallenge: "consent-challenge-token",
              },
            ]);
          });

          it("does not change location", () => {
            expect(storage.clearOidcData).toBeCalledTimes(0);
            expect(getOidcFinalUrlWithLoginVerifier).toBeCalledTimes(0);
            expect(window.location).toBeUndefined();
          });

          it("calls the callback function", () => {
            expect(onSuccessCallback).toBeCalledTimes(1);
            expect(onSuccessCallback.mock.calls[0]).toEqual([
              {
                consentChallenge: "consent-challenge-token",
              },
            ]);
          });

          it("does not call registered callback function", () => {
            expect(window.IKSDK.registeredCallback).toBeCalledTimes(0);
          });

          it("returns correct value", () => {
            expect(returnedValue).toEqual({
              consentChallenge: "consent-challenge-token",
            });
          });
        });

        describe("when onSuccessCallback function is not passed", () => {
          beforeEach(async () => {
            sendCredentialsForLoginOrRegister.mockImplementation(() => {
              return {
                data: {
                  "~thread": {
                    thid: "thread-id",
                  },
                  verifier: "verifier-token",
                  "@type": "verifier",
                },
              };
            });

            sendVerifierForLoginOrRegister.mockImplementation(() => {
              return {
                data: {
                  consentChallenge: "consent-challenge-token",
                },
              };
            });

            returnedValue = await handleLogin({
              id: "login-id",
              emailValueParam: "email-param",
              passwordValueParam: "password-param",
            });
          });

          it("sends correct credentials", () => {
            expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
            expect(sendCredentialsForLoginOrRegister.mock.calls[0]).toEqual([
              {
                id: "login-id",
                emailValueParam: "email-param",
                passwordValueParam: "password-param",
              },
            ]);
          });

          it("sends correct verifier", () => {
            expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
            expect(sendVerifierForLoginOrRegister.mock.calls[0]).toEqual(["thread-id"]);
          });

          it("stores login data", () => {
            expect(storage.storeOnLoginSuccess).toBeCalledTimes(1);
            expect(storage.storeOnLoginSuccess.mock.calls[0]).toEqual([
              {
                consentChallenge: "consent-challenge-token",
              },
            ]);
          });

          it("does not change location", () => {
            expect(getOidcFinalUrlWithLoginVerifier).toBeCalledTimes(0);
            expect(window.location).toBeUndefined();
          });

          it("calls registered callback function", () => {
            expect(window.IKSDK.registeredCallback).toBeCalledTimes(1);
            expect(window.IKSDK.registeredCallback.mock.calls[0]).toEqual([
              {
                consentChallenge: "consent-challenge-token",
              },
            ]);
          });

          it("returns correct value", () => {
            expect(returnedValue).toEqual({
              consentChallenge: "consent-challenge-token",
            });
          });
        });

        describe("when neither onSuccessCallback nor registered callback are present", () => {
          let savedIKSDK;

          beforeEach(async () => {
            savedIKSDK = window.IKSDK;
            window.IKSDK = undefined;

            sendCredentialsForLoginOrRegister.mockImplementation(() => {
              return {
                data: {
                  "~thread": {
                    thid: "thread-id",
                  },
                  verifier: "verifier-token",
                  "@type": "verifier",
                },
              };
            });

            sendVerifierForLoginOrRegister.mockImplementation(() => {
              return {
                data: {
                  consentChallenge: "consent-challenge-token",
                },
              };
            });

            returnedValue = await handleLogin({
              id: "login-id",
              emailValueParam: "email-param",
              passwordValueParam: "password-param",
            });
          });

          afterEach(() => {
            window.IKSDK = savedIKSDK;
          });

          it("sends correct credentials", () => {
            expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
            expect(sendCredentialsForLoginOrRegister.mock.calls[0]).toEqual([
              {
                id: "login-id",
                emailValueParam: "email-param",
                passwordValueParam: "password-param",
              },
            ]);
          });

          it("sends correct verifier", () => {
            expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
            expect(sendVerifierForLoginOrRegister.mock.calls[0]).toEqual(["thread-id"]);
          });

          it("stores login data", () => {
            expect(storage.storeOnLoginSuccess).toBeCalledTimes(1);
            expect(storage.storeOnLoginSuccess.mock.calls[0]).toEqual([
              {
                consentChallenge: "consent-challenge-token",
              },
            ]);
          });

          it("does not change location", () => {
            expect(getOidcFinalUrlWithLoginVerifier).toBeCalledTimes(0);
            expect(window.location).toBeUndefined();
          });

          it("returns correct value", () => {
            expect(returnedValue).toEqual({
              consentChallenge: "consent-challenge-token",
            });
          });
        });
      });

      describe("when the first request returns an 'oidc' message type", () => {
        describe("when onSuccessCallback function is passed", () => {
          beforeEach(async () => {
            sendCredentialsForLoginOrRegister.mockImplementation(() => {
              return {
                data: {
                  "~thread": {
                    thid: "thread-id",
                  },
                  prv: "indykite.me",
                  "@type": "oidc",
                },
              };
            });

            returnedValue = await handleLogin({
              id: "login-id",
              emailValueParam: "email-param",
              passwordValueParam: "password-param",
              onSuccessCallback,
            });
          });

          it("sends correct credentials", () => {
            expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
            expect(sendCredentialsForLoginOrRegister.mock.calls[0]).toEqual([
              {
                id: "login-id",
                emailValueParam: "email-param",
                passwordValueParam: "password-param",
              },
            ]);
          });

          it("does not try to send a verifier", () => {
            expect(sendVerifierForLoginOrRegister).toBeCalledTimes(0);
          });

          it("does not store login data", () => {
            expect(storage.storeOnLoginSuccess).toBeCalledTimes(0);
          });

          it("stores thread ID", () => {
            expect(storage.setThreadId).toBeCalledTimes(1);
            expect(storage.setThreadId).toBeCalledWith("thread-id");
          });

          it("does not change location", () => {
            expect(storage.clearOidcData).toBeCalledTimes(0);
            expect(getOidcFinalUrlWithLoginVerifier).toBeCalledTimes(0);
            expect(window.location).toBeUndefined();
          });

          it("calls the callback function", () => {
            expect(onSuccessCallback).toBeCalledTimes(1);
            expect(onSuccessCallback).toBeCalledWith({
              "~thread": {
                thid: "thread-id",
              },
              prv: "indykite.me",
              "@type": "oidc",
            });
          });

          it("does not call registered callback function", () => {
            expect(window.IKSDK.registeredCallback).toBeCalledTimes(0);
          });

          it("returns correct value", () => {
            expect(returnedValue).toEqual({
              "~thread": {
                thid: "thread-id",
              },
              prv: "indykite.me",
              "@type": "oidc",
            });
          });
        });

        describe("when onSuccessCallback function is not passed", () => {
          let savedIKSDK;

          beforeEach(async () => {
            savedIKSDK = window.IKSDK;
            window.IKSDK = undefined;

            sendCredentialsForLoginOrRegister.mockImplementation(() => {
              return {
                data: {
                  "~thread": {
                    thid: "thread-id",
                  },
                  prv: "indykite.me",
                  "@type": "oidc",
                },
              };
            });

            returnedValue = await handleLogin({
              id: "login-id",
              emailValueParam: "email-param",
              passwordValueParam: "password-param",
            });
          });

          afterEach(() => {
            window.IKSDK = savedIKSDK;
          });

          it("sends correct credentials", () => {
            expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
            expect(sendCredentialsForLoginOrRegister.mock.calls[0]).toEqual([
              {
                id: "login-id",
                emailValueParam: "email-param",
                passwordValueParam: "password-param",
              },
            ]);
          });

          it("does not try to send a verifier", () => {
            expect(sendVerifierForLoginOrRegister).toBeCalledTimes(0);
          });

          it("does not store login data", () => {
            expect(storage.storeOnLoginSuccess).toBeCalledTimes(0);
          });

          it("stores thread ID", () => {
            expect(storage.setThreadId).toBeCalledTimes(1);
            expect(storage.setThreadId).toBeCalledWith("thread-id");
          });

          it("does not change location", () => {
            expect(getOidcFinalUrlWithLoginVerifier).toBeCalledTimes(0);
            expect(window.location).toBeUndefined();
          });

          it("returns correct value", () => {
            expect(returnedValue).toEqual({
              "~thread": {
                thid: "thread-id",
              },
              prv: "indykite.me",
              "@type": "oidc",
            });
          });
        });
      });
    });

    describe("when the first request does not have a response", () => {
      let caughtError;

      beforeEach(async () => {
        try {
          await handleLogin({
            id: "login-id",
            emailValueParam: "email-param",
            passwordValueParam: "password-param",
            onSuccessCallback,
          });
        } catch (err) {
          caughtError = err;
        }
      });

      it("sends correct credentials", () => {
        expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
        expect(sendCredentialsForLoginOrRegister.mock.calls[0]).toEqual([
          {
            id: "login-id",
            emailValueParam: "email-param",
            passwordValueParam: "password-param",
          },
        ]);
      });

      it("does not send verifier", () => {
        expect(sendVerifierForLoginOrRegister).toBeCalledTimes(0);
      });

      it("does not store login data", () => {
        expect(storage.storeOnLoginSuccess).toBeCalledTimes(0);
      });

      it("does not change location", () => {
        expect(getOidcFinalUrlWithLoginVerifier).toBeCalledTimes(0);
        expect(window.location).toBeUndefined();
      });

      it("does not call the callback function", () => {
        expect(onSuccessCallback).toBeCalledTimes(0);
      });

      it("does not call registered callback function", () => {
        expect(window.IKSDK.registeredCallback).toBeCalledTimes(0);
      });

      it("throws an error", () => {
        expect(caughtError).toBe(
          "Oops something went wrong when sending credentials to the indentity provider server.",
        );
      });
    });

    describe("when the first request returns an error response", () => {
      let caughtError;

      beforeEach(async () => {
        sendCredentialsForLoginOrRegister.mockImplementation(() => ({
          data: {
            "~error": "Test error",
          },
        }));

        try {
          await handleLogin({
            id: "login-id",
            emailValueParam: "email-param",
            passwordValueParam: "password-param",
            onSuccessCallback,
          });
        } catch (err) {
          caughtError = err;
        }
      });

      it("sends correct credentials", () => {
        expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
        expect(sendCredentialsForLoginOrRegister.mock.calls[0]).toEqual([
          {
            id: "login-id",
            emailValueParam: "email-param",
            passwordValueParam: "password-param",
          },
        ]);
      });

      it("does not send verifier", () => {
        expect(sendVerifierForLoginOrRegister).toBeCalledTimes(0);
      });

      it("does not store login data", () => {
        expect(storage.storeOnLoginSuccess).toBeCalledTimes(0);
      });

      it("does not change location", () => {
        expect(getOidcFinalUrlWithLoginVerifier).toBeCalledTimes(0);
        expect(window.location).toBeUndefined();
      });

      it("does not call the callback function", () => {
        expect(onSuccessCallback).toBeCalledTimes(0);
      });

      it("does not call registered callback function", () => {
        expect(window.IKSDK.registeredCallback).toBeCalledTimes(0);
      });

      it("throws an error", () => {
        expect(caughtError).toEqual({
          "~error": "Test error",
        });
      });
    });

    describe("when the second request returns an error response", () => {
      let caughtError;

      beforeEach(async () => {
        sendCredentialsForLoginOrRegister.mockImplementation(() => {
          return {
            data: {
              "~thread": {
                thid: "thread-id",
              },
              verifier: "verifier-token",
              "@type": "verifier",
            },
          };
        });

        sendVerifierForLoginOrRegister.mockImplementation(() => {
          return {
            data: {
              "~error": "Test error",
            },
          };
        });

        try {
          await handleLogin({
            id: "login-id",
            emailValueParam: "email-param",
            passwordValueParam: "password-param",
            onSuccessCallback,
          });
        } catch (err) {
          caughtError = err;
        }
      });

      it("sends correct credentials", () => {
        expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
        expect(sendCredentialsForLoginOrRegister.mock.calls[0]).toEqual([
          {
            id: "login-id",
            emailValueParam: "email-param",
            passwordValueParam: "password-param",
          },
        ]);
      });

      it("sends correct verifier", () => {
        expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
        expect(sendVerifierForLoginOrRegister.mock.calls[0]).toEqual(["thread-id"]);
      });

      it("does not store login data", () => {
        expect(storage.storeOnLoginSuccess).toBeCalledTimes(0);
      });

      it("does not change location", () => {
        expect(getOidcFinalUrlWithLoginVerifier).toBeCalledTimes(0);
        expect(window.location).toBeUndefined();
      });

      it("does not call the callback function", () => {
        expect(onSuccessCallback).toBeCalledTimes(0);
      });

      it("does not call registered callback function", () => {
        expect(window.IKSDK.registeredCallback).toBeCalledTimes(0);
      });

      it("throws an error", () => {
        expect(caughtError).toEqual({
          "~error": "Test error",
        });
      });
    });
  });

  describe("when it is an OIDC flow", () => {
    describe("when the responses are correct", () => {
      beforeEach(async () => {
        storage.getOidcOriginalParams.mockImplementation(() => ({
          redirect_url: "https://www.example.com",
        }));

        sendCredentialsForLoginOrRegister.mockImplementation(() => {
          return {
            data: {
              "~thread": {
                thid: "thread-id",
              },
              verifier: "verifier-token",
              "@type": "verifier",
            },
          };
        });

        sendVerifierForLoginOrRegister.mockImplementation(() => {
          return {
            data: {
              consentChallenge: "consent-challenge-token",
            },
          };
        });

        returnedValue = await handleLogin({
          id: "login-id",
          emailValueParam: "email-param",
          passwordValueParam: "password-param",
          onSuccessCallback,
        });
      });

      it("sends correct credentials", () => {
        expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
        expect(sendCredentialsForLoginOrRegister.mock.calls[0]).toEqual([
          {
            id: "login-id",
            emailValueParam: "email-param",
            passwordValueParam: "password-param",
          },
        ]);
      });

      it("sends correct verifier", () => {
        expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
        expect(sendVerifierForLoginOrRegister.mock.calls[0]).toEqual(["thread-id"]);
      });

      it("stores login data", () => {
        expect(storage.storeOnLoginSuccess).toBeCalledTimes(1);
        expect(storage.storeOnLoginSuccess.mock.calls[0]).toEqual([
          {
            consentChallenge: "consent-challenge-token",
          },
        ]);
      });

      it("changes the location", () => {
        expect(storage.clearOidcData).toBeCalledTimes(1);
        expect(getOidcFinalUrlWithLoginVerifier).toBeCalledTimes(1);
        expect(getOidcFinalUrlWithLoginVerifier.mock.calls[0]).toEqual([
          { redirect_url: "https://www.example.com" },
          "verifier-token",
        ]);
        expect(window.location).toBe("/path/to/redirect");
      });

      it("does not call the callback function", () => {
        expect(onSuccessCallback).toBeCalledTimes(0);
      });

      it("does not call registered callback function", () => {
        expect(window.IKSDK.registeredCallback).toBeCalledTimes(0);
      });

      it("returns nothing", () => {
        expect(returnedValue).toBeUndefined();
      });
    });
  });
});

describe("when email and password are passed via arguments", () => {
  const onSuccessCallback = jest.fn();

  describe("when it is not an OIDC flow", () => {
    describe("when the responses are correct", () => {
      beforeEach(async () => {
        sendCredentialsForLoginOrRegister.mockImplementation(() => {
          return {
            data: {
              "~thread": {
                thid: "thread-id",
              },
              verifier: "verifier-token",
              "@type": "verifier",
            },
          };
        });

        sendVerifierForLoginOrRegister.mockImplementation(() => {
          return {
            data: {
              consentChallenge: "consent-challenge-token",
            },
          };
        });

        returnedValue = await handleLogin({
          id: "login-id",
          emailValueParam: null,
          passwordValueParam: null,
          onSuccessCallback,
        });
      });

      it("sends correct credentials", () => {
        expect(sendCredentialsForLoginOrRegister).toBeCalledTimes(1);
        expect(sendCredentialsForLoginOrRegister.mock.calls[0]).toEqual([
          {
            id: "login-id",
            emailValueParam: "email-param-from-input",
            passwordValueParam: "password-param-from-input",
          },
        ]);
      });

      it("sends correct verifier", () => {
        expect(sendVerifierForLoginOrRegister).toBeCalledTimes(1);
        expect(sendVerifierForLoginOrRegister.mock.calls[0]).toEqual(["thread-id"]);
      });

      it("stores login data", () => {
        expect(storage.storeOnLoginSuccess).toBeCalledTimes(1);
        expect(storage.storeOnLoginSuccess.mock.calls[0]).toEqual([
          {
            consentChallenge: "consent-challenge-token",
          },
        ]);
      });

      it("does not change location", () => {
        expect(storage.clearOidcData).toBeCalledTimes(0);
        expect(getOidcFinalUrlWithLoginVerifier).toBeCalledTimes(0);
        expect(window.location).toBeUndefined();
      });

      it("calls the callback function", () => {
        expect(onSuccessCallback).toBeCalledTimes(1);
        expect(onSuccessCallback.mock.calls[0]).toEqual([
          {
            consentChallenge: "consent-challenge-token",
          },
        ]);
      });

      it("does not call registered callback function", () => {
        expect(window.IKSDK.registeredCallback).toBeCalledTimes(0);
      });

      it("returns correct value", () => {
        expect(returnedValue).toEqual({
          consentChallenge: "consent-challenge-token",
        });
      });
    });
  });
});
