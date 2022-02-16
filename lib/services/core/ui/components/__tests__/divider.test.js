const { divider } = require("../divider");

it("returns a correct element", () => {
  const el = divider();
  expect(el.tagName.toLowerCase()).toBe("hr");
  expect(el.style.borderColor).toBe("rgb(111, 120, 132)");
  expect(el.style.opacity).toBe("0.35");
  expect(el.style.marginBottom).toBe("20px");
});
