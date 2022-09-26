const newPasswordErrorUI = require("../new-password-error");

window.IKSDK = {
  config: { disableInlineStyles: false },
};

/**
 * @type {HTMLElement}
 */
let sectionEl;

beforeEach(() => {
  const returnedValue = newPasswordErrorUI("Mocked error message");
  const helpingWrapper = document.createElement("div");
  helpingWrapper.innerHTML = returnedValue;
  sectionEl = helpingWrapper.children.item(0);
});

it("creates a correct error UI", () => {
  expect(sectionEl.tagName.toLowerCase()).toBe("section");
  expect(sectionEl.className).toBe("indykite-login-section");

  const loginContainerEl = sectionEl.children.item(0);
  const notificationContainerEl = loginContainerEl.children.item(0);
  expect(notificationContainerEl.childElementCount).toBe(0);
  const innerIndykiteLoginContainerEl = loginContainerEl.children.item(1);
  const notificationTextEl = innerIndykiteLoginContainerEl.children
    .item(0)
    .children.item(0)
    .children.item(0);
  expect(notificationTextEl.textContent).toBe("Mocked error message");
  const backToLoginEl = innerIndykiteLoginContainerEl.children.item(2).children.item(0);
  expect(backToLoginEl.href).toBe(new URL("/login", location.href).toString());
});
