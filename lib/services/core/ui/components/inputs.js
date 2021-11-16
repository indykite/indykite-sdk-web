const inputWithLabel = ({
  type,
  id,
  labelText,
  autofocus,
  autocomplete = "off",
  placeholder,
  noteText,
}) => {
  const label = document.createElement("label");
  label.style.cssText = `
    font-family: 'Raleway', sans-serif;
    font-size: 16px;
    width: 100% !important;
    display: block; 
    text-transform: capitalize
  `;
  label.innerText = labelText || "";
  label.setAttribute("for", id);

  const input = document.createElement("input");

  input.id = id;
  input.type = type;
  input.autocomplete = autocomplete;
  input.style.cssText = `
    height: 45px;
    font-family: 'Raleway', sans-serif;
    font-size: 14px;
    border-radius: 6px;
    border: none;
    outline: none;
    width: 100% !important;
    display: block; 
    color: black; 
    box-sizing: border-box;
    margin-top: 5px;
    margin-bottom: 20px;
    padding: 5px 10px;
  `;
  input.autofocus = autofocus;
  if (placeholder) {
    input.placeholder = placeholder;
  }

  const note = noteText && document.createElement("div");
  if (note) {
    note.innerHTML = noteText;
    note.className = "note";
    note.style.cssText = `
      font-size: small;
      position: relative;
      top: -16px;
      padding-bottom: 8px;
    `;
  }
  return { label, input, note };
};

module.exports = {
  inputWithLabel,
};
