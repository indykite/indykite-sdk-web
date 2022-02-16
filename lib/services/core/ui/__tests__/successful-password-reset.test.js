const successfulPasswordResetUI = require("../successful-password-reset");

/**
 * @type {HTMLElement}
 */
let returnedEl;

beforeEach(() => {
  const returnedValue = successfulPasswordResetUI();
  const helpingWrapper = document.createElement("div");
  helpingWrapper.innerHTML = returnedValue;
  returnedEl = helpingWrapper.children.item(0);
});

it("creates a correct error UI", () => {
  expect(returnedEl.tagName.toLowerCase()).toBe("div");

  const linkEl = returnedEl.getElementsByTagName("a")[0];
  expect(linkEl.textContent).toBe("Go back to login");
  expect(linkEl.href).toBe(new URL("/login", location.href).toString());
});
