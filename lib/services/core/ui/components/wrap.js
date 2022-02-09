const { notificationUI } = require("./notification");
const { getElementIds } = require("../../lib/config");
const { cleanAllNotifications } = require("../../lib/notifications");

const elementIds = getElementIds();

// New version
const wrapUI = (children, notifications) => {
  // Outter most section
  const sectionEl = document.createElement("section");
  sectionEl.className = "indykite-login-section";
  sectionEl.style.cssText = "max-width: 400px;margin: 0 auto;";

  // Container
  const containerEl = document.createElement("div");
  containerEl.className = "indykite-login-container";

  // Notification section
  const notificationContainer = document.createElement("div");
  notificationContainer.id = elementIds.notificationContainer;
  notificationContainer.className = elementIds.notificationContainer;
  notificationContainer.style.cssText = "height: 70px; padding: 20px;";
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
  innerContainerEl.className = "inner-indykite-login-container";
  innerContainerEl.id = elementIds.container;
  innerContainerEl.style.cssText =
    "padding: 30px;background-color: #1B2633; color: rgb(255, 255, 255); border-radius: 6px;";
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
  <section class="indykite-login-section" style="max-width: 400px;margin: 0 auto;">
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
