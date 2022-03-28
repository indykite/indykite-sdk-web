const axios = require("axios");
const IKUIInit = require("../exports/IKUIInit");
const IKUICore = require("../exports/IKUICore");
const examples = {
  logicalRegistration: require("./response_examples/logical-registration.json"),
};
const storage = require("../lib/storage");

jest.mock("axios");
jest.mock("../exports/IKUICore/throttleChecker");
jest.mock("../lib/storage");

const APPLICATION_ID = "79e3e390-abb1-4be2-8618-9395af0e3605";
const BASE_URI = "https://example.com";
const TENANT_ID = "ccfec401-3f7b-495a-b021-f2aa3efd20cf";

const documentBody = document.getElementsByTagName("body")[0];
/** @type {HTMLDivElement} */
let container;

const originalLocation = window.location;
delete window.location;

const clickElement = (el) => {
  el.dispatchEvent(new Event("click"));

  // if the element doesn't have a click event listener, we need to simulate the redirection
  if (el.tagName.toLowerCase() === "a" && el.href && !window.location.href) {
    window.location.href = new URL(el.href).pathname;
  }
};

beforeAll(() => {
  jest.spyOn(console, "log");
  jest.spyOn(console, "debug");
  jest.spyOn(console, "error");
});

beforeEach(() => {
  jest.resetAllMocks();

  axios.get.mockImplementation(() => ({
    data: { "@type": "fail", error: "Not implemented" },
    status: 501,
  }));
  axios.post.mockImplementation(() => ({
    data: { "@type": "fail", error: "Not implemented" },
    status: 501,
  }));

  IKUIInit({
    applicationId: APPLICATION_ID,
    baseUri: BASE_URI,
    tenantId: TENANT_ID,
  });

  container = document.createElement("div");
  container.classList.add("test-container");
  documentBody.appendChild(container);
  window.location = {
    href: null,
    search: "",
  };
});

afterEach(() => {
  documentBody.removeChild(container);
});

afterAll(() => {
  window.location = originalLocation;
});

describe("when server returns a fail message type", () => {
  beforeEach(async () => {
    axios.post.mockImplementationOnce(() => ({
      status: 200,
      data: { "@type": "fail" },
    }));

    IKUICore.renderRegister({
      renderElementSelector: ".test-container",
    });
  });

  it("renders an error notification", () => {
    expect(container.querySelector(".IKUISDK-notification-container")?.textContent?.trim()).toBe(
      "Unable to get a list of login/registration options",
    );
  });
});

describe("when server returns a logical message type", () => {
  describe("when no custom data are passed", () => {
    beforeEach(async () => {
      axios.post.mockImplementationOnce(() => ({
        status: 200,
        data: examples.logicalRegistration,
      }));

      IKUICore.renderRegister({
        renderElementSelector: ".test-container",
      });
    });

    it("sends correct request", () => {
      expect(axios.post).toBeCalledTimes(1);
      expect(axios.post).toBeCalledWith(
        `${BASE_URI}/auth/${APPLICATION_ID}`,
        {
          cc: expect.any(String),
          "~arg": {
            flow: "register",
          },
          "~tenant": TENANT_ID,
        },
        {
          headers: {
            "ikui-action-name": "setup",
            "ikui-version": expect.any(String),
          },
        },
      );
    });

    it("does not render any notification", () => {
      expect(
        container.querySelector(".IKUISDK-notification-container")?.textContent?.trim(),
      ).toBe("");
    });

    it("contains correct element hierarchy", () => {
      const loginSection = container.querySelector(".indykite-login-section");
      expect(loginSection).toBeTruthy();
      const innerLoginContainer = loginSection.querySelector(".inner-indykite-login-container");
      expect(innerLoginContainer).toBeTruthy();
      const uiContainer = innerLoginContainer.childNodes.item(0);
      expect(uiContainer.tagName.toLowerCase()).toBe("div");
      expect(uiContainer).toBeTruthy();
      const form = uiContainer.querySelector("form");
      expect(form).toBeTruthy();
      const usernameInput = form.querySelector("input#IKUISDK-username");
      expect(usernameInput).toBeTruthy();
      const usernameLabel = form.querySelector('label[for="IKUISDK-username"]');
      expect(usernameLabel).toBeTruthy();
      const passwordInput = form.querySelector("input#IKUISDK-password");
      expect(passwordInput).toBeTruthy();
      const passwordLabel = form.querySelector('label[for="IKUISDK-password"]');
      expect(passwordLabel).toBeTruthy();
      const passwordConfirmInput = form.querySelector("input#IKUISDK-confirm-password");
      expect(passwordConfirmInput).toBeTruthy();
      const passwordConfirmLabel = form.querySelector('label[for="IKUISDK-confirm-password"]');
      expect(passwordConfirmLabel).toBeTruthy();
      const registerButton = form.querySelector("button#IKUISDK-btn-register");
      expect(registerButton).toBeTruthy();
      const otherOptionsLabel = uiContainer.querySelector("p.oidc-options-label");
      expect(otherOptionsLabel).toBeTruthy();
      const linkToLogin = uiContainer.querySelector("p#IKUISDK-btn-to-login");
      expect(linkToLogin).toBeTruthy();
      const googleLoginButton = uiContainer.querySelector(
        "button#IKUISDK-btn-oidc-google.google-login-button.oidc-button",
      );
      expect(googleLoginButton).toBeTruthy();
      const facebookLoginButton = uiContainer.querySelector(
        "button#IKUISDK-btn-oidc-facebook.facebook-login-button.oidc-button",
      );
      expect(facebookLoginButton).toBeTruthy();
      const microsoftLoginButton = uiContainer.querySelector(
        "button#IKUISDK-btn-oidc-microsoft.microsoft-login-button.oidc-button",
      );
      expect(microsoftLoginButton).toBeTruthy();
      const linkedInLoginButton = uiContainer.querySelector(
        "button#IKUISDK-btn-oidc-linkedin.linkedin-login-button.oidc-button",
      );
      expect(linkedInLoginButton).toBeTruthy();
      const slugworthLoginButton = uiContainer.querySelector(
        "button#IKUISDK-btn-oidc-slugworth.slugworth-login-button.oidc-button",
      );
      expect(slugworthLoginButton).toBeTruthy();
      const indykiteMeLoginButton = uiContainer.querySelector(
        "button#IKUISDK-btn-oidc-indykite-me.indykite-me-login-button.oidc-button",
      );
      expect(indykiteMeLoginButton).toBeTruthy();
      const divider1 = form.nextSibling;
      expect(divider1.tagName.toLowerCase()).toBe("hr");
      const divider2 = otherOptionsLabel.previousSibling;
      expect(divider2.tagName.toLowerCase()).toBe("hr");
    });

    describe("when the 'Already have an account' link is clicked", () => {
      beforeEach(() => {
        storage.getThreadId.mockImplementationOnce(() => "registration-screen-thread-id");

        const linkButton = container.querySelector("p#IKUISDK-btn-to-login > a");
        clickElement(linkButton);
      });

      it("it redirects to a new endpoint", () => {
        expect(window.location.href).toBe("/login");
      });
    });
  });

  describe("when no custom paths are passed", () => {
    beforeEach(async () => {
      axios.post.mockImplementationOnce(() => ({
        status: 200,
        data: examples.logicalRegistration,
      }));

      IKUICore.renderRegister({
        renderElementSelector: ".test-container",
        loginPath: "/my/login/path",
      });
    });

    describe("when the 'Already have an account' link is clicked", () => {
      beforeEach(() => {
        storage.getThreadId.mockImplementationOnce(() => "registration-screen-thread-id");

        const linkButton = container.querySelector("p#IKUISDK-btn-to-login > a");
        clickElement(linkButton);
      });

      it("it redirects to a new endpoint", () => {
        expect(window.location.href).toBe("/my/login/path");
      });
    });
  });
});
