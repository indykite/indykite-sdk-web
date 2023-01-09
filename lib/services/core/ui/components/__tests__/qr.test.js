const qrcode = require("qrcode");
const { qr } = require("../qr");

jest.mock("qrcode");

beforeEach(() => {
  window.IKSDK = {
    config: {},
  };
});

afterEach(() => {
  delete window.IKSDK;
});

describe("when inline styles are enabled", () => {
  const qrContent = "https://indykite.com";
  const qrErrorCorrectionLevel = "M";
  /**
   * @type {HTMLElement}
   */
  let qrEl;

  const sizes = {
    S: 2,
    M: 3,
    L: 4,
    H: 5,
    unknown: 4,
  };

  beforeEach(() => {
    jest.spyOn(qrcode, "toCanvas").mockImplementation((canvasEl) => {
      canvasEl.id = "updated-canvas";
    });
  });

  afterEach(() => {
    qrcode.toCanvas.mockRestore();
  });

  Object.keys(sizes).forEach((qrSize) => {
    describe(`when qr size is "${qrSize}"`, () => {
      beforeEach(async () => {
        qrEl = await qr({
          cnt: qrContent,
          size: qrSize,
          cor: qrErrorCorrectionLevel,
        });
      });

      it("renders correct elements", () => {
        expect(qrEl.className).toEqual("IKUISDK-qr");
        expect(qrEl.style.cssText).toEqual(
          "display: flex; width: 100%; justify-content: center;",
        );
        const canvas = qrEl.querySelector("canvas");
        expect(canvas.id).toEqual("updated-canvas");
      });

      it("calls the qrcode library", () => {
        const canvas = qrEl.querySelector("canvas");

        expect(qrcode.toCanvas).toBeCalledTimes(1);
        expect(qrcode.toCanvas).toBeCalledWith(canvas, qrContent, {
          errorCorrectionLevel: qrErrorCorrectionLevel,
          scale: sizes[qrSize],
        });
      });
    });
  });
});

describe("when inline styles are disabled", () => {
  const qrContent = "https://indykite.com";
  const qrSize = "L";
  const qrErrorCorrectionLevel = "M";
  /**
   * @type {HTMLElement}
   */
  let qrEl;

  beforeEach(async () => {
    window.IKSDK.config.disableInlineStyles = true;

    jest.spyOn(qrcode, "toCanvas").mockImplementation((canvasEl) => {
      canvasEl.id = "updated-canvas";
    });

    qrEl = await qr({
      cnt: qrContent,
      size: qrSize,
      cor: qrErrorCorrectionLevel,
    });
  });

  afterEach(() => {
    qrcode.toCanvas.mockRestore();
  });

  it("renders correct elements", () => {
    expect(qrEl.className).toEqual("IKUISDK-qr");
    expect(qrEl.style.cssText).toEqual("");
    const canvas = qrEl.querySelector("canvas");
    expect(canvas.id).toEqual("updated-canvas");
  });

  it("calls the qrcode library", () => {
    const canvas = qrEl.querySelector("canvas");

    expect(qrcode.toCanvas).toBeCalledTimes(1);
    expect(qrcode.toCanvas).toBeCalledWith(canvas, qrContent, {
      errorCorrectionLevel: qrErrorCorrectionLevel,
      scale: 4,
    });
  });
});
