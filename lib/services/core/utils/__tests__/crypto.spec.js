const { normalizeBase64 } = require("../crypto");
const { getCodeVerifierAndChallenge } = require("../crypto");

describe("getCodeVerifierAndChallenge", () => {
  test("Generates the values of correct length", () => {
    const { codeVerifier, codeChallenge } = getCodeVerifierAndChallenge();

    expect(codeChallenge).toHaveLength(43);
    expect(codeVerifier).toHaveLength(43);
  });

  test("Generates random values each call", () => {
    const { codeVerifier, codeChallenge } = getCodeVerifierAndChallenge();
    const { codeVerifier2, codeChallenge2 } = getCodeVerifierAndChallenge();

    expect(codeVerifier).not.toBe(codeVerifier2);
    expect(codeChallenge).not.toBe(codeChallenge2);
  });
});

describe("normalizeBase64", () => {
  test("Correctly replaces the wrong characters", () => {
    const message = "a+b/c=d+e/f=g";
    const normalizedMessage = normalizeBase64(message);

    expect(normalizedMessage).toBe("a-b_cd-e_fg");
  });
});
