const { getLocaleConfig } = require("../config");
// const { enUSLocale } = require("../../locale/en-US");
const { getLocalizedMessage } = require("../locale-provider");
const IntlMessageFormat = require("intl-messageformat").default;

jest.mock("../config", () => ({
  getLocaleConfig: jest.fn(),
}));

jest.mock("intl-messageformat", () => {
  const formatMock = jest.fn().mockImplementation(() => `Formatted: ${this.valueMock}`);

  return {
    default: jest.fn().mockImplementation((msg) => {
      this.valueMock = msg;
      return {
        format: formatMock,
      };
    }),
    formatMock,
  };
});

jest.mock("../../locale/en-US", () => ({
  enUSLocale: {
    locale: "en-US",
    messages: {
      key1: "Default message #1",
      key2: "Default message #2",
    },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("findMessageByKey", () => {
  const values = { value: "xxx" };
  let formatMock;
  let returnedValue;

  beforeAll(() => {
    formatMock = require("intl-messageformat").formatMock;
  });

  describe("when locale config contains a key", () => {
    beforeEach(() => {
      getLocaleConfig.mockImplementation(() => ({
        locale: "custom-CUSTOM",
        messages: {
          key1: "Localized message #1",
        },
      }));
      returnedValue = getLocalizedMessage("key1", values);
    });

    it("formats message", () => {
      expect(IntlMessageFormat).toBeCalledTimes(1);
      expect(IntlMessageFormat.mock.calls[0]).toEqual(["Localized message #1", "custom-CUSTOM"]);
      expect(formatMock).toBeCalledTimes(1);
      expect(formatMock.mock.calls[0]).toEqual([values]);
      expect(returnedValue).toBe("Formatted: Localized message #1");
    });
  });

  describe("when locale config does not contain a key", () => {
    beforeEach(() => {
      getLocaleConfig.mockImplementation(() => ({
        locale: "custom-CUSTOM",
        messages: {
          key1: "Localized message #1",
        },
      }));
      returnedValue = getLocalizedMessage("key2", values);
    });

    it("formats message", () => {
      expect(IntlMessageFormat).toBeCalledTimes(1);
      expect(IntlMessageFormat.mock.calls[0]).toEqual(["Default message #2", "custom-CUSTOM"]);
      expect(formatMock).toBeCalledTimes(1);
      expect(formatMock.mock.calls[0]).toEqual([values]);
      expect(returnedValue).toBe("Formatted: Default message #2");
    });
  });

  describe("when neither locale config nor default config does not contain a key", () => {
    beforeEach(() => {
      getLocaleConfig.mockImplementation(() => ({
        locale: "custom-CUSTOM",
        messages: {
          key1: "Localized message #1",
        },
      }));
      returnedValue = getLocalizedMessage("key3");
    });

    it("formats message", () => {
      expect(IntlMessageFormat).toBeCalledTimes(1);
      expect(IntlMessageFormat.mock.calls[0]).toEqual(["", "custom-CUSTOM"]);
      expect(formatMock).toBeCalledTimes(1);
      expect(formatMock.mock.calls[0]).toEqual([{}]);
      expect(returnedValue).toBe("Formatted: ");
    });
  });
});
