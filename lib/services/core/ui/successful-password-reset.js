/**
 * Injects html element with id. handleSuccess function can edit its innerHtml.
 * @returns {string}
 */
const successfulPasswordResetUI = () =>
  `<div>
      <p style="font-family: 'Rubik', sans-serif;font-size: 14px;text-align: center; margin-top: 1em;">
          <a href="/login">Go back to login</a>
      </p>
  </div>
  `;

module.exports = successfulPasswordResetUI;
