const {
  setTokens,
  getTokens,
  getAllUserTokens,
  removeUserTokens,
  getCv,
  setCv,
  setDefaultUser,
  storeOnLoginSuccess,
  getRefreshToken,
  getOidcOriginalParams,
  getOidcSetupResponse,
  setOidcOriginalParams,
  setOidcSetupResponse,
  setThreadId,
  getThreadId,
  setFPThreadId,
  getFPThreadId,
  setAuthFlowStartPoint,
  getAuthFlowStartPoint,
  getPendingResponse,
  setPendingResponse,
  pushResponse,
  popResponse,
  clearResponses,
} = require("../storage");

const originalConsole = window.console;

const putRequestMock = {
  onsuccess: jest.fn(),
  onerror: jest.fn(),
};

const getRequestMock = {
  onsuccess: jest.fn(),
  onerror: jest.fn(),
  result: undefined,
};

const getAllKeysRequestMock = {
  onsuccess: jest.fn(),
  onerror: jest.fn(),
  result: undefined,
};

const deleteRequestMock = {
  onsuccess: jest.fn(),
  onerror: jest.fn(),
};

const objectStoreMock = {
  put: jest.fn(),
  get: jest.fn(),
  getAllKeys: jest.fn(),
  delete: jest.fn(),
};

const transactionMock = {
  onerror: jest.fn(),
  objectStore: jest.fn(),
};

const databaseResultMock = {
  transaction: jest.fn(),
};

const databaseMock = {
  onsuccess: jest.fn(),
  onerror: jest.fn(),
  onupgradeneeded: jest.fn(),
  result: undefined,
};

beforeEach(() => {
  indexedDB = {
    open: jest.fn(),
  };
  window.console = {
    error: jest.fn(),
  };
  jest.clearAllMocks();
  databaseMock.result = undefined;
  getRequestMock.result = undefined;
  databaseResultMock.transaction.mockImplementation(() => transactionMock);
  transactionMock.objectStore.mockImplementation(() => objectStoreMock);
  objectStoreMock.put.mockImplementation(() => {
    setTimeout(() => {
      putRequestMock.onsuccess();
    }, 0);
    return putRequestMock;
  });
  objectStoreMock.get.mockImplementation(() => {
    setTimeout(() => {
      getRequestMock.onsuccess();
    }, 0);
    return getRequestMock;
  });
  objectStoreMock.getAllKeys.mockImplementation(() => {
    setTimeout(() => {
      getAllKeysRequestMock.onsuccess();
    }, 0);
    return getAllKeysRequestMock;
  });
  objectStoreMock.delete.mockImplementation(() => {
    setTimeout(() => {
      deleteRequestMock.onsuccess();
    }, 0);
    return deleteRequestMock;
  });
  indexedDB.open.mockImplementation(getDatabaseMock());
  localStorage.clear();
  sessionStorage.clear();
});

afterAll(() => {
  window.console = originalConsole;
});

const getDatabaseMock = () => {
  return () => {
    setTimeout(() => {
      databaseMock.result = databaseResultMock;
      databaseMock.onsuccess(databaseMock);
    });

    return databaseMock;
  };
};

describe("setTokens", () => {
  describe("when the database can not be opened", () => {
    const error = new Error("Test error");

    beforeEach(() => {
      indexedDB.open.mockImplementation(() => {
        setTimeout(() => {
          databaseMock.onerror({
            target: {
              error,
            },
          });
        }, 0);

        return databaseMock;
      });

      return setTokens();
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalled();
      expect(console.error.mock.calls[0]).toEqual([error]);
    });
  });

  describe("when the database does not exist yet", () => {
    const event = {};

    beforeEach(() => {
      indexedDB.open.mockImplementation(() => {
        setTimeout(() => {
          event.currentTarget = {
            result: {
              createObjectStore: jest.fn(),
            },
          };

          databaseMock.onupgradeneeded(event);
          databaseMock.onsuccess();
        }, 0);

        return databaseMock;
      });

      return setTokens();
    });

    it("initializes the database", () => {
      expect(event.currentTarget.result.createObjectStore).toBeCalledTimes(2);
      expect(event.currentTarget.result.createObjectStore.mock.calls[0]).toEqual([
        "tokens",
        { keyPath: "userId" },
      ]);
      expect(event.currentTarget.result.createObjectStore.mock.calls[1]).toEqual([
        "options",
        { keyPath: "name" },
      ]);
    });
  });

  describe("when the database can be opened", () => {
    describe("when the put request is successful", () => {
      beforeEach(() => {
        return setTokens("user-id", "access-token", "refresh-token", "expiration-time");
      });

      it("stores the tokens", () => {
        expect(databaseResultMock.transaction).toBeCalledTimes(1);
        expect(databaseResultMock.transaction.mock.calls[0]).toEqual(["tokens", "readwrite"]);
        expect(transactionMock.objectStore).toBeCalledTimes(1);
        expect(transactionMock.objectStore.mock.calls[0]).toEqual(["tokens"]);
        expect(objectStoreMock.put).toBeCalledTimes(1);
        expect(objectStoreMock.put.mock.calls[0]).toEqual([
          {
            accessToken: "access-token",
            expirationTime: "expiration-time",
            refreshToken: "refresh-token",
            userId: "user-id",
          },
        ]);
      });
    });

    describe("when the put request fails", () => {
      const error = new Error("Test error");

      beforeEach(() => {
        objectStoreMock.put.mockImplementation(() => {
          setTimeout(() => {
            putRequestMock.onerror({
              target: {
                error,
              },
            });
          }, 0);
          return putRequestMock;
        });
        return setTokens("user-id", "access-token", "refresh-token", "expiration-time");
      });

      it("prints an error to the console", () => {
        expect(console.error).toBeCalled();
        expect(console.error.mock.calls[0]).toEqual([error]);
      });
    });

    describe("when the transaction request fails", () => {
      const error = new Error("Test error");

      beforeEach(() => {
        databaseResultMock.transaction.mockImplementation(() => {
          setTimeout(() => {
            transactionMock.onerror({
              target: {
                error,
              },
            });
          }, 0);
          return transactionMock;
        });
        return setTokens("user-id", "access-token", "refresh-token", "expiration-time");
      });

      it("prints an error to the console", () => {
        expect(console.error).toBeCalled();
        expect(console.error.mock.calls[0]).toEqual([error]);
      });
    });
  });
});

describe("getTokens", () => {
  describe("when the get request is successful", () => {
    describe("when the user ID is specified", () => {
      let returnedValue;
      beforeEach(async () => {
        getRequestMock.result = {
          accessToken: "retrieved-access-token",
          expirationTime: "retrieved-expiration-time",
          refreshToken: "retrieved-refresh-token",
          userId: "retrieved-user-id",
        };
        returnedValue = await getTokens("user-id");
        return returnedValue;
      });

      it("loads the tokens", () => {
        expect(databaseResultMock.transaction).toBeCalledTimes(1);
        expect(databaseResultMock.transaction.mock.calls[0]).toEqual(["tokens"]);
        expect(transactionMock.objectStore).toBeCalledTimes(1);
        expect(transactionMock.objectStore.mock.calls[0]).toEqual(["tokens"]);
        expect(objectStoreMock.get).toBeCalledTimes(1);
        expect(objectStoreMock.get.mock.calls[0]).toEqual(["user-id"]);
      });

      it("returns correct value", () => {
        expect(returnedValue).toEqual({
          accessToken: "retrieved-access-token",
          expirationTime: "retrieved-expiration-time",
          refreshToken: "retrieved-refresh-token",
          userId: "retrieved-user-id",
        });
      });
    });

    describe("when the user ID is not specified", () => {
      let returnedValue;
      beforeEach(async () => {
        objectStoreMock.get
          .mockImplementationOnce(() => {
            getRequestMock.result = {
              value: "retrieved-default-user-id",
            };
            setTimeout(() => getRequestMock.onsuccess(), 0);
            return getRequestMock;
          })
          .mockImplementationOnce(() => {
            getRequestMock.result = {
              accessToken: "retrieved-access-token",
              expirationTime: "retrieved-expiration-time",
              refreshToken: "retrieved-refresh-token",
              userId: "retrieved-user-id",
            };
            setTimeout(() => getRequestMock.onsuccess(), 0);
            return getRequestMock;
          });
        returnedValue = await getTokens();
        return returnedValue;
      });

      it("loads the tokens with the default user ID", () => {
        expect(databaseResultMock.transaction).toBeCalledTimes(2);
        expect(databaseResultMock.transaction.mock.calls[0]).toEqual(["options"]);
        expect(databaseResultMock.transaction.mock.calls[1]).toEqual(["tokens"]);
        expect(transactionMock.objectStore).toBeCalledTimes(2);
        expect(transactionMock.objectStore.mock.calls[0]).toEqual(["options"]);
        expect(transactionMock.objectStore.mock.calls[1]).toEqual(["tokens"]);
        expect(objectStoreMock.get).toBeCalledTimes(2);
        expect(objectStoreMock.get.mock.calls[0]).toEqual(["defaultUser"]);
        expect(objectStoreMock.get.mock.calls[1]).toEqual(["retrieved-default-user-id"]);
      });

      it("returns correct value", () => {
        expect(returnedValue).toEqual({
          accessToken: "retrieved-access-token",
          expirationTime: "retrieved-expiration-time",
          refreshToken: "retrieved-refresh-token",
          userId: "retrieved-user-id",
        });
      });
    });

    describe("when the user ID is not specified and the default user is not set", () => {
      let returnedValue;
      beforeEach(async () => {
        objectStoreMock.get
          .mockImplementationOnce(() => {
            getRequestMock.result = undefined;
            setTimeout(() => getRequestMock.onsuccess(), 0);
            return getRequestMock;
          })
          .mockImplementationOnce(() => {
            getRequestMock.result = undefined;
            setTimeout(() => getRequestMock.onsuccess(), 0);
            return getRequestMock;
          });
        returnedValue = await getTokens();
        return returnedValue;
      });

      it("loads the tokens with the default user ID", () => {
        expect(databaseResultMock.transaction).toBeCalledTimes(1);
        expect(databaseResultMock.transaction.mock.calls[0]).toEqual(["options"]);
        expect(transactionMock.objectStore).toBeCalledTimes(1);
        expect(transactionMock.objectStore.mock.calls[0]).toEqual(["options"]);
        expect(objectStoreMock.get).toBeCalledTimes(1);
        expect(objectStoreMock.get.mock.calls[0]).toEqual(["defaultUser"]);
      });

      it("returns correct value", () => {
        expect(returnedValue).toEqual({
          accessToken: undefined,
          expirationTime: undefined,
          refreshToken: undefined,
          userId: undefined,
        });
      });
    });
  });

  describe("when the get request fails", () => {
    const error = new Error("Test error");

    beforeEach(() => {
      objectStoreMock.get = jest.fn().mockImplementation(() => {
        setTimeout(() => {
          getRequestMock.onerror({
            target: {
              error,
            },
          });
        }, 0);
        return getRequestMock;
      });
      return getTokens();
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalled();
      expect(console.error.mock.calls[0]).toEqual([error]);
    });
  });

  describe("when the transaction request fails", () => {
    const error = new Error("Test error");

    beforeEach(() => {
      databaseResultMock.transaction.mockImplementation(() => {
        setTimeout(() => {
          transactionMock.onerror({
            target: {
              error,
            },
          });
        }, 0);
        return transactionMock;
      });
      return getTokens();
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalled();
      expect(console.error.mock.calls[0]).toEqual([error]);
    });
  });
});

describe("getAllUserTokens", () => {
  describe("when table keys can be read", () => {
    let returnedValue;
    beforeEach(async () => {
      getAllKeysRequestMock.result = ["user1-id", "user2-id"];
      objectStoreMock.get
        .mockImplementationOnce(() => {
          getRequestMock.result = {
            accessToken: "access-token-1",
          };
          setTimeout(() => getRequestMock.onsuccess(), 0);
          return getRequestMock;
        })
        .mockImplementationOnce(() => {
          getRequestMock.result = {
            accessToken: "access-token-2",
          };
          setTimeout(() => getRequestMock.onsuccess(), 0);
          return getRequestMock;
        });

      returnedValue = await getAllUserTokens();
      return returnedValue;
    });

    it("loads the tokens", () => {
      expect(databaseResultMock.transaction).toBeCalledTimes(3);
      expect(databaseResultMock.transaction.mock.calls[0]).toEqual(["tokens"]);
      expect(databaseResultMock.transaction.mock.calls[1]).toEqual(["tokens"]);
      expect(databaseResultMock.transaction.mock.calls[2]).toEqual(["tokens"]);
      expect(transactionMock.objectStore).toBeCalledTimes(3);
      expect(transactionMock.objectStore.mock.calls[0]).toEqual(["tokens"]);
      expect(transactionMock.objectStore.mock.calls[1]).toEqual(["tokens"]);
      expect(transactionMock.objectStore.mock.calls[2]).toEqual(["tokens"]);
      expect(objectStoreMock.getAllKeys).toBeCalledTimes(1);
      expect(objectStoreMock.get).toBeCalledTimes(2);
      expect(objectStoreMock.get.mock.calls[0]).toEqual(["user1-id"]);
      expect(objectStoreMock.get.mock.calls[1]).toEqual(["user2-id"]);
    });

    it("returns correct value", () => {
      expect(returnedValue).toEqual({
        "user1-id": {
          accessToken: "access-token-1",
        },
        "user2-id": {
          accessToken: "access-token-2",
        },
      });
    });
  });

  describe("when the transaction request fails", () => {
    const error = new Error("Test error");

    beforeEach(() => {
      databaseResultMock.transaction.mockImplementation(() => {
        setTimeout(() => {
          transactionMock.onerror({
            target: {
              error,
            },
          });
        }, 0);
        return transactionMock;
      });
      return getAllUserTokens();
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalled();
      expect(console.error.mock.calls[0]).toEqual([error]);
    });
  });

  describe("when the getAllKeys request fails", () => {
    const error = new Error("Test error");

    beforeEach(() => {
      objectStoreMock.getAllKeys.mockImplementation(() => {
        setTimeout(() => {
          getAllKeysRequestMock.onerror({
            target: {
              error,
            },
          });
        }, 0);
        return getAllKeysRequestMock;
      });
      return getAllUserTokens();
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalled();
      expect(console.error.mock.calls[0]).toEqual([error]);
    });
  });
});

describe("removeUserTokens", () => {
  describe("when tokens are removed successfully", () => {
    describe("when a user ID is not specified", () => {
      describe("when a default user is set", () => {
        beforeEach(async () => {
          objectStoreMock.get.mockImplementationOnce(() => {
            getRequestMock.result = {
              value: "retrieved-default-user-id",
            };
            setTimeout(() => getRequestMock.onsuccess(), 0);
            return getRequestMock;
          });

          return removeUserTokens();
        });

        it("removes user tokens and the default user", () => {
          expect(databaseResultMock.transaction).toBeCalledTimes(3);
          expect(databaseResultMock.transaction.mock.calls[0]).toEqual(["options"]);
          expect(databaseResultMock.transaction.mock.calls[1]).toEqual(["tokens", "readwrite"]);
          expect(databaseResultMock.transaction.mock.calls[2]).toEqual(["options", "readwrite"]);
          expect(transactionMock.objectStore).toBeCalledTimes(3);
          expect(transactionMock.objectStore.mock.calls[0]).toEqual(["options"]);
          expect(transactionMock.objectStore.mock.calls[1]).toEqual(["tokens"]);
          expect(transactionMock.objectStore.mock.calls[2]).toEqual(["options"]);
          expect(objectStoreMock.get).toBeCalledTimes(1);
          expect(objectStoreMock.get.mock.calls[0]).toEqual(["defaultUser"]);
          expect(objectStoreMock.delete).toBeCalledTimes(2);
          expect(objectStoreMock.delete.mock.calls[0]).toEqual(["retrieved-default-user-id"]);
          expect(objectStoreMock.delete.mock.calls[1]).toEqual(["defaultUser"]);
        });
      });

      describe("when a default user is not set", () => {
        beforeEach(async () => {
          return removeUserTokens();
        });

        it("does not remove default user", () => {
          expect(databaseResultMock.transaction).toBeCalledTimes(1);
          expect(databaseResultMock.transaction.mock.calls[0]).toEqual(["options"]);
          expect(transactionMock.objectStore).toBeCalledTimes(1);
          expect(transactionMock.objectStore.mock.calls[0]).toEqual(["options"]);
          expect(objectStoreMock.get).toBeCalledTimes(1);
          expect(objectStoreMock.get.mock.calls[0]).toEqual(["defaultUser"]);
          expect(objectStoreMock.delete).toBeCalledTimes(0);
        });
      });
    });

    describe("when a user ID is specified", () => {
      describe("when the user ID is the default user", () => {
        beforeEach(async () => {
          objectStoreMock.get.mockImplementationOnce(() => {
            getRequestMock.result = {
              value: "default-user-id",
            };
            setTimeout(() => getRequestMock.onsuccess(), 0);
            return getRequestMock;
          });

          return removeUserTokens("default-user-id");
        });

        it("removes user tokens and the default user", () => {
          expect(databaseResultMock.transaction).toBeCalledTimes(3);
          expect(databaseResultMock.transaction.mock.calls[0]).toEqual(["options"]);
          expect(databaseResultMock.transaction.mock.calls[1]).toEqual(["tokens", "readwrite"]);
          expect(databaseResultMock.transaction.mock.calls[2]).toEqual(["options", "readwrite"]);
          expect(transactionMock.objectStore).toBeCalledTimes(3);
          expect(transactionMock.objectStore.mock.calls[0]).toEqual(["options"]);
          expect(transactionMock.objectStore.mock.calls[1]).toEqual(["tokens"]);
          expect(transactionMock.objectStore.mock.calls[2]).toEqual(["options"]);
          expect(objectStoreMock.get).toBeCalledTimes(1);
          expect(objectStoreMock.get.mock.calls[0]).toEqual(["defaultUser"]);
          expect(objectStoreMock.delete).toBeCalledTimes(2);
          expect(objectStoreMock.delete.mock.calls[0]).toEqual(["default-user-id"]);
          expect(objectStoreMock.delete.mock.calls[1]).toEqual(["defaultUser"]);
        });
      });

      describe("when the user ID is not the default user", () => {
        beforeEach(async () => {
          objectStoreMock.get.mockImplementationOnce(() => {
            getRequestMock.result = {
              value: "default-user-id",
            };
            setTimeout(() => getRequestMock.onsuccess(), 0);
            return getRequestMock;
          });

          return removeUserTokens("user-id");
        });

        it("removes user tokens", () => {
          expect(databaseResultMock.transaction).toBeCalledTimes(2);
          expect(databaseResultMock.transaction.mock.calls[0]).toEqual(["options"]);
          expect(databaseResultMock.transaction.mock.calls[1]).toEqual(["tokens", "readwrite"]);
          expect(transactionMock.objectStore).toBeCalledTimes(2);
          expect(transactionMock.objectStore.mock.calls[0]).toEqual(["options"]);
          expect(transactionMock.objectStore.mock.calls[1]).toEqual(["tokens"]);
          expect(objectStoreMock.get).toBeCalledTimes(1);
          expect(objectStoreMock.get.mock.calls[0]).toEqual(["defaultUser"]);
          expect(objectStoreMock.delete).toBeCalledTimes(1);
          expect(objectStoreMock.delete.mock.calls[0]).toEqual(["user-id"]);
        });
      });
    });
  });

  describe("when the transaction request fails", () => {
    const error = new Error("Test error");
    let caughtError;

    beforeEach(async () => {
      databaseResultMock.transaction.mockImplementation((tableName) => {
        setTimeout(() => {
          if (tableName === "tokens") {
            transactionMock.onerror({
              target: {
                error,
              },
            });
          }
        }, 0);
        return transactionMock;
      });
      try {
        await removeUserTokens("user-id");
      } catch (err) {
        caughtError = err;
      }
    });

    it("throws an error", () => {
      expect(caughtError).toBe(error);
    });
  });

  describe("when the delete request fails", () => {
    const error = new Error("Test error");
    let caughtError;

    beforeEach(async () => {
      objectStoreMock.delete.mockImplementation(() => {
        setTimeout(() => {
          deleteRequestMock.onerror({
            target: {
              error,
            },
          });
        }, 0);
        return deleteRequestMock;
      });
      try {
        await removeUserTokens("user-id");
      } catch (err) {
        caughtError = err;
      }
    });

    it("throws an error", () => {
      expect(caughtError).toBe(error);
    });
  });

  describe("when there is a problem to remove a defaul user", () => {
    const error = new Error("Test error");

    beforeEach(async () => {
      objectStoreMock.get.mockImplementationOnce(() => {
        getRequestMock.result = {
          value: "retrieved-default-user-id",
        };
        setTimeout(() => getRequestMock.onsuccess(), 0);
        return getRequestMock;
      });

      objectStoreMock.delete.mockImplementation((key) => {
        setTimeout(() => {
          if (key === "defaultUser") {
            deleteRequestMock.onerror({
              target: {
                error,
              },
            });
          } else {
            deleteRequestMock.onsuccess();
          }
        }, 0);
        return deleteRequestMock;
      });

      return removeUserTokens();
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error.mock.calls[0]).toEqual([error]);
    });
  });
});

describe("setDefaultUser", () => {
  describe("when a default user is set successfully", () => {
    beforeEach(async () => {
      objectStoreMock.get.mockImplementationOnce(() => {
        getRequestMock.result = {
          value: "retrieved-default-user-id",
        };
        setTimeout(() => getRequestMock.onsuccess(), 0);
        return getRequestMock;
      });

      return setDefaultUser("user-id");
    });

    it("sets the default user", () => {
      expect(databaseResultMock.transaction).toBeCalledTimes(1);
      expect(databaseResultMock.transaction.mock.calls[0]).toEqual(["options", "readwrite"]);
      expect(transactionMock.objectStore).toBeCalledTimes(1);
      expect(transactionMock.objectStore.mock.calls[0]).toEqual(["options"]);
      expect(objectStoreMock.put).toBeCalledTimes(1);
      expect(objectStoreMock.put.mock.calls[0]).toEqual([
        {
          name: "defaultUser",
          value: "user-id",
        },
      ]);
    });
  });

  describe("when the transaction request fails", () => {
    const error = new Error("Test error");

    beforeEach(async () => {
      databaseResultMock.transaction.mockImplementation((tableName) => {
        setTimeout(() => {
          transactionMock.onerror({
            target: {
              error,
            },
          });
        }, 0);
        return transactionMock;
      });
      return setDefaultUser("user-id");
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error.mock.calls[0]).toEqual([error]);
    });
  });
});

describe("storeOnLoginSuccess", () => {
  describe("when the data type is 'success'", () => {
    beforeEach(async () => {
      localStorage.setItem("IKUISDK/oidcOrgnlParams", "whatever");
      localStorage.setItem("IKUISDK/oidcSetupResponse", "whatever");

      return storeOnLoginSuccess({
        "@type": "success",
        sub: "user-id",
        token: "access-token",
        refresh_token: "refresh-token",
        expiration_time: "expiration-time",
      });
    });

    it("stores the user's tokens", () => {
      expect(databaseResultMock.transaction).toBeCalledTimes(2);
      expect(databaseResultMock.transaction.mock.calls[0]).toEqual(["tokens", "readwrite"]);
      expect(databaseResultMock.transaction.mock.calls[1]).toEqual(["options", "readwrite"]);
      expect(transactionMock.objectStore).toBeCalledTimes(2);
      expect(transactionMock.objectStore.mock.calls[0]).toEqual(["tokens"]);
      expect(transactionMock.objectStore.mock.calls[1]).toEqual(["options"]);
      expect(objectStoreMock.put).toBeCalledTimes(2);
      expect(objectStoreMock.put.mock.calls[0]).toEqual([
        {
          accessToken: "access-token",
          expirationTime: "expiration-time",
          refreshToken: "refresh-token",
          userId: "user-id",
        },
      ]);
      expect(objectStoreMock.put.mock.calls[1]).toEqual([
        {
          name: "defaultUser",
          value: "user-id",
        },
      ]);
    });

    it("clears OIDC data", () => {
      expect(localStorage.getItem("IKUISDK/oidcOrgnlParams")).toBe("null");
      expect(localStorage.getItem("IKUISDK/oidcSetupResponse")).toBe("null");
    });

    it("does not print an error to the console", () => {
      expect(console.error).toBeCalledTimes(0);
    });
  });

  describe("when the data type is not 'success'", () => {
    const data = {
      "@type": "fail",
    };

    beforeEach(async () => {
      localStorage.setItem("IKUISDK/oidcOrgnlParams", "whatever");
      localStorage.setItem("IKUISDK/oidcSetupResponse", "whatever");

      return storeOnLoginSuccess(data);
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error.mock.calls[0]).toEqual([
        "IKUISDK Tried to save the login data, but the login has not been success",
        data,
      ]);
    });
  });
});

describe("getRefreshToken", () => {
  describe("when the get request is successful", () => {
    describe("when the user ID is specified", () => {
      let returnedValue;
      beforeEach(async () => {
        getRequestMock.result = {
          accessToken: "retrieved-access-token",
          expirationTime: "retrieved-expiration-time",
          refreshToken: "retrieved-refresh-token",
          userId: "retrieved-user-id",
        };
        returnedValue = await getRefreshToken("user-id");
        return returnedValue;
      });

      it("loads the tokens", () => {
        expect(databaseResultMock.transaction).toBeCalledTimes(1);
        expect(databaseResultMock.transaction.mock.calls[0]).toEqual(["tokens"]);
        expect(transactionMock.objectStore).toBeCalledTimes(1);
        expect(transactionMock.objectStore.mock.calls[0]).toEqual(["tokens"]);
        expect(objectStoreMock.get).toBeCalledTimes(1);
        expect(objectStoreMock.get.mock.calls[0]).toEqual(["user-id"]);
      });

      it("returns correct value", () => {
        expect(returnedValue).toBe("retrieved-refresh-token");
      });
    });

    describe("when the user ID is not specified", () => {
      let returnedValue;
      beforeEach(async () => {
        objectStoreMock.get
          .mockImplementationOnce(() => {
            getRequestMock.result = {
              value: "retrieved-default-user-id",
            };
            setTimeout(() => getRequestMock.onsuccess(), 0);
            return getRequestMock;
          })
          .mockImplementationOnce(() => {
            getRequestMock.result = {
              accessToken: "retrieved-access-token",
              expirationTime: "retrieved-expiration-time",
              refreshToken: "retrieved-refresh-token",
              userId: "retrieved-user-id",
            };
            setTimeout(() => getRequestMock.onsuccess(), 0);
            return getRequestMock;
          });
        returnedValue = await getRefreshToken();
        return returnedValue;
      });

      it("loads the tokens with the default user ID", () => {
        expect(databaseResultMock.transaction).toBeCalledTimes(2);
        expect(databaseResultMock.transaction.mock.calls[0]).toEqual(["options"]);
        expect(databaseResultMock.transaction.mock.calls[1]).toEqual(["tokens"]);
        expect(transactionMock.objectStore).toBeCalledTimes(2);
        expect(transactionMock.objectStore.mock.calls[0]).toEqual(["options"]);
        expect(transactionMock.objectStore.mock.calls[1]).toEqual(["tokens"]);
        expect(objectStoreMock.get).toBeCalledTimes(2);
        expect(objectStoreMock.get.mock.calls[0]).toEqual(["defaultUser"]);
        expect(objectStoreMock.get.mock.calls[1]).toEqual(["retrieved-default-user-id"]);
      });

      it("returns correct value", () => {
        expect(returnedValue).toBe("retrieved-refresh-token");
      });
    });

    describe("when the user ID is not specified and the default user is not set", () => {
      let returnedValue;
      beforeEach(async () => {
        objectStoreMock.get
          .mockImplementationOnce(() => {
            getRequestMock.result = undefined;
            setTimeout(() => getRequestMock.onsuccess(), 0);
            return getRequestMock;
          })
          .mockImplementationOnce(() => {
            getRequestMock.result = undefined;
            setTimeout(() => getRequestMock.onsuccess(), 0);
            return getRequestMock;
          });
        returnedValue = await getRefreshToken();
        return returnedValue;
      });

      it("loads the tokens with the default user ID", () => {
        expect(databaseResultMock.transaction).toBeCalledTimes(1);
        expect(databaseResultMock.transaction.mock.calls[0]).toEqual(["options"]);
        expect(transactionMock.objectStore).toBeCalledTimes(1);
        expect(transactionMock.objectStore.mock.calls[0]).toEqual(["options"]);
        expect(objectStoreMock.get).toBeCalledTimes(1);
        expect(objectStoreMock.get.mock.calls[0]).toEqual(["defaultUser"]);
      });

      it("returns correct value", () => {
        expect(returnedValue).toBeUndefined();
      });
    });
  });

  describe("when the get request fails", () => {
    const error = new Error("Test error");

    beforeEach(() => {
      objectStoreMock.get = jest.fn().mockImplementation(() => {
        setTimeout(() => {
          getRequestMock.onerror({
            target: {
              error,
            },
          });
        }, 0);
        return getRequestMock;
      });
      return getRefreshToken();
    });

    it("prints an error to the console", () => {
      expect(console.error).toBeCalled();
      expect(console.error.mock.calls[0]).toEqual([error]);
    });
  });
});

describe("getCv", () => {
  beforeEach(() => {
    localStorage.setItem("IDKUISDK/cv", "code-verifier");
  });

  it("returns correct code verifier", () => {
    expect(getCv()).toBe("code-verifier");
  });
});

describe("setCv", () => {
  beforeEach(() => {
    setCv("another-code-verifier");
  });

  it("sets correct value", () => {
    expect(localStorage.getItem("IDKUISDK/cv")).toBe("another-code-verifier");
  });
});

describe("getPendingResponse", () => {
  beforeEach(() => {
    sessionStorage.setItem("@indykite/pendingRequest", '{"@type": "fail"}');
  });

  it("returns correct pending response", () => {
    expect(getPendingResponse()).toEqual({ "@type": "fail" });
  });
});

describe("setPendingResponse", () => {
  describe("when the response is not passed", () => {
    beforeEach(() => {
      sessionStorage.setItem("@indykite/pendingRequest", '{"@type": "fail"}');
      setPendingResponse();
    });

    it("clears stored response", () => {
      expect(sessionStorage.getItem("@indykite/pendingRequest")).toBe(null);
    });
  });

  describe("when the response is passed", () => {
    beforeEach(() => {
      sessionStorage.setItem("@indykite/pendingRequest", '{"@type": "fail"}');
      setPendingResponse({ "@type": "success" });
    });

    it("clears stored response", () => {
      expect(sessionStorage.getItem("@indykite/pendingRequest")).toBe('{"@type":"success"}');
    });
  });
});

describe("getOidcOriginalParams", () => {
  describe("when storage contains a value", () => {
    beforeEach(() => {
      localStorage.setItem("IKUISDK/oidcOrgnlParams", JSON.stringify({ key: "value" }));
    });

    it("returns correct params", () => {
      expect(getOidcOriginalParams()).toEqual({ key: "value" });
    });
  });

  describe("when storage does not contain a value", () => {
    it("returns undefined", () => {
      expect(getOidcOriginalParams()).toBeNull();
    });
  });
});

describe("setOidcOriginalParams", () => {
  beforeEach(() => {
    setOidcOriginalParams({ key: "another-value" });
  });

  it("sets correct value", () => {
    expect(localStorage.getItem("IKUISDK/oidcOrgnlParams")).toEqual(
      JSON.stringify({ key: "another-value" }),
    );
  });
});

describe("getOidcSetupResponse", () => {
  describe("when storage contains a value", () => {
    beforeEach(() => {
      localStorage.setItem("IKUISDK/oidcSetupResponse", JSON.stringify({ data: 42 }));
    });

    it("returns correct response", () => {
      expect(getOidcSetupResponse()).toEqual({ data: 42 });
    });
  });

  describe("when storage does not contain a value", () => {
    it("returns undefined", () => {
      expect(getOidcSetupResponse()).toBeNull();
    });
  });
});

describe("setOidcSetupResponse", () => {
  beforeEach(() => {
    setOidcSetupResponse({ response: false });
  });

  it("sets correct value", () => {
    expect(localStorage.getItem("IKUISDK/oidcSetupResponse")).toEqual(
      JSON.stringify({ response: false }),
    );
  });
});

describe("getThreadId", () => {
  beforeEach(() => {
    localStorage.setItem("@indykite/thid", "98765");
  });

  it("returns correct thread ID", () => {
    expect(getThreadId()).toBe("98765");
  });
});

describe("setThreadId", () => {
  beforeEach(() => {
    setThreadId("112233");
  });

  it("sets correct value", () => {
    expect(localStorage.getItem("@indykite/thid")).toBe("112233");
  });
});

describe("getFPThreadId", () => {
  beforeEach(() => {
    localStorage.setItem("@indykite/forgot-password-thid", "98765");
  });

  it("returns correct thread ID", () => {
    expect(getFPThreadId()).toBe("98765");
  });
});

describe("setFPThreadId", () => {
  beforeEach(() => {
    setFPThreadId("998877");
  });

  it("sets correct value", () => {
    expect(localStorage.getItem("@indykite/forgot-password-thid")).toBe("998877");
  });
});

describe("pushResponse", () => {
  describe("when there are no pushed responses", () => {
    beforeEach(() => {
      sessionStorage.removeItem("@indykite/response-list");
      pushResponse({ "@type": "fail" });
    });

    it("sets correct value", () => {
      expect(sessionStorage.getItem("@indykite/response-list")).toBe('[{"@type":"fail"}]');
    });
  });

  describe("when there already is a pushed response", () => {
    beforeEach(() => {
      sessionStorage.setItem("@indykite/response-list", '[{"@type":"success"}]');
      pushResponse({ "@type": "fail" });
    });

    it("sets correct value", () => {
      expect(sessionStorage.getItem("@indykite/response-list")).toBe(
        '[{"@type":"success"},{"@type":"fail"}]',
      );
    });
  });
});

describe("popResponse", () => {
  beforeEach(() => {
    setThreadId("0000");
  });

  describe("when there are no pushed responses", () => {
    beforeEach(() => {
      sessionStorage.removeItem("@indykite/response-list");
    });

    it("gets correct value", () => {
      expect(popResponse()).toBeUndefined();
    });
  });

  describe("when there already is a pushed response without thread id", () => {
    beforeEach(() => {
      sessionStorage.setItem("@indykite/response-list", '[{"@type":"success"}]');
    });

    it("gets correct value", () => {
      expect(popResponse()).toEqual({ "@type": "success" });
      expect(sessionStorage.getItem("@indykite/response-list")).toBe("[]");
      expect(getThreadId()).toBe("0000");
    });
  });

  describe("when there already is a pushed response with thread id", () => {
    beforeEach(() => {
      sessionStorage.setItem(
        "@indykite/response-list",
        '[{"@type":"success","~thread":{"thid":"1234"}}]',
      );
    });

    it("gets correct value", () => {
      expect(popResponse()).toEqual({ "@type": "success", "~thread": { thid: "1234" } });
      expect(sessionStorage.getItem("@indykite/response-list")).toBe("[]");
      expect(getThreadId()).toBe("1234");
    });
  });
});

describe("clearResponses", () => {
  beforeEach(() => {
    sessionStorage.setItem(
      "@indykite/response-list",
      '[{"@type":"success","~thread":{"thid":"1234"}}]',
    );
    clearResponses();
  });

  it("gets correct value", () => {
    expect(sessionStorage.getItem("@indykite/response-list")).toBe("[]");
  });
});

describe("getAuthFlowStartPoint", () => {
  beforeEach(() => {
    sessionStorage.setItem("@indykite/authFlowStartPoint", "https://example.com/start/flow");
  });

  it("returns correct thread ID", () => {
    expect(getAuthFlowStartPoint()).toBe("https://example.com/start/flow");
  });
});

describe("setAuthFlowStartPoint", () => {
  beforeEach(() => {
    setAuthFlowStartPoint("https://example.com/login");
  });

  it("sets correct value", () => {
    expect(sessionStorage.getItem("@indykite/authFlowStartPoint")).toBe(
      "https://example.com/login",
    );
  });
});
