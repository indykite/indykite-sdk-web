const { wrapUI } = require("../components/wrap");
const newPasswordUI = require("../new-password");
const { handleSendNewPassword } = require("../../lib/reset-password");

jest.mock("../components/wrap");
jest.mock("../../lib/reset-password");

window.IKSDK = { config: {} };
let props;

beforeEach(() => {
  jest.resetAllMocks();

  props = {};

  wrapUI.mockImplementation((el) => {
    const wrapper = document.createElement("div");
    wrapper.className = "mocked-wrapper";
    wrapper.appendChild(el);
    return wrapper;
  });

  handleSendNewPassword.mockImplementation(() => Promise.resolve());
});

describe("when no custom labels are used", () => {
  describe("when a validate password property is not specified", () => {
    /**
     * @type {HTMLElement}
     */
    let returnedValue;

    beforeEach(() => {
      returnedValue = newPasswordUI(props);
    });

    it("returns correct value", () => {
      expect(returnedValue.className).toBe("mocked-wrapper");

      const passwordContainer = returnedValue.querySelector(
        "div[id='IKUISDK-new-password-container']",
      );
      const formGroups = passwordContainer.getElementsByClassName("form-group");
      const passwordFormGroup = formGroups[0];
      const passwordLabel = passwordFormGroup.getElementsByTagName("label")[0];
      const passwordInput = passwordFormGroup.getElementsByTagName("input")[0];
      expect(passwordLabel.htmlFor).toBe("IKUISDK-new-password");
      expect(passwordLabel.innerText).toBe("New password");
      expect(passwordInput.autofocus).toBe(true);
      expect(passwordInput.id).toBe("IKUISDK-new-password");
      const passwordCheckFormGroup = formGroups[1];
      const passwordCheckLabel = passwordCheckFormGroup.getElementsByTagName("label")[0];
      const passwordCheckInput = passwordCheckFormGroup.getElementsByTagName("input")[0];
      expect(passwordCheckLabel.htmlFor).toBe("IKUISDK-confirm-new-password");
      expect(passwordCheckLabel.innerText).toBe("Confirm new password");
      expect(passwordCheckInput.autofocus).toBe(false);
      expect(passwordCheckInput.id).toBe("IKUISDK-confirm-new-password");

      const submitButton = passwordContainer.querySelector(
        "button[id='IKUISDK-btn-new-password']",
      );
      expect(submitButton.innerText).toBe("Reset password");
    });

    describe("when the submit button is clicked", () => {
      let preventDefaultSpy;

      describe("when handleSendResetPasswordEmail call succeeds", () => {
        beforeEach(() => {
          const clickEvent = new Event("click");
          preventDefaultSpy = jest.spyOn(clickEvent, "preventDefault");
          returnedValue
            .querySelector("button[id='IKUISDK-btn-new-password']")
            .dispatchEvent(clickEvent);
        });

        it("prevents from the default action", () => {
          expect(preventDefaultSpy).toBeCalledTimes(1);
        });

        it("calls handleSendNewPassword function", () => {
          expect(handleSendNewPassword).toBeCalledTimes(1);
          expect(handleSendNewPassword).toBeCalledWith(null);
        });
      });

      describe("when handleSendResetPasswordEmail call fails", () => {
        beforeEach(() => {
          handleSendNewPassword.mockImplementation(() => Promise.reject(new Error("Test error")));

          const clickEvent = new Event("click");
          preventDefaultSpy = jest.spyOn(clickEvent, "preventDefault");
          returnedValue
            .querySelector("button[id='IKUISDK-btn-new-password']")
            .dispatchEvent(clickEvent);
        });

        it("prevents from the default action", () => {
          expect(preventDefaultSpy).toBeCalledTimes(1);
        });

        it("calls handleSendNewPassword function", () => {
          expect(handleSendNewPassword).toBeCalledTimes(1);
          expect(handleSendNewPassword).toBeCalledWith(null);
        });
      });
    });
  });

  describe("when a validate password property is specified", () => {
    describe("whenm the validate password property is a function", () => {
      /**
       * @type {HTMLElement}
       */
      let returnedValue;

      beforeEach(() => {
        props.validatePassword = jest.fn().mockImplementation((value) => value.length !== 0);

        returnedValue = newPasswordUI(props);
      });

      describe("when password field is empty (validatePassword returns false)", () => {
        describe("when the submit button is clicked", () => {
          let preventDefaultSpy;

          beforeEach(() => {
            const clickEvent = new Event("click");
            preventDefaultSpy = jest.spyOn(clickEvent, "preventDefault");
            returnedValue
              .querySelector("button[id='IKUISDK-btn-new-password']")
              .dispatchEvent(clickEvent);
          });

          it("prevents from the default action", () => {
            expect(preventDefaultSpy).toBeCalledTimes(1);
          });

          it("does not call handleSendNewPassword function", () => {
            expect(handleSendNewPassword).toBeCalledTimes(0);
          });
        });
      });

      describe("when password field is not empty (validatePassword returns true)", () => {
        describe("when the submit button is clicked", () => {
          let preventDefaultSpy;

          beforeEach(() => {
            returnedValue.querySelector("input[id='IKUISDK-confirm-new-password']").value =
              "p4ssword";
            const clickEvent = new Event("click");
            preventDefaultSpy = jest.spyOn(clickEvent, "preventDefault");
            returnedValue
              .querySelector("button[id='IKUISDK-btn-new-password']")
              .dispatchEvent(clickEvent);
          });

          it("prevents from the default action", () => {
            expect(preventDefaultSpy).toBeCalledTimes(1);
          });

          it("does not call handleSendNewPassword function", () => {
            expect(handleSendNewPassword).toBeCalledTimes(1);
            expect(handleSendNewPassword).toBeCalledWith(null);
          });
        });
      });
    });

    describe("whenm the validate password property is a boolean (incorrect type)", () => {
      /**
       * @type {HTMLElement}
       */
      let returnedValue;

      beforeEach(() => {
        props.validatePassword = false;

        returnedValue = newPasswordUI(props);
      });

      describe("when the submit button is clicked", () => {
        let preventDefaultSpy;

        beforeEach(() => {
          const clickEvent = new Event("click");
          preventDefaultSpy = jest.spyOn(clickEvent, "preventDefault");
          returnedValue
            .querySelector("button[id='IKUISDK-btn-new-password']")
            .dispatchEvent(clickEvent);
        });

        it("prevents from the default action", () => {
          expect(preventDefaultSpy).toBeCalledTimes(1);
        });

        it("does not call handleSendNewPassword function", () => {
          expect(handleSendNewPassword).toBeCalledTimes(1);
          expect(handleSendNewPassword).toBeCalledWith(null);
        });
      });
    });
  });
});

describe("when custom labels are used", () => {
  /**
   * @type {HTMLElement}
   */
  let returnedValue;

  beforeEach(() => {
    props.labels = {
      newPassword: "Enter the new password",
      confirmNewPassword: "Confirm the new password",
      submitButton: "Submit",
    };

    returnedValue = newPasswordUI(props);
  });

  it("returns correct value", () => {
    expect(returnedValue.className).toBe("mocked-wrapper");

    const passwordContainer = returnedValue.querySelector(
      "div[id='IKUISDK-new-password-container']",
    );
    const formGroups = passwordContainer.getElementsByClassName("form-group");
    const passwordFormGroup = formGroups[0];
    const passwordLabel = passwordFormGroup.getElementsByTagName("label")[0];
    const passwordInput = passwordFormGroup.getElementsByTagName("input")[0];
    expect(passwordLabel.htmlFor).toBe("IKUISDK-new-password");
    expect(passwordLabel.innerText).toBe("Enter the new password");
    expect(passwordInput.autofocus).toBe(true);
    expect(passwordInput.id).toBe("IKUISDK-new-password");
    const passwordCheckFormGroup = formGroups[1];
    const passwordCheckLabel = passwordCheckFormGroup.getElementsByTagName("label")[0];
    const passwordCheckInput = passwordCheckFormGroup.getElementsByTagName("input")[0];
    expect(passwordCheckLabel.htmlFor).toBe("IKUISDK-confirm-new-password");
    expect(passwordCheckLabel.innerText).toBe("Confirm the new password");
    expect(passwordCheckInput.autofocus).toBe(false);
    expect(passwordCheckInput.id).toBe("IKUISDK-confirm-new-password");

    const submitButton = passwordContainer.querySelector("button[id='IKUISDK-btn-new-password']");
    expect(submitButton.innerText).toBe("Submit");
  });

  describe("when the submit button is clicked", () => {
    let preventDefaultSpy;

    beforeEach(() => {
      const clickEvent = new Event("click");
      preventDefaultSpy = jest.spyOn(clickEvent, "preventDefault");
      returnedValue
        .querySelector("button[id='IKUISDK-btn-new-password']")
        .dispatchEvent(clickEvent);
    });

    it("prevents from the default action", () => {
      expect(preventDefaultSpy).toBeCalledTimes(1);
    });

    it("calls handleSendNewPassword function", () => {
      expect(handleSendNewPassword).toBeCalledTimes(1);
      expect(handleSendNewPassword).toBeCalledWith(null);
    });
  });
});
