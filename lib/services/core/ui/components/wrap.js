const { notificationUI } = require("./notification");
const { getElementIds } = require("../../lib/config");
const { cleanAllNotifications } = require("../../lib/notifications");

const elementIds = getElementIds();

// New version
const wrapUI = (children, notifications) => {
  // Outter most section
  const sectionEl = document.createElement("section");
  sectionEl.className = "indykite-login-section";
  sectionEl.style.cssText = "width: 284px;margin: 0 auto;";

  // Container
  const containerEl = document.createElement("div");
  containerEl.className = "indykite-login-container";

  // Notification section
  const notificationContainer = document.createElement("div");
  notificationContainer.id = elementIds.notificationContainer;
  notificationContainer.className = elementIds.notificationContainer;
  notificationContainer.style.cssText =
    "height: auto; padding: 40px 20px 0px 20px;background-color: rgb(38, 38, 38); border-radius: 5px 5px 0 0;";
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
    "padding: 0px 26px 40px 26px;background-color: rgb(38, 38, 38); color: rgb(250, 250, 250); border-radius: 0 0 5px 5px;";
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
