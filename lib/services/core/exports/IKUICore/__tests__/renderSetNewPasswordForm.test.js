const { setNewPasswordSetupRequest } = require("../../../lib/reset-password");
const newPasswordUI = require("../../../ui/new-password");
const newPasswordErrorUI = require("../../../ui/new-password-error");
const renderSetNewPasswordForm = require("../renderSetNewPasswordForm");
const updateParentElement = require("../updateParentElement");
const { getLocalizedMessage } = require("../../../lib/locale-provider");

jest.mock("../../../lib/reset-password");
jest.mock("../../../ui/new-password");
jest.mock("../../../ui/new-password-error");
jest.mock("../throttleChecker");
jest.mock("../updateParentElement");
jest.mock("../../../lib/locale-provider");

window.IKSDK = {
  config: {
    baseUri: "https://example.com",
  },
};

let props;

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  props = {
    labels: {
      confirmNewPassword: "Confirm new password",
      newPassword: "New password",
      submitButton: "Submit",
    },
    token: "token-value",
    validatePassword: jest.fn(),
  };
  getLocalizedMessage.mockImplementation((key, values) => {
    const stringifiedValues = values ? JSON.stringify(values) : "";
    return `Localized: ${key} ${stringifiedValues}`.trim();
  });
});

afterEach(() => {
  console.error.mockRestore();
});

describe("when setNewPasswordSetupRequest returns a list of registration options", () => {
  const setNewPasswordSetupResponse = [];

  beforeEach(() => {
    setNewPasswordSetupRequest.mockImplementation(() =>
      Promise.resolve(setNewPasswordSetupResponse),
    );
  });

  describe("when renderElementSelector is present in props", () => {
    beforeEach(() => {
      props.renderElementSelector = "#selector";
    });

    describe("when an element matching the selector exists", () => {
      let el;

      beforeEach(async () => {
        el = document.createElement("div");
        jest.spyOn(document, "querySelector").mockImplementation((selector) => {
          return selector === "#selector" ? el : null;
        });

        return renderSetNewPasswordForm(props);
      });

      it("calls newPasswordUI function", () => {
        expect(newPasswordUI).toBeCalledTimes(1);
        expect(newPasswordUI).toBeCalledWith({
          labels: props.labels,
          validatePassword: props.validatePassword,
          fields: setNewPasswordSetupResponse,
        });
      });

      it("does not call newPasswordErrorUI function", () => {
        expect(newPasswordErrorUI).toBeCalledTimes(0);
      });

      it("updates container element", () => {
        expect(updateParentElement).toBeCalledTimes(1);
        expect(updateParentElement).toBeCalledWith({
          parent: el,
          child: newPasswordUI.mock.results[0].value,
        });
      });

      it("does not print anything into the console", () => {
        expect(console.error).toBeCalledTimes(0);
      });
    });

    describe("when an element matching the selector does not exist", () => {
      beforeEach(async () => {
        jest.spyOn(document, "querySelector").mockImplementation(() => null);

        return renderSetNewPasswordForm(props);
      });

      it("does not call newPasswordUI function", () => {
        expect(newPasswordUI).toBeCalledTimes(0);
      });

      it("does not call newPasswordErrorUI function", () => {
        expect(newPasswordErrorUI).toBeCalledTimes(0);
      });

      it("does not update container element", () => {
        expect(updateParentElement).toBeCalledTimes(0);
      });

      it("prints an error into the console", () => {
        expect(console.error).toBeCalledTimes(1);
        expect(console.error).toBeCalledWith(
          "Cannot find any element by provided renderElementSelector prop: #selector",
        );
      });
    });
  });

  describe("when an element matching the selector does not exist", () => {
    beforeEach(async () => {
      jest.spyOn(document, "querySelector").mockImplementation(() => null);

      return renderSetNewPasswordForm(props);
    });

    it("does not call newPasswordUI function", () => {
      expect(newPasswordUI).toBeCalledTimes(0);
    });

    it("does not call newPasswordErrorUI function", () => {
      expect(newPasswordErrorUI).toBeCalledTimes(0);
    });

    it("does not update container element", () => {
      expect(updateParentElement).toBeCalledTimes(0);
    });

    it("prints an error into the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error).toBeCalledWith(
        "You have not provided any renderElementSelector prop!",
      );
    });
  });
});

describe("when setNewPasswordSetupRequest throws an error", () => {
  let error;

  beforeEach(async () => {
    error = new Error("Test error");

    newPasswordErrorUI.mockImplementation(() => "Mocked new password error UI");
    setNewPasswordSetupRequest.mockImplementationOnce(() => Promise.reject(error));
  });

  describe("when renderElementSelector is present in props", () => {
    beforeEach(() => {
      props.renderElementSelector = "#selector";
    });

    describe("when an element matching the selector exists", () => {
      let el;

      beforeEach(() => {
        el = document.createElement("div");
        jest.spyOn(document, "querySelector").mockImplementation((selector) => {
          return selector === "#selector" ? el : null;
        });
      });

      describe("when the error contains a message", () => {
        beforeEach(() => {
          error["~error"] = {
            msg: "Detailed error description",
          };
          return renderSetNewPasswordForm(props);
        });

        it("does not call newPasswordUI function", () => {
          expect(newPasswordUI).toBeCalledTimes(0);
        });

        it("calls newPasswordErrorUI function", () => {
          expect(newPasswordErrorUI).toBeCalledTimes(1);
          expect(newPasswordErrorUI).toBeCalledWith("Detailed error description");
        });

        it("updates container element", () => {
          expect(el.innerHTML).toBe("Mocked new password error UI");
        });

        it("prints an error into the console", () => {
          expect(console.error).toBeCalledTimes(1);
          expect(console.error).toBeCalledWith(error);
        });
      });

      describe("when the error does not contain a message", () => {
        beforeEach(() => {
          return renderSetNewPasswordForm(props);
        });

        it("does not call newPasswordUI function", () => {
          expect(newPasswordUI).toBeCalledTimes(0);
        });

        it("calls newPasswordErrorUI function", () => {
          expect(newPasswordErrorUI).toBeCalledTimes(1);
          expect(newPasswordErrorUI).toBeCalledWith("Localized: uisdk.general.error");
        });

        it("updates container element", () => {
          expect(el.innerHTML).toBe("Mocked new password error UI");
        });

        it("prints an error into the console", () => {
          expect(console.error).toBeCalledTimes(1);
          expect(console.error).toBeCalledWith(error);
        });
      });
    });

    describe("when an element matching the selector does not exist", () => {
      beforeEach(async () => {
        jest.spyOn(document, "querySelector").mockImplementation(() => null);

        return renderSetNewPasswordForm(props);
      });

      it("does not call newPasswordUI function", () => {
        expect(newPasswordUI).toBeCalledTimes(0);
      });

      it("does not call newPasswordErrorUI function", () => {
        expect(newPasswordErrorUI).toBeCalledTimes(0);
      });

      it("does not update container element", () => {
        expect(updateParentElement).toBeCalledTimes(0);
      });

      it("prints an error into the console", () => {
        expect(console.error).toBeCalledTimes(1);
        expect(console.error).toBeCalledWith(
          "Cannot find any element by provided renderElementSelector prop: #selector",
        );
      });
    });
  });

  describe("when an element matching the selector does not exist", () => {
    beforeEach(async () => {
      jest.spyOn(document, "querySelector").mockImplementation(() => null);

      return renderSetNewPasswordForm(props);
    });

    it("does not call newPasswordUI function", () => {
      expect(newPasswordUI).toBeCalledTimes(0);
    });

    it("does not call newPasswordErrorUI function", () => {
      expect(newPasswordErrorUI).toBeCalledTimes(0);
    });

    it("does not update container element", () => {
      expect(updateParentElement).toBeCalledTimes(0);
    });

    it("prints an error into the console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error).toBeCalledWith(
        "You have not provided any renderElementSelector prop!",
      );
    });
  });
});
