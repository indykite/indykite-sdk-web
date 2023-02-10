const { sendRequest } = require("../../../utils/helpers");
const { getValidAccessToken } = require("../../refresh");
const {
  getOidcOriginalParams,
  getPendingResponse,
  setAuthFlowStartPoint,
  setCv,
  setPendingResponse,
  setThreadId,
} = require("../../storage");
const { flowTypes } = require("../../../constants");
const originalConsole = window.console;
const originalSessionStorage = window.sessionStorage;

const setupRequest = require("../setupRequest");

jest.mock("../../refresh", () => ({
  getValidAccessToken: jest.fn(),
}));

jest.mock("../../../utils/crypto", () => ({
  getCodeVerifierAndChallenge: jest.fn().mockImplementation(() => ({
    codeChallenge: "code-challenge-token",
    codeVerifier: "code-verifier-token",
  })),
}));

jest.mock("../../../utils/helpers", () => {
  const originalModule = jest.requireActual("../../../utils/helpers");
  return {
    ...originalModule,
    sendRequest: jest.fn(),
  };
});

jest.mock("../../storage");

beforeAll(() => {
  window.IKSDK = {
    config: {
      baseUri: "http://www.example.com",
      applicationId: "12345",
      tenantId: "tenant-id",
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  window.console = {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  localStorage.clear();
  sessionStorage.clear();
  getOidcOriginalParams.mockImplementation(() => jest.fn());
  getPendingResponse.mockImplementation(() => undefined);
  getValidAccessToken.mockImplementation(() => jest.fn());
  sendRequest.mockImplementation(() => ({
    data: {
      "~thread": {
        thid: "000",
      },
      "@type": "fail",
    },
  }));
});

afterAll(() => {
  window.console = originalConsole;
  window.sessionStorage = originalSessionStorage;
});

describe("when a request is created", () => {
  describe('when the flow type is "login"', () => {
    beforeEach(() => {
      getValidAccessToken.mockImplementation(() => Promise.resolve("valid-token"));
    });

    describe("when the access token can not be retrieved", () => {
      beforeEach(() => {
        getValidAccessToken.mockImplementation(() => Promise.reject(new Error()));
        return setupRequest();
      });

      it("prints a debug message into console", () => {
        expect(console.debug).toBeCalledTimes(1);
        expect(console.debug.mock.calls[0][0]).toBe(
          "No access token found. Setup request will continue without including access token in headers.",
        );
      });
    });

    describe("when there is no pending response", () => {
      describe("when the response contains no data", () => {
        let caughtError;

        beforeEach(async () => {
          sendRequest.mockImplementation(() => ({}));
          try {
            await setupRequest();
          } catch (err) {
            caughtError = err;
          }
        });

        it("prints a warning message into console", () => {
          expect(console.warn).toBeCalledTimes(1);
          expect(console.warn.mock.calls[0][0]).toBe("No data resposne from server.");
        });

        it("throws an error", () => {
          expect(caughtError).toBe("No data resposne from server.");
        });

        it("does not set neither cv nor thread id", () => {
          expect(setCv).not.toBeCalled();
          expect(setThreadId).not.toBeCalled();
        });
      });
    });

    describe('when the response type is "fail"', () => {
      const message = {
        data: {
          "@type": "fail",
        },
      };
      let returnedValue;

      beforeEach(async () => {
        sendRequest.mockImplementation(() => message);
        returnedValue = await setupRequest();
      });

      it("returns data of the received message", () => {
        expect(returnedValue).toBe(message.data);
      });

      it("does not set neither cv nor thread id", () => {
        expect(setCv).not.toBeCalled();
        expect(setThreadId).not.toBeCalled();
      });
    });

    describe("when there is no pending response", () => {
      describe('when the response type is "success"', () => {
        describe("when request does not have a 'token'", () => {
          describe("when message contains a verifier token", () => {
            const message = {
              data: {
                "@type": "success",
                verifier: "verifier-token",
              },
            };
            let returnedValue;

            beforeEach(async () => {
              sendRequest.mockImplementation(() => message);
              returnedValue = await setupRequest();
            });

            it("stores current URL", () => {
              expect(setAuthFlowStartPoint).toBeCalledTimes(1);
              expect(setAuthFlowStartPoint).toBeCalledWith(location.href);
            });

            it("returns data of the received message", () => {
              expect(returnedValue).toBe(message.data);
            });

            it("sends a correct request", () => {
              expect(sendRequest).toBeCalledTimes(1);
              expect(sendRequest.mock.calls[0][0]).toBe("http://www.example.com/auth/12345");
              expect(sendRequest.mock.calls[0][1].toLowerCase()).toBe("post");
              expect(sendRequest.mock.calls[0][2]).toEqual({
                cc: "code-challenge-token",
                "~arg": {
                  flow: "customer",
                },
                "~tenant": "tenant-id",
              });
              expect(sendRequest.mock.calls[0][3]).toEqual({
                actionName: "setup",
                headers: {
                  authorization: "Bearer valid-token",
                },
              });
            });

            it("does not set neither cv nor thread id", () => {
              expect(setCv).not.toBeCalled();
              expect(setThreadId).not.toBeCalled();
            });
          });

          describe("when message does not contain a verifier token", () => {
            const message = {
              data: {
                "@type": "success",
                "~thread": {
                  thid: "thread-id",
                },
              },
            };
            let returnedValue;

            describe("when the access token can not be retrieved", () => {
              beforeEach(async () => {
                getValidAccessToken.mockImplementation(() => Promise.reject(new Error()));
                sendRequest.mockImplementation(() => message);
                returnedValue = await setupRequest();
              });

              it("prints a debug message into console", () => {
                expect(console.debug).toBeCalledTimes(1);
                expect(console.debug.mock.calls[0][0]).toBe(
                  "No access token found. Setup request will continue without including access token in headers.",
                );
              });

              it("returns data of the received message", () => {
                expect(returnedValue).toBe(message.data);
              });

              it("sends a correct request", () => {
                expect(sendRequest).toBeCalledTimes(1);
                expect(sendRequest.mock.calls[0][0]).toBe("http://www.example.com/auth/12345");
                expect(sendRequest.mock.calls[0][1].toLowerCase()).toBe("post");
                expect(sendRequest.mock.calls[0][2]).toEqual({
                  cc: "code-challenge-token",
                  "~arg": {
                    flow: "customer",
                  },
                  "~tenant": "tenant-id",
                });
                expect(sendRequest.mock.calls[0][3]).toEqual({
                  actionName: "setup",
                });
              });

              it("sets cv and thread id", () => {
                expect(setCv).toBeCalled();
                expect(setCv.mock.calls[0]).toEqual(["code-verifier-token"]);
                expect(setThreadId).toBeCalled();
                expect(setThreadId.mock.calls[0]).toEqual(["thread-id"]);
              });
            });

            describe("when the access token can be retrieved", () => {
              beforeEach(async () => {
                sendRequest.mockImplementation(() => message);
                returnedValue = await setupRequest();
              });

              it("stores current URL", () => {
                expect(setAuthFlowStartPoint).toBeCalledTimes(1);
                expect(setAuthFlowStartPoint).toBeCalledWith(location.href);
              });

              it("does not print a debug message into console", () => {
                expect(console.debug).toBeCalledTimes(0);
              });

              it("returns data of the received message", () => {
                expect(returnedValue).toBe(message.data);
              });

              it("sends a correct request", () => {
                expect(sendRequest).toBeCalledTimes(1);
                expect(sendRequest.mock.calls[0][0]).toBe("http://www.example.com/auth/12345");
                expect(sendRequest.mock.calls[0][1].toLowerCase()).toBe("post");
                expect(sendRequest.mock.calls[0][2]).toEqual({
                  cc: "code-challenge-token",
                  "~arg": {
                    flow: "customer",
                  },
                  "~tenant": "tenant-id",
                });
                expect(sendRequest.mock.calls[0][3]).toEqual({
                  actionName: "setup",
                  headers: {
                    authorization: "Bearer valid-token",
                  },
                });
              });

              it("sets cv and thread id", () => {
                expect(setCv).toBeCalled();
                expect(setCv.mock.calls[0]).toEqual(["code-verifier-token"]);
                expect(setThreadId).toBeCalled();
                expect(setThreadId.mock.calls[0]).toEqual(["thread-id"]);
              });
            });
          });
        });

        describe("when request has a 'token'", () => {
          const message = {
            data: {
              "@type": "success",
              "~thread": {
                thid: "thread-id",
              },
            },
          };
          let returnedValue;

          beforeEach(async () => {
            getValidAccessToken.mockImplementation(() => Promise.reject(new Error()));
            sendRequest.mockImplementation(() => message);
            returnedValue = await setupRequest({ token: "otp-token" });
          });

          it("sends a correct request", () => {
            expect(sendRequest).toBeCalledTimes(1);
            expect(sendRequest.mock.calls[0][0]).toBe("http://www.example.com/auth/12345");
            expect(sendRequest.mock.calls[0][1].toLowerCase()).toBe("post");
            expect(sendRequest.mock.calls[0][2]).toEqual({
              cc: "code-challenge-token",
              "~token": "otp-token",
            });
            expect(sendRequest.mock.calls[0][3]).toEqual({
              actionName: "setup",
            });
          });

          it("sets cv and thread id", () => {
            expect(setCv).toBeCalled();
            expect(setCv.mock.calls[0]).toEqual(["code-verifier-token"]);
            expect(setThreadId).toBeCalled();
            expect(setThreadId.mock.calls[0]).toEqual(["thread-id"]);
          });
        });
      });

      describe('when the response type is "logical"', () => {
        beforeEach(() => {
          sendRequest.mockImplementation(() => ({
            data: {
              "~thread": {
                thid: "thread-id",
              },
              "@type": "logical",
              opts: [
                {
                  "@type": "form",
                  "@id": "001",
                },
                {
                  "@type": "action",
                  "@id": "002",
                },
                {
                  "@type": "form",
                  "@id": "003",
                },
              ],
            },
          }));
          return setupRequest();
        });

        it("stores the action id to session storage", () => {
          expect(sessionStorage.getItem("@indykite/actionsId")).toBe("002");
        });

        it("sets cv and thread id", () => {
          expect(setCv).toBeCalled();
          expect(setCv.mock.calls[0]).toEqual(["code-verifier-token"]);
          expect(setThreadId).toBeCalled();
          expect(setThreadId.mock.calls[0]).toEqual(["thread-id"]);
        });
      });

      describe('when the "thread" data are missing', () => {
        let caughtError;

        beforeEach(async () => {
          sendRequest.mockImplementation(() => ({
            data: {
              "@type": "logical",
            },
          }));
          try {
            await setupRequest();
          } catch (err) {
            caughtError = err;
          }
        });

        it("prints error messages into console", () => {
          expect(console.error).toBeCalledTimes(2);
          expect(console.error.mock.calls[0][0]).toBe(
            "No thread information received from server.",
          );
          expect(console.error.mock.calls[1][0]).toBeUndefined();
          expect(console.error.mock.calls[1][1]).toBe(
            "IKUISDK Failed with customer flow pre-request.",
          );
        });

        it("throws an error", () => {
          expect(caughtError).toBe("No thread information received from server.");
        });

        it("does not set neither cv nor thread id", () => {
          expect(setCv).not.toBeCalled();
          expect(setThreadId).not.toBeCalled();
        });
      });

      describe("when it is the OIDC flow", () => {
        beforeEach(() => {
          getOidcOriginalParams.mockImplementation(() => ({
            scope: "openid",
            state: "state-token",
            login_challenge: "login-challenge-token",
          }));
          return setupRequest();
        });

        it("sends a request with token", () => {
          expect(sendRequest).toBeCalledTimes(1);
          expect(sendRequest.mock.calls[0][0]).toBe("http://www.example.com/auth/12345");
          expect(sendRequest.mock.calls[0][1].toLowerCase()).toBe("post");
          expect(sendRequest.mock.calls[0][2]).toEqual({
            cc: "code-challenge-token",
            "~arg": {
              flow: "customer",
            },
            "~tenant": "tenant-id",
            "~token": "login-challenge-token",
          });
          expect(sendRequest.mock.calls[0][3]).toEqual({
            actionName: "setup",
            headers: {
              authorization: "Bearer valid-token",
            },
          });
        });
      });
    });

    describe("when there is a pending response", () => {
      const pendingResponse = {
        "@type": "oidc",
        prv: "indykite.me",
        "~thread": {
          thid: "pending-thread-id",
        },
      };

      beforeEach(() => {
        getPendingResponse.mockImplementation(() => pendingResponse);
      });

      describe('when the response type is "logical"', () => {
        let returnedValue;

        beforeEach(async () => {
          sendRequest.mockImplementation(() => Promise.reject(new Error("Test error")));
          returnedValue = await setupRequest();
        });

        it("stores current URL", () => {
          expect(setAuthFlowStartPoint).toBeCalledTimes(1);
          expect(setAuthFlowStartPoint).toBeCalledWith(location.href);
        });

        it("resets the existing pending response", () => {
          expect(setPendingResponse).toBeCalledTimes(1);
          expect(setPendingResponse).toBeCalledWith(null);
        });

        it("does not print a debug message into console", () => {
          expect(console.debug).toBeCalledTimes(0);
        });

        it("returns data equaling the pending response", () => {
          expect(returnedValue).toBe(pendingResponse);
        });

        it("does not send a new request", () => {
          expect(sendRequest).toBeCalledTimes(0);
        });

        it("sets thread id, but not the code verifier", () => {
          expect(setCv).toBeCalledTimes(0);
          expect(setThreadId).toBeCalledTimes(1);
          expect(setThreadId).toBeCalledWith("pending-thread-id");
        });
      });
    });
  });

  describe('when them flow type is "register"', () => {
    beforeEach(() => {
      return setupRequest({ args: { flow: flowTypes.register } });
    });

    it("does not load access token", () => {
      expect(getValidAccessToken).toBeCalledTimes(0);
    });

    it("sends a correct request", () => {
      expect(sendRequest).toBeCalledTimes(1);
      expect(sendRequest.mock.calls[0][0]).toBe("http://www.example.com/auth/12345");
      expect(sendRequest.mock.calls[0][1].toLowerCase()).toBe("post");
      expect(sendRequest.mock.calls[0][2]).toEqual({
        cc: "code-challenge-token",
        "~arg": {
          flow: "register",
        },
        "~tenant": "tenant-id",
      });
      expect(sendRequest.mock.calls[0][3]).toEqual({
        actionName: "setup",
      });
    });
  });
});
