<a href="https://indykite.com">
    <img src="logo.png" alt="IndyKite logo" title="IndyKite.ID" align="right" width="200"/>
</a>

# IndyKite Client UI SDK

IndyKite is a cloud identity platform built to secure and manage human & non-person (IoT) identities and their data. This repository containts the JavaScript Library packages for [IndyKite Platform](https://indykite.com/) Client SDK.

This library contains multiple client libraries for each service of the platform.

[![NPM version](https://img.shields.io/npm/v/@indykiteone/jarvis-sdk-web.svg?style=flat-square)](https://www.npmjs.com/package/@indykiteone/jarvis-sdk-web)
![npm type definitions](https://img.shields.io/npm/types/@indykiteone/jarvis-sdk-web?style=flat-square)
[![codecov](https://codecov.io/gh/indykite/jarvis-sdk-web/branch/master/graph/badge.svg?token=33M4Y8GYFV)](https://codecov.io/gh/indykite/jarvis-sdk-web)

In order to access to the platform you must obtain an API key first.

## Terminology

| Definition               | Description                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| Digital Twin             | A digital twin is the digital identity of a physical entity on/in a software/identity system     |
| Application Space ID     | ID of the application where the digital twin belongs to                                          |
| Application Agent ID     | ID of the agent which makes the application available for the different calls                    |
| Tenant ID                | ID of the tenant where the digital twin belongs to. The tenant is belong to an application space |
| Private Key and Settings | The secret which required to reach the system. Indykite provides the necessary secrets           |
| Property                 | The digital twin's property (eg.: email, name)                                                   |
| JWT                      | JSON Web Tokens                                                                                  |
| Introspect               | A process used to validate the token and to retrieve properties assigned to the token            |
| Patch property           | Add, change or delete a property of a digital twin                                               |

## Documentation

Visit the IndyKite One Developer Community site for official [IndyKite documentation](https://indykite.one/blog?category=5e3e9297-3451-4b52-91ee-8027dcd1789c) and to find out how to use the entire platform for your project.

## Installation

##### From [npm](https://www.npmjs.com/package/@indykiteone/jarvis-sdk-web):

```
npm install @indykiteone/jarvis-sdk-web
```

##### From CDN:

UNPKG

```javascript
<script src="https://unpkg.com/@indykiteone/jarvis-sdk-web/dist/iksdkweb.dist.js"></script>
```

jsDelivr

```javascript
<script src="https://cdn.jsdelivr.net/npm/@indykiteone/jarvis-sdk-web/dist/iksdkweb.dist.js"></script>
```

### Browser support

#### CDN .dist.js version

Is build with support for all recent versions of major browsers (Chrome, FF, Safari, Edge, Opera).

#### import version

`import { IKUIInit } from "@indykiteone/jarvis-sdk-web";` Is not prebuild. It's necessary for you to build your application using tools like webpack and babel.
If you are building apps with frameworks like React, Angular or Vue.js. You have most likely already setup
a build process (often automatically by the framework), and you don't need to do anything.

In case you need support for Internet Explorer (ES5) please let us know in issues, and we will provide
you with built sdk or build instructions.

## API

##### dist.js package

In case of using the dist package. All functions are exported under the `IK` keyword.
For example:

```html
<script src="https://unpkg.com/@indykiteone/jarvis-sdk-web/dist/iksdkweb.dist.js"></script>
<script>
 IK.IKUIInit({});
</script
```

## Getting Started

### Trial

For a trial please contact [IndyKite](https://www.indykite.com/contact-us) to setup and configure the platform.

### Init

To use the functions from the library you first need to initialize the lib.
This should be done in entry point to the app.

```javascript
import { IKUIInit } from "@indykiteone/jarvis-sdk-web";

IKUIInit({
  baseUri: process.env.REACT_APP_INDY_BASE_URI,
  applicationId: process.env.REACT_APP_INDY_CLIENT_ID,
  tenantId: process.env.REACT_APP_INDY_TENANT_ID,
});
```

### Core - UI API

To use UI elements provided by @indykiteone/jarvis-sdk-web library make sure you have done initializing of the library as described above.
All render functions do network setup calls. So they should be treated as side effects in the JS framework of your application.

##### Login form element:

On `<base_app_uri>/login` path or path of your liking do

```javascript
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const Login = () => {
  // React example, call only during the first render. Side effect!
  React.useEffect(() => {
    IKUICore.render({
      renderElementSelector: "#login-container",
      onSuccessLogin: (data) => {
        console.log(data.token);
        console.log(data.refresh_token);
        console.log(data.token_type); // For example "bearer"
        console.log(data.expiration_time); // Timestamp
        console.log(data.expires_in); // In x seconds
      },
      redirectUri: "/callback", // Optional - Needed only if you use OIDC (Google, FB etc) login buttons
      registrationPath: "/registration",
      forgotPasswordPath: "/forgot/password",
      labels: {
        username: "Custom Username",
        password: "Custom Password",
        loginButton: "Custom Login with us!",
        registerLinkButton: "Custom Register",
        forgotPasswordButton: "custom Forgot Password",
      }, // Optional custom labels for slight changes, lookup localization settings for full i18n/l10n
      // If you setup custom labels - they overwrite the localization settings
      // Optional - You can replace a default element with a custom one or you can only tweak the default element.
      onRenderComponent: (defaultElement, componentType, subcomponentType) => {
        if (componentType === "form" && subcomponentType === "password") {
          const el = document.createElement("div");
          ReactDOM.render(<MyOwnPasswordComponent />, el);
          return el;
        }
      },
    });
  }, []);

  return (
    <div>
      <div id="login-container" />
    </div>
  );
};
```

##### Registration form element:

On `<base_app_uri>/registration` path do

```javascript
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const Registration = () => {
  const htmlString = "<h5>By clicking Agree & Join you agree with our terms and conditions.</h5>";

  // React example, call only during the first render. Side effect!
  React.useEffect(() => {
    IKUICore.render({
      // Optional - You can specify your custom arguments and use them in the switch node in the authentication flow builder (on indykite.id site)
      arguments: {
        flow: "register",
      },
      renderElementSelector: "#register-container",
      termsAgreementSectionContent: htmlString,
      onSuccessRegistration: (data) => {
        console.log(data.token);
        console.log(data.refresh_token);
        console.log(data.token_type); // For example "bearer"
        console.log(data.expiration_time); // Timestamp
        console.log(data.expires_in); // In x seconds
      },
      redirectUri: "/callback", // Optional - needed only if you use OIDC (Google, FB etc) register buttons
      loginPath: "/login",
      labels: {
        username: "Custom Username",
        password: "Custom Password",
        confirmPassword: "Custom Confirm Password",
        registerButton: "Custom Join",
        alreadyHaveAnAccountButton: "Custom Already have an account",
        orOtherOptions: "Custom you can also continue with",
      }, // Optional custom labels for slight changes, lookup localization settings for full i18n/l10n
      // Optional - You can replace a default element with a custom one or you can only tweak the default element.
      onRenderComponent: (defaultElement, componentType, subcomponentType) => {
        if (componentType === "form" && subcomponentType === "password") {
          const el = document.createElement("div");
          ReactDOM.render(<MyOwnPasswordComponent />, el);
          return el;
        }
      },
    });
  }, []);

  return (
    <div>
      <div id="register-container" />
    </div>
  );
};
```

> In case you need to add a note under an input field you can use `userInputNote`, `passwordInputNote` or
> `passwordCheckInputNote` properties in order to display the particular message. Anyway, keep on mind that this
> is a temporary solution only and these three properties will be removed in the future!

##### Forgot password element:

On `<base_app_uri>/forgot/password` path or path of your liking (must be same as in param `forgotPasswordPath` in function `render`) do

```javascript
import { IKUICore } from "@indykiteone/jarvis-sdk-web";

const ForgotPassword = () => {
  // React example, call only during the first render. Side effect!
  React.useEffect(() => {
    IKUICore.renderForgotPasswordForm({
      renderElementSelector: "#forgotten-password-container",
      labels: {
        username: "Custom Email address",
        submitButton: "Custom Send password reset email",
        backToLogin: "Custom Go back to login",
      }, // Optional custom labels for slight changes, lookup localization settings for full i18n/l10n
    });
  }, []);

  return (
    <div>
      <div id="forgotten-password-container" />
    </div>
  );
};
```

##### Set new password element:

On `<base_app_uri>/set/new/password/:referenceId` path or path of your liking do

```javascript
import { IKUICore } from "@indykiteone/jarvis-sdk-web";
import { useParams } from "react-router-dom"; // Or any other way how to extract url parameters

const SetNewPassword = () => {
  const { referenceId } = useParams();

  // React example, call only during the first render. Side effect!
  React.useEffect(() => {
    IKUICore.renderSetNewPasswordForm({
      renderElementSelector: "#set-new-password-container",
      token: referenceId,
      // labels: {
      //     newPassword: "Custom Password",
      //     confirmNewPassword: "Custom Password confirm",
      //     submitButton: "Custom set new password"
      // } // Optional custom labels for slight changes, lookup localization settings for full i18n/l10n
    });
  }, []);

  return (
    <div>
      <div id="set-new-password-container" />
    </div>
  );
};
```

You should redirect your users to this path in the email templates.

### IKUIUserAPI

Functions from this object requires to be called after an Init function.
The SDK is handling the state of these functions, so you don't need to worry
about them.

#### Get Access Token `IKUIUserAPI.getValidAccessToken()`

You can use this function to always get an active access token for the user.

```javascript
import { IKUIUserAPI } from "@indykiteone/jarvis-sdk-web";

IKUIUserAPI.getValidAccessToken()
  .then((token) => {
    console.log("Access Token", token);
  })
  .catch((err) => {
    console.log("You should display logged out user", err);
  });
```

Optional refresh token can be passed to receive new valid access token `IKUIUserAPI.getValidAccessToken({ refreshToken })`.
This might be useful in case you store / received the refresh token outside of the SDK. In case the SDK already
has different refresh token stored. The new one (if valid) rewrites the old one.

```javascript
import { IKUIUserAPI } from "@indykiteone/jarvis-sdk-web";

IKUIUserAPI.getValidAccessToken({ refreshToken: refreshToken })
  .then((token) => {
    console.log("Access Token", token);
  })
  .catch((err) => {
    console.log("You should display logged out user", err);
  });
```

In case you have multiple users logged in you will need to specify which user's access token
you want to return. You can do it by specifying the user's ID.

```javascript
import { IKUIUserAPI } from "@indykiteone/jarvis-sdk-web";

IKUIUserAPI.getValidAccessToken({ userId: userId })
  .then((token) => {
    console.log("Access Token", token);
  })
  .catch((err) => {
    console.log("You should display logged out user", err);
  });
```

Anyway, if you call the `getValidAccessToken` function and the user is not logged in, it will throw an exception. If you only want to know whether the user is authenticated, you can use the `IKUIUserAPI.isAuthenticated()` function. In case you have multiple users you can specify the user by its ID in the first parameter.

```javascript
import { IKUIUserAPI } from "@indykiteone/jarvis-sdk-web";

IKUIUserAPI.isAuthenticated().then((authenticated) => {
  console.log(autheticated ? "Is autheticated" : "Is not authenticated");
});
```

#### Login flow

You can use this flow in case you don't want to use the `IKUICore.render()` and you want
to heavily modify and customize your login view. In case you are using the `render()`
you don't need to use this function.

There are 2 ways to achieve login

1. One-step login function
2. Two-step setup and login function - Recommended in case you want more control or using OIDC support.

#### 1. One Step Login `IKUIUserAPI.login("username", "Password")`

This function is suitable only if your authentication flow is simple and requires username and password only. Calling this function with valid username and password parameters returns a promise which is either resolved and returns access tokens or rejected and returns error info.

```javascript
import { IKUIUserAPI } from "@indykiteone/jarvis-sdk-web";

IKUIUserAPI.login("valid@username.com", "Validpassword")
  .then((data) => {
    if (data["@type"] === "success") {
      console.log(data["@type"]);
      console.log(data.token);
      console.log(data.refresh_token);
      console.log(data.token_type); // For example "bearer"
      console.log(data.expiration_time); // Timestamp
      console.log(data.expires_in); // In x seconds
    } else if (data["@type"] === "oidc") {
      IKUIOidc.oidcSetup(data);
    }
  })
  .catch((err) => {
    console.log(err["@type"]);
    console.log(err["~error"].code);
    console.log(err["~error"].msg);
  });
```

#### 2. Two Step Login (Setup & Login)

This flow consist of calling `IKUIUserAPI.loginSetup()` which returns also UI config response from the server.
It also checks for any redirects in case of flow with OIDC and in case the user is already logs in - automatically
does redirect to the requested url. You can explore this response in case you would like to also configure your UI based on the response.
The Response from the login is than used in login function `IKUIUserAPI.login("username", "Passwd", responseFromSetup)`

```javascript
import { IKUIUserAPI } from "@indykiteone/jarvis-sdk-web";

const responseConfig = await IKUIUserAPI.loginSetup();
// In case of ODIC flow, when the user is already logged in, automatic
// redirection is triggered now.

const data = await IKUIUserAPI.login("userName", "Password", responseConfig);

console.log(data["@type"]);
if (data["@type"] === "success") {
  console.log(data.token);
  console.log(data.refresh_token);
  console.log(data.token_type); // For example "bearer"
  console.log(data.expiration_time); // Timestamp
  console.log(data.expires_in); // In x seconds
} else if (data["@type"] === "oidc") {
  IKUIOidc.oidcSetup(data);
}
```

> If a user was invited to your system and he has a reference ID from his invitation email, you should pass the reference ID to
> the loginSetup function (`IKUIUserAPI.loginSetup({ otpToken: "referenceID" })`) so that the application is able to connect
> the logged in user with the invited one.

#### Register `IKUIUserAPI.register("username", "Passwd")`

This function is suitable only if your authentication flow is simple and requires username and password only (theoretically the flow might require you to use an OIDC provider in the next step). Calling this function with valid username and password parameters returns a promise which is either resolved and returns access tokens or rejected and returns error info.

```javascript
import { IKUIUserAPI } from "@indykiteone/jarvis-sdk-web";

IKUIUserAPI.register("valid@username.com", "Validpassword")
  .then((data) => {
    console.log(data["@type"]);
    console.log(data.token);
    console.log(data.refresh_token);
    console.log(data.token_type); // For example "bearer"
    console.log(data.expiration_time); // Timestamp
    console.log(data.expires_in); // In x seconds
  })
  .catch((err) => {
    console.log(err["@type"]);
    console.log(err["~error"].code);
    console.log(err["~error"].msg);
  });
```

#### Register Setup `IKUIUserAPI.registerSetup()`

This is an optional function which returns you the setup object where you can find the configured register options.
It's useful when you want to dynamically show the register options buttons, for example the OIDC providers
(Google, Facebook...), however it's NOT necessary to be called / used for any other reason.

```javascript
//... React example
useEffect(() => {
  (async () => {
    const response = await IKUIUserAPI.registerSetup();
    // Error handling should be in place
    setRegisterOpts(response.opts);
  })();
}, []);

//...

return (
  <div>
    {registerOpts
      ?.filter((opt) => opt["@type"] === "oidc")
      .map((opt) => (
        <React.Fragment key={opt["@id"]}>
          <br />
          <button
            id={`custom-btn-oidc-${opt.prv}`}
            onClick={() =>
              IKUIOidc.oidcSetup({
                id: opt["@id"],
                redirectUri: "/redirectUri",
              })
            }>
            {opt.prv}
          </button>
        </React.Fragment>
      ))}
  </div>
);
```

> If a user was invited to your system and he has a reference ID from his invitation email, you should pass the reference ID to
> the registerSetup function (`IKUIUserAPI.registerSetup({ otpToken: "referenceID" })`) so that the application is able to connect
> the registered user with the invited one.

#### ~~Logout the user `IKUIUserAPI.logoutCurrentUser()`~~

Deprecated. You should use `IKUIUserAPI.logoutUser()` instead.

#### Logout the user `IKUIUserAPI.logoutUser()`

In case this function fails it will clear the localstorage regardless. However the token
on the server will not be invalidated. So it's important that this function works but
you can treat the user are logged out regardless of the output.

```javascript
import { IKUIUserAPI } from "@indykiteone/jarvis-sdk-web";

IKUIUserAPI.logoutUser()
  .then((result) => {
    console.log("user logged out", result);
  })
  .catch((err) => {
    console.log("user not logged out", err);
  });
```

If you have multiple users logged in you can specify which user you want to log out.
Without specifying the user's ID you will log out the last logged in user.

```javascript
import { IKUIUserAPI } from "@indykiteone/jarvis-sdk-web";

IKUIUserAPI.logoutUser("user-id")
  .then((result) => {
    console.log("user logged out", result);
  })
  .catch((err) => {
    console.log("user not logged out", err);
  });
```

Moreover, if you have multiple users logged in you can log out all logged in users with one call.

```javascript
import { IKUIUserAPI } from "@indykiteone/jarvis-sdk-web";

IKUIUserAPI.logoutAllUsers()
  .then((result) => {
    console.log("user logged out", result);
  })
  .catch((err) => {
    console.log("user not logged out", err);
  });
```

#### Send reset password email `IKUIUserAPI.sendResetPasswordEmail("Valid@mailaddress.com")`

Call this function with valid user email address. He should receive email with link to reset his password.

```javascript
import { IKUIUserAPI } from "@indykiteone/jarvis-sdk-web";
IKUIUserAPI.sendResetPasswordEmail("Valid@mailaddress.com")
  .then((data) => {
    console.log(data["@type"]); // "success"
  })
  .catch((err) => {
    console.log(err["@type"]);
    console.log(err["~error"].code);
    console.log(err["~error"].msg);
  });
```

#### Send new password `IKUIUserAPI.sendNewPassword("token from link received by mail", "MyNewPassword")`

Call this function with reference id token which you receive to email on send reset password email (above) and with new valid password value.
The SDK stores the new access tokens on sucessfull password reset and you can get the access token with IKUIUserAPI.getValidAccessToken() or handle it from the resolved promise.

```javascript
import { IKUIUserAPI } from "@indykiteone/jarvis-sdk-web";
IKUIUserAPI.sendNewPassword("token from link received by mail", "MyNewPassword")
  .then((data) => {
    console.log(data["@type"]); // "success" | "fail"
    console.log(data.token);
    console.log(data.refresh_token);
    console.log(data.token_type); // for example "bearer"
    console.log(data.expiration_time); // timestamp
    console.log(data.expires_in); // in x seconds
    // SDK stores the token on success
  })
  .catch((err) => {
    console.log(err["@type"]);
    console.log(err["~error"].code);
    console.log(err["~error"].msg);
  });
```

## IKUIOidc - OIDC Support

If you want your application to be able to login with other identity providers
follow the flow described below:

1. Init library (described above)
2. Create /login route and Login component using our exposed function or our built-in UI (render UI functions) to your app (described above)
3. Create /registration route and Registration component using our exposed function or our built-in UI (render UI functions) to your app (described above)
4. Have a /callback route calling `IKUIOidc.oidcCallback()`

### Handle oidc callback `IKUIOidc.oidcCallback()`

Have this function called on a route to which you are redirected after successful login with e.g Facebook or Google.
`IKUIOidc.oidcCallback()` can then gets query string params given by the identity provider, and those are sent to
server. After that SDK sends verifier and receives token which is stored in the SDK and returned by the function. Anyway,
you might be requested to be redirected to a different URL. In that case `data.redirect_to` property will be defined and you
should redirect your page to the specified URL.

```javascript
import React from "react";
import { IKUIOidc } from "@indykiteone/jarvis-sdk-web";

const Callback = () => {
  React.useEffect(() => {
    IKUIOidc.oidcCallback()
      .then((data) => {
        if (data.redirect_to) {
          window.location.href = data.redirect_to;
          return;
        }
        console.log(data.token);
        console.log(data.refresh_token);
        console.log(data.token_type); // For example "bearer"
        console.log(data.expiration_time); // Timestamp
        console.log(data.expires_in); // In x seconds

        // You are logged in, and can redirect to auth routes
      })
      .catch(console.log);
  }, []);
  return <h3>general callback</h3>;
};
```

If you want your application to be a login application where users are redirected from third party application
follow the flow described below:

1. Init library (described above)
2. Create /login route and Login component using our exposed function or our built-in UI (render UI functions) to your app (described above)
3. Create /registration route and Registration component using our exposed function or our built-in UI (render UI functions) to your app (described above)
4. Have a /login/oauth2 route calling `IKUIOidc.handleOidcOriginalParamsAndRedirect()`

> The access tokens don't need to be returned immediately if your authentication flow contains a linking flow. See the "Linking flow" section for more details.

### Handle oidc original parameters and redirect `IKUIOidc.handleOidcOriginalParamsAndRedirect()`

Call this function on a route of your login application where users are redirected after clicking Login with NAME OF
YOUR SERVICE. Calling this function expects the url to contain query parameters relevant to OAuth2 protocol. Those
query parameters are stored in SDK and user is redirected to /login route.

```javascript
import React from "react";
import { IKUIOidc } from "@indykiteone/jarvis-sdk-web";

const Oidc = () => {
  React.useEffect(() => {
    IKUIOidc.handleOidcOriginalParamsAndRedirect();
  }, []);

  return <h3>oidc</h3>;
};
```

### Oidc setup `IKUIOidc.oidcSetup()`

If your login flow has type of `logical` and your `IKUIUserAPI.loginSetup()` response includes opts of type `oidc`, you will need to pass the option id to this function along with `redirectUri` address. If your flow has the `oidc` type and the response has no id, you can use `null` as the id in this function.
Please see example of React component using this function below.

```javascript
import React from "react";
import { IKUIOidc } from "@indykiteone/jarvis-sdk-web";

const Login = () => {
  const [setupResponseData, setSetupResponseData] = React.useState(null);
  const [type, setType] = React.useState(null);

  React.useEffect(() => {
    const setup = async () => {
      const loginSetupResponse = await IKUIUserAPI.loginSetup();
      setSetupResponseData(loginSetupResponse);

      if (loginSetupResponse && loginSetupResponse["@type"]) setType(loginSetupResponse["@type"]);
    };

    setup().catch(console.log);
  }, []);

  return (
    <div>
      {type === "logical" &&
        setupResponseData.opts
          .filter((opt) => opt.prv)
          .map((opt) => (
            <React.Fragment key={opt["@id"]}>
              <br />
              <button
                onClick={() =>
                  IKUIOidc.oidcSetup({
                    id: opt["@id"],
                    redirectUri: "/redirectUri",
                  })
                }>
                {opt.prv}
              </button>
            </React.Fragment>
          ))}
    </div>
  );
};
```

### Single OIDC setup `IKUIOidc.singleOidcSetup(loginSetupResponseData)`

This function is only relevant to you if you are receiving response of type "oidc" from `IKUIUserAPI.loginSetup()`. If that is the case, call this function with the response as an argument and SDK will redirect you to your
identity provider with required parameters. Please see example of React component using this function below.

```javascript
import React from "react";
import { IKUIOidc } from "@indykiteone/jarvis-sdk-web";

const Login = () => {
  const [setupResponseData, setSetupResponseData] = React.useState(null);
  const [type, setType] = React.useState(null);

  React.useEffect(() => {
    const setup = async () => {
      const loginSetupResponse = await IKUIUserAPI.loginSetup();
      setSetupResponseData(loginSetupResponse);

      if (loginSetupResponse && loginSetupResponse["@type"]) setType(loginSetupResponse["@type"]);
    };

    setup().catch(console.log);
  }, []);

  return (
    <div>
      {type === "oidc" && (
        <>
          <br />
          <br />
          <button onClick={() => IKUIOidc.singleOidcSetup(setupResponseData)}>
            {setupResponseData.prv}
          </button>
        </>
      )}
    </div>
  );
};
```

## Linking flow

The authentication flow may be configured in a way that it will require you to firstly login with a username and a password and after that you will need to login with an google account as well. This is called "linking flow". In case you're using `IKUICore.renderLogin` or `IKUICore.renderRegister` function, you don't need to think about this and the SDK will handle the screens for you automatically. Anyway, if you are using `IKUIUserAPI.loginSetup`, `IKUIUserAPI.registerSetup` or `IKUIOidc.oidcSetup` function and you render screens on your own, you will need to keep on mind that the first response message after the login doesn't need to be the `verifier` type. The message type may also be `logical`, `oidc` or `form` (in the future there might be also different types). In this case you will need to combine `IKUIUserAPI.loginSetup`, `IKUIUserAPI.registerSetup` and `IKUIOidc.oidcSetup` functions to continue through the flow.

```javascript
const login = async () => {
  const response = await IKUIUserAPI.login(email, password);
  if (response["@type"] === "success") {
    processTokens(response);
  } else if (response["@type"] === "oidc") {
    IKUIOidc.oidcSetup({
      redirectUri: "http://localhost:3000/callback",
    });
  }
};
```

## Internationalization and Localization support

Localization supports

- All the UI messages
- All the error messages

To enable localization, import it from `@indykiteone/jarvis-sdk-web/lib/services/core/locale/<ChosenLocale>`
and pass it into the init function as `localeConfig`.

Example:

```javascript
import { csCZLocale } from "@indykiteone/jarvis-sdk-web/lib/services/core/locale/cs-CZ";

IKUIInit({
  baseUri: process.env.REACT_APP_BASE_URI,
  applicationId: process.env.REACT_APP_APPLICATION_ID,
  tenantId: process.env.REACT_APP_TENANT_ID,
  localeConfig: csCZLocale,
});
```

See folder `@indykiteone/jarvis-sdk-web/lib/services/core/locale/` for the available locales.

### Create your own locale

In case your language is not yet supported, you can create your own locale object and translations.
In case you would not include the translation for all messages (for example errors), fallback to English
is used.

Example locale object:

```javascript
const ourLocale = {
  locale: "en-US", // String with BCP 47 language tag
  messages: {
    "uisdk.general.password": "Password",
    "uisdk.general.email": "Email Address",
    "uisdk.general.error": "Oops something went wrong. Please try again.",
  },
};
```

See the file `lib/services/core/locale/src/en.json` for list of all keys.

## TypeScript

The library has build in types and is compatible with typescript projects.

## SDK Development

Look into using `npm link` in case you want to develop the lib with the app  
https://medium.com/dailyjs/how-to-use-npm-link-7375b6219557

In case you update the response don't forget to update CommonJS docs and also
any typescript definitions.

Commit message follows [commit guidelines](./doc/guides/commit-message.md#commit-message-guidelines)

Install husky pre-commit hooks
`npm install & npm run prepare`

### Localisation development

All the messages and keys are stored in the localise.com app under project Indykite
https://app.lokalise.com/project/5428220160b483af770945.85338584/

All the keys for only UI SDK should have tag `uisdk`.

To export new localisation keys and error messages. Go to download page
https://app.lokalise.com/download/5428220160b483af770945.85338584/

Download settings are as follows:

```
Format: JSON
- Include all platform keys YES

Plural format: ICU
Placeholder format: ICU
```

Click on build and download. Put the final JSONs into folder `lib/services/core/locale/src`
See file `.github/export-settings.png` for the export settings from localise.

## Roadmap

Checkout our roadmap on our [issues page](https://github.com/indykite/jarvis-sdk-web/issues)

## Contributing

[Contribution guidelines for this project](contributing.md)

## Support, Feedback, Connect with other developers

We'd love to have you connect with us or other community developers over at [IndyKite.one](https://indykite.one)

Feel free to file a bug, submit an issue or give us feedback on our [issues page](https://github.com/indykite/jarvis-sdk-web/issues)

## Vulnerability Reporting

[Responsible Disclosure](https://www.indykite.com/security)

## Changelog

Coming Soon!

## Contributers / Acknowledgements

Coming Soon!

## What is IndyKite

IndyKite is a cloud identity platform built to secure and manage human & non-person (IoT) identities and their data. Based on open source standards, the cloud platform gives developers the ability to secure data and embed identity controls into their Web 3.0 applications. Empowering the world’s 23 million developers without the need to involve security and identity specialists.

## License

[This project is licensed under the terms of the Apache 2.0 license.](LICENSE)
