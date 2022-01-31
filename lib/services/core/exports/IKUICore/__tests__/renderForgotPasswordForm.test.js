const { loginSetup } = require("../../../lib/login");
const { forgotPasswordSetupRequest } = require("../../../lib/reset-password");
const forgotPasswordUI = require("../../../ui/forgot-password");
const newPasswordErrorUI = require("../../../ui/new-password-error");
const renderForgotPasswordForm = require("../renderForgotPasswordForm");
const updateParentElement = require("../updateParentElement");

jest.mock("../../../lib/login");
jest.mock("../../../lib/reset-password");
jest.mock("../../../ui/forgot-password");
jest.mock("../../../ui/new-password-error");
jest.mock("../throttleChecker");
jest.mock("../updateParentElement");

window.IKSDK = {
  config: {
    baseUri: "https://example.com",
  },
};

let props;

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});

  forgotPasswordUI.mockImplementation(() => {
    const el = document.createElement("div");
    el.innerHTML = "Mocked forgotten password UI";
    return el;
  });

  props = {
    labels: {
      username: "Username",
    },
    loginPath: "/login",
  };
});

afterEach(() => {
  console.error.mockRestore();
});

describe("when forgotPasswordSetupRequest returns a list of fields", () => {
  const fields = [
    {
      "~ord": 0,
      "@type": "input",
      "@id": "username",
      hint: "text",
      autocomplete: true,
      maxlength: 128,
      minlength: 8,
      pattern: "^.{8,128}$",
      placeholder: "username",
      required: true,
    },
  ];

  beforeEach(() => {
    forgotPasswordSetupRequest.mockImplementation(() => Promise.resolve(fields));
  });

  describe("when renderElementSelector is present in props", () => {
    beforeEach(() => {
      props.renderElementSelector = "#selector";
    });

    describe("when an element matching the selector exists", () => {
      let returnedValue;
      let el;

      beforeEach(async () => {
        el = document.createElement("div");

        jest.spyOn(document, "querySelector").mockImplementation((selector) => {
          return selector === props.renderElementSelector ? el : null;
        });

        returnedValue = await renderForgotPasswordForm(props);
      });

      afterEach(() => {
        document.querySelector.mockRestore();
      });

      it("renders forgotten password form into the element", () => {
        expect(updateParentElement).toBeCalledTimes(1);
        expect(forgotPasswordUI).toBeCalledTimes(1);
        expect(updateParentElement).toBeCalledWith({
          parent: el,
          child: forgotPasswordUI.mock.results[0].value,
        });
      });

      it("does not render any error", () => {
        expect(newPasswordErrorUI).toBeCalledTimes(0);
      });

      it("passes correct arguments to forgotPasswordUI", () => {
        expect(forgotPasswordUI).toBeCalledTimes(1);
        expect(forgotPasswordUI).toBeCalledWith({
          fields,
          labels: {
            username: "Username",
          },
          loginPath: "/login",
        });
      });

      it("does not print anything into console", () => {
        expect(console.error).toBeCalledTimes(0);
      });
    });

    describe("when an element matching the selector does not exist", () => {
      let returnedValue;

      beforeEach(async () => {
        jest.spyOn(document, "querySelector").mockImplementation(() => null);

        returnedValue = await renderForgotPasswordForm(props);
      });

      afterEach(() => {
        document.querySelector.mockRestore();
      });

      it("does not render forgotten password form", () => {
        expect(updateParentElement).toBeCalledTimes(0);
        expect(forgotPasswordUI).toBeCalledTimes(0);
      });

      it("prints an error into console", () => {
        expect(console.error).toBeCalledTimes(1);
        expect(console.error).toBeCalledWith(
          "Cannot find any element by provided renderElementSelector prop: #selector",
        );
      });
    });
  });

  describe("when renderElementSelector is not present in props", () => {
    let returnedValue;

    beforeEach(async () => {
      returnedValue = await renderForgotPasswordForm(props);
    });

    it("does not render forgotten password form", () => {
      expect(updateParentElement).toBeCalledTimes(0);
      expect(forgotPasswordUI).toBeCalledTimes(0);
    });

    it("prints an error into console", () => {
      expect(console.error).toBeCalledTimes(1);
      expect(console.error).toBeCalledWith(
        "You have not provided any renderElementSelector prop!",
      );
    });
  });
});

describe("when forgotPasswordSetupRequest throws an error", () => {
  beforeEach(() => {
    forgotPasswordSetupRequest.mockImplementationOnce(() =>
      Promise.reject(new Error("Test error")),
    );
  });

  describe("when loginSetup returns a list of options", () => {
    beforeEach(() => {
      loginSetup.mockImplementation(() =>
        Promise.resolve({
          "@type": "logical",
          opts: [],
        }),
      );
    });

    describe("when forgotPasswordSetupRequest succeeds on the second call", () => {
      let returnedValue;
      let el;

      beforeEach(async () => {
        el = document.createElement("div");

        jest.spyOn(document, "querySelector").mockImplementation((selector) => {
          return selector === props.renderElementSelector ? el : null;
        });
        forgotPasswordSetupRequest.mockImplementationOnce(() => Promise.resolve([]));

        returnedValue = await renderForgotPasswordForm(props);
      });

      afterEach(() => {
        document.querySelector.mockRestore();
      });

      it("renders forgotten password form into the element", () => {
        expect(updateParentElement).toBeCalledTimes(1);
        expect(forgotPasswordUI).toBeCalledTimes(1);
        expect(updateParentElement).toBeCalledWith({
          parent: el,
          child: forgotPasswordUI.mock.results[0].value,
        });
      });

      it("passes correct arguments to forgotPasswordUI", () => {
        expect(forgotPasswordUI).toBeCalledTimes(1);
        expect(forgotPasswordUI).toBeCalledWith({
          fields: [],
          labels: {
            username: "Username",
          },
          loginPath: "/login",
        });
      });

      it("does not print anything into console", () => {
        expect(console.error).toBeCalledTimes(0);
      });
    });

    describe("when forgotPasswordSetupRequest fails on the second call", () => {
      const error = new Error("Test error");

      beforeEach(async () => {
        forgotPasswordSetupRequest.mockImplementationOnce(() => Promise.reject(error));
      });

      describe("when renderElementSelector is present in props", () => {
        beforeEach(() => {
          props.renderElementSelector = "#selector";
        });

        describe("when an element matching the selector exists", () => {
          let returnedValue;
          let el;

          beforeEach(async () => {
            el = document.createElement("div");

            jest.spyOn(document, "querySelector").mockImplementation((selector) => {
              return selector === props.renderElementSelector ? el : null;
            });

            returnedValue = await renderForgotPasswordForm(props);
          });

          afterEach(() => {
            document.querySelector.mockRestore();
          });

          it("renders there an error", () => {
            expect(updateParentElement).toBeCalledTimes(0);
            expect(forgotPasswordUI).toBeCalledTimes(0);
            expect(newPasswordErrorUI).toBeCalledTimes(1);
            expect(newPasswordErrorUI).toBeCalledWith(error);
          });

          it("prints an error into console", () => {
            expect(console.error).toBeCalledTimes(1);
            expect(console.error).toBeCalledWith(error);
          });
        });

        describe("when an element matching the selector does not exist", () => {
          let returnedValue;

          beforeEach(async () => {
            jest.spyOn(document, "querySelector").mockImplementation(() => null);

            returnedValue = await renderForgotPasswordForm(props);
          });

          afterEach(() => {
            document.querySelector.mockRestore();
          });

          it("does not render an error", () => {
            expect(newPasswordErrorUI).toBeCalledTimes(0);
          });

          it("prints an error into console", () => {
            expect(console.error).toBeCalledTimes(1);
            expect(console.error).toBeCalledWith(
              "Cannot find any element by provided renderElementSelector prop: #selector",
            );
          });
        });
      });

      describe("when renderElementSelector is not present in props", () => {
        let returnedValue;

        beforeEach(async () => {
          returnedValue = await renderForgotPasswordForm(props);
        });

        it("does not render an error", () => {
          expect(newPasswordErrorUI).toBeCalledTimes(0);
        });

        it("prints an error into console", () => {
          expect(console.error).toBeCalledTimes(1);
          expect(console.error).toBeCalledWith(
            "You have not provided any renderElementSelector prop!",
          );
        });
      });
    });
  });
});
