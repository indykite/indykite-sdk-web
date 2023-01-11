import isInitialized from "../isInitialized";

describe("when the SDK is not initialized", () => {
  it("returns false", () => {
    expect(isInitialized()).toBe(false);
  });
});

describe("when the SDK is not initialized", () => {
  beforeEach(() => {
    window.IKSDK = {};
  });

  afterEach(() => {
    delete window.IKSDK;
  });

  it("returns false", () => {
    expect(isInitialized()).toBe(true);
  });
});
