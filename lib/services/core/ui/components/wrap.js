const { notificationUI } = require("./notification");
const { getElementIds } = require("../../lib/config");
const { cleanAllNotifications } = require("../../lib/notifications");

const elementIds = getElementIds();

// New version
const wrapUI = (children, notifications) => {
  const disableInlineStyles = window.IKSDK.config.disableInlineStyles;

  // Outter most section
  const sectionEl = document.createElement("section");
  sectionEl.className = "indykite-login-section IKUISDK-form-section";

  // Container
  const containerEl = document.createElement("div");
  containerEl.className = "indykite-login-container IKUISDK-form-container";

  // Notification section
  const notificationContainer = document.createElement("div");
  notificationContainer.id = elementIds.notificationContainer;
  notificationContainer.className = elementIds.notificationContainer;
  if (notifications) {
    notifications.forEach(
      (notification) =>
        (notificationContainer.innerHTML += notificationUI(
          notification.title,
          notification.type,
        )),
    );
    cleanAllNotifications();
  }

  // Main content section
  const innerContainerEl = document.createElement("div");
  innerContainerEl.className = "inner-indykite-login-container IKUISDK-form-content";
  innerContainerEl.id = elementIds.container;

  if (!disableInlineStyles) {
    sectionEl.style.cssText = "width: 284px;margin: 0 auto;";
    containerEl.style.cssText =
      "background-color: rgb(38, 38, 38); color: rgb(250, 250, 250); border-radius: 5px;";
    notificationContainer.style.cssText = "height: auto; padding: 40px 20px 0px 20px;";
    innerContainerEl.style.cssText = "padding: 0px 26px 40px 26px;color: rgb(250, 250, 250);";
  }

  if (children) {
    innerContainerEl.appendChild(children);
  }

  containerEl.appendChild(notificationContainer);
  containerEl.appendChild(innerContainerEl);

  sectionEl.appendChild(containerEl);

  return sectionEl;
};

// Old version
const wrap = (children, notifications) => `
  <section class="indykite-login-section" style="width: 284px;margin: 0 auto;">
      <div class="indykite-login-container">
          <div id="${elementIds.notificationContainer}" style="height: 70px; padding: 20px;">
              ${
                notifications
                  ? notifications.map((notification) =>
                      notificationUI(notification.title, notification.type),
                    )
                  : ""
              }
          </div>
          <div id='${
            elementIds.container
          }' class="inner-indykite-login-container" style="padding: 20px;">
            ${children}
          </div>
      </div>
  </section>
`;

module.exports = {
  wrapUI,
  wrap,
};
