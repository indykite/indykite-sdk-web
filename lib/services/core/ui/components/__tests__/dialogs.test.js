const modalDialog = require("../dialogs");

let content;

beforeAll(() => {
  window.IKSDK = {
    config: {},
  };
});

beforeEach(() => {
  content = [];
  document.body.childNodes.forEach((node) => document.body.removeChild(node));
});

afterAll(() => {
  delete window.IKSDK;
});

describe("when inline styles are enabled", () => {
  beforeAll(() => {
    window.IKSDK.config.disableInlineStyles = false;
  });

  describe("when a string is added to the dialog", () => {
    beforeEach(() => {
      content.push("Message");
      modalDialog(content);
    });

    it("renders dialog", () => {
      const background = document.body.querySelector(".IKUISDK-modal-dialog");
      expect(background.style.cssText).toEqual(
        "display: flex; position: fixed; left: 0px; right: 0px; top: 0px; bottom: 0px; justify-content: center; align-items: center; background-color: rgba(0, 0, 0, 0.5);",
      );
      const wrapper = background.querySelector(".wrapper");
      expect(wrapper.style.cssText).toEqual(
        "display: flex; flex-direction: column; min-width: 4rem; min-height: 1rem; border: 1px solid #333; border-radius: 5px; color: white; padding: 2rem 2rem 1rem 2rem; background-color: rgb(38, 38, 38);",
      );
      const form = wrapper.querySelector("form.IKUISDK-form");
      expect(form.childElementCount).toBe(1);
      const message = form.querySelector(".message");
      expect(message.innerText).toBe("Message");
    });
  });

  describe("when an input is added to the dialog", () => {
    beforeEach(() => {
      content.push({
        id: "input-id",
        label: "Input label",
        type: "input",
        value: "predefined-value",
      });
      modalDialog(content);
    });

    it("renders dialog", () => {
      const background = document.body.querySelector(".IKUISDK-modal-dialog");
      expect(background.style.cssText).toEqual(
        "display: flex; position: fixed; left: 0px; right: 0px; top: 0px; bottom: 0px; justify-content: center; align-items: center; background-color: rgba(0, 0, 0, 0.5);",
      );
      const wrapper = background.querySelector(".wrapper");
      expect(wrapper.style.cssText).toEqual(
        "display: flex; flex-direction: column; min-width: 4rem; min-height: 1rem; border: 1px solid #333; border-radius: 5px; color: white; padding: 2rem 2rem 1rem 2rem; background-color: rgb(38, 38, 38);",
      );
      const form = wrapper.querySelector("form.IKUISDK-form");
      expect(form.childElementCount).toBe(2);
      const label = form.querySelector("label.IKUISDK-label");
      expect(label.style.cssText).toEqual(
        "font-size: smaller; display: block; padding-bottom: 0.35rem;",
      );
      expect(label.htmlFor).toBe("input-id");
      expect(label.innerText).toBe("Input label");
      const input = form.querySelector("#input-id.IKUISDK-input");
      expect(input.value).toBe("predefined-value");
      expect(input.style.cssText).toEqual(
        "height: 32px; font-family: 'Rubik', sans-serif; font-size: 11px; border-radius: 5px; outline: none; width: 100% !important; display: block; background: rgb(33, 33, 33); color: rgb(237, 232, 225); box-sizing: border-box; margin-bottom: 1rem; padding: 10px 14px;",
      );
      expect(document.activeElement).toBe(input);
    });
  });

  describe("when inputs and submit button are added to the dialog", () => {
    let dialogFn;

    beforeEach(() => {
      content.push(
        {
          id: "input-name-id",
          label: "Name",
          type: "input",
        },
        {
          id: "input-surname-id",
          label: "Surname",
          type: "input",
          value: "",
        },
        {
          label: "Confirm",
          type: "submit",
        },
      );
      dialogFn = modalDialog(content);
    });

    it("renders dialog", () => {
      const background = document.body.querySelector(".IKUISDK-modal-dialog");
      expect(background.style.cssText).toEqual(
        "display: flex; position: fixed; left: 0px; right: 0px; top: 0px; bottom: 0px; justify-content: center; align-items: center; background-color: rgba(0, 0, 0, 0.5);",
      );
      const wrapper = background.querySelector(".wrapper");
      expect(wrapper.style.cssText).toEqual(
        "display: flex; flex-direction: column; min-width: 4rem; min-height: 1rem; border: 1px solid #333; border-radius: 5px; color: white; padding: 2rem 2rem 1rem 2rem; background-color: rgb(38, 38, 38);",
      );
      const form = wrapper.querySelector("form.IKUISDK-form");
      expect(form.childElementCount).toBe(5);
      const label = form.querySelector("label.IKUISDK-label");
      expect(label.style.cssText).toEqual(
        "font-size: smaller; display: block; padding-bottom: 0.35rem;",
      );
      expect(label.htmlFor).toBe("input-name-id");
      expect(label.innerText).toBe("Name");
      const input = form.querySelector("#input-name-id.IKUISDK-input");
      expect(input.value).toBe("");
      expect(input.style.cssText).toEqual(
        "height: 32px; font-family: 'Rubik', sans-serif; font-size: 11px; border-radius: 5px; outline: none; width: 100% !important; display: block; background: rgb(33, 33, 33); color: rgb(237, 232, 225); box-sizing: border-box; margin-bottom: 1rem; padding: 10px 14px;",
      );
      expect(document.activeElement).toBe(input);
      const submit = form.querySelector(".IKUISDK-primary-btn");
      expect(submit.innerText).toBe("Confirm");
    });

    describe("when a text in entered and button clicked", () => {
      beforeEach(() => {
        const background = document.body.querySelector(".IKUISDK-modal-dialog");
        const nameInput = background.querySelector("#input-name-id");
        const surnameInput = background.querySelector("#input-surname-id");
        const submit = background.querySelector(".IKUISDK-primary-btn");
        nameInput.value = "Alice";
        surnameInput.value = "Green";
        submit.click();
      });

      it("returns an object with values", async () => {
        const value = await dialogFn;
        expect(value).toEqual({ "input-name-id": "Alice", "input-surname-id": "Green" });
      });
    });
  });

  describe("when an invalid entry is added to the dialog", () => {
    beforeEach(() => {
      content.push({ type: "unknown" });
      modalDialog(content);
    });

    it("renders dialog", () => {
      const background = document.body.querySelector(".IKUISDK-modal-dialog");
      expect(background.style.cssText).toEqual(
        "display: flex; position: fixed; left: 0px; right: 0px; top: 0px; bottom: 0px; justify-content: center; align-items: center; background-color: rgba(0, 0, 0, 0.5);",
      );
      const wrapper = background.querySelector(".wrapper");
      expect(wrapper.style.cssText).toEqual(
        "display: flex; flex-direction: column; min-width: 4rem; min-height: 1rem; border: 1px solid #333; border-radius: 5px; color: white; padding: 2rem 2rem 1rem 2rem; background-color: rgb(38, 38, 38);",
      );
      const form = wrapper.querySelector("form.IKUISDK-form");
      expect(form.childElementCount).toBe(0);
    });
  });
});

describe("when inline styles are disabled", () => {
  beforeAll(() => {
    window.IKSDK.config.disableInlineStyles = true;
  });

  describe("when a string is added to the dialog", () => {
    beforeEach(() => {
      content.push("Message");
      modalDialog(content);
    });

    it("renders dialog", () => {
      const background = document.body.querySelector(".IKUISDK-modal-dialog");
      expect(background.style.cssText).toEqual("");
      const wrapper = background.querySelector(".wrapper");
      expect(wrapper.style.cssText).toEqual("");
      const form = wrapper.querySelector("form.IKUISDK-form");
      expect(form.childElementCount).toBe(1);
      const message = form.querySelector(".message");
      expect(message.innerText).toBe("Message");
    });
  });

  describe("when an input is added to the dialog", () => {
    beforeEach(() => {
      content.push({
        id: "input-id",
        label: "Input label",
        type: "input",
      });
      modalDialog(content);
    });

    it("renders dialog", () => {
      const background = document.body.querySelector(".IKUISDK-modal-dialog");
      expect(background.style.cssText).toEqual("");
      const wrapper = background.querySelector(".wrapper");
      expect(wrapper.style.cssText).toEqual("");
      const form = wrapper.querySelector("form.IKUISDK-form");
      expect(form.childElementCount).toBe(2);
      const label = form.querySelector("label.IKUISDK-label");
      expect(label.style.cssText).toEqual("");
      expect(label.htmlFor).toBe("input-id");
      expect(label.innerText).toBe("Input label");
      const input = form.querySelector("#input-id.IKUISDK-input");
      expect(input.value).toBe("");
      expect(input.style.cssText).toEqual("");
      expect(document.activeElement).toBe(input);
    });
  });

  describe("when an input and submit button are added to the dialog", () => {
    let dialogFn;

    beforeEach(() => {
      content.push(
        {
          id: "input-id",
          label: "Input label",
          type: "input",
          value: "predefined-value",
        },
        {
          label: "Confirm",
          type: "submit",
        },
      );
      dialogFn = modalDialog(content);
    });

    it("renders dialog", () => {
      const background = document.body.querySelector(".IKUISDK-modal-dialog");
      expect(background.style.cssText).toEqual("");
      const wrapper = background.querySelector(".wrapper");
      expect(wrapper.style.cssText).toEqual("");
      const form = wrapper.querySelector("form.IKUISDK-form");
      expect(form.childElementCount).toBe(3);
      const label = form.querySelector("label.IKUISDK-label");
      expect(label.style.cssText).toEqual("");
      expect(label.htmlFor).toBe("input-id");
      expect(label.innerText).toBe("Input label");
      const input = form.querySelector("#input-id.IKUISDK-input");
      expect(input.value).toBe("predefined-value");
      expect(input.style.cssText).toEqual("");
      expect(document.activeElement).toBe(input);
      const submit = form.querySelector(".IKUISDK-primary-btn");
      expect(submit.innerText).toBe("Confirm");
    });
  });
});
