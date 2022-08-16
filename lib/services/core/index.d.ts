/// <reference types="./locale/locale" />

export function IKUIInit(config: {
  tenantId?: string;
  applicationId?: string;
  baseUri?: string;
  localeConfig?: LocaleConfigType | null;
}): void;

type onRenderComponent =
  | ((
      defaultComponent: HTMLElement,
      componentType: "action",
      actionType: "forgotten" | "register" | "alreadyRegistered",
      label: string,
      link: string,
    ) => HTMLElement | undefined)
  | ((
      defaultComponent: HTMLElement,
      componentType: "form",
      formComponentType: string, // something like "username", "email", "password", "passwordCheck", ...
      label: string,
      context: any,
    ) => HTMLElement | undefined)
  | ((
      defaultComponent: HTMLElement,
      componentType: "form",
      formComponentType: "submit",
      handleClick: () => Promise<void>,
      label: string,
    ) => HTMLElement | undefined)
  | ((
      defaultComponent: HTMLElement,
      componentType: "form",
      formComponentType: "termsAndAgreement",
      htmlString: string,
    ) => HTMLElement | undefined)
  | ((
      defaultComponent: HTMLElement,
      componentType: "oidcButton",
      provider: string,
      handleClick: () => Promise<void>,
      id: string,
      url: string,
    ) => HTMLElement | undefined)
  | ((
      defaultComponent: HTMLElement,
      componentType: "message",
      context: {
        msg?: string;
        label?: string;
        style: string;
        id?: string;
        extensions?: string;
        ui: string;
      },
    ) => HTMLElement | undefined)
  | ((defaultComponent: HTMLElement, componentType: "separator") => HTMLElement | undefined);

type DataTokenResponseType = {
  "@type": string;
  token: string;
  refresh_token: string;
  token_type: string;
  expiration_time: number;
  expires_in: number;
  redirect_to?: string;
};

type renderLogin = (props: {
  renderElementSelector: string;
  onLoginFail?: (error: Error) => void;
  onRenderComponent?: onRenderComponent;
  onSuccessLogin: (arg0: DataTokenResponseType) => void;
  redirectUri?: string;
  registrationPath?: string;
  forgotPasswordPath?: string;
  labels?: {
    username?: string;
    password?: string;
    loginButton?: string;
    registerButton?: string;
    forgotPasswordButton?: string;
  };
  loginApp?: {
    [optionId: string]: string;
  };
}) => void;

type renderRegister = (props: {
  renderElementSelector: string;
  onRegistrationFail?: (error: Error) => void;
  onRenderComponent?: onRenderComponent;
  onSuccessRegistration: (arg0: DataTokenResponseType) => void;
  redirectUri?: string;
  termsAgreementSectionContent?: string;
  validatePassword?: (arg0: string) => boolean;
  labels?: {
    username?: string;
    password?: string;
    confirmPassword?: string;
    registerButton?: string;
    alreadyHaveAnAccountButton?: string;
  };
  loginApp?: {
    [optionId: string]: string;
  };
  /**
   * This is a temporary configuration only. Keep in mind that this property will be removed in the future.
   * @deprecated
   */
  userInputNote?: string;
  /**
   * This is a temporary configuration only. Keep in mind that this property will be removed in the future.
   * @deprecated
   */
  passwordInputNote?: string;
  /**
   * This is a temporary configuration only. Keep in mind that this property will be removed in the future.
   * @deprecated
   */
  passwordCheckInputNote?: string;
}) => void;

type render = (props: {
  arguments?: Record<string, string>;
  renderElementSelector: string;
  onFail?: (error: Error) => void;
  onRenderComponent?: onRenderComponent;
  onSuccess: (arg0: DataTokenResponseType) => void;
  redirectUri?: string;
  loginPath?: string;
  registrationPath?: string;
  forgotPasswordPath?: string;
  labels?: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    registerButton?: string;
    registerLinkButton?: string;
    alreadyHaveAnAccountButton?: string;
    loginButton?: string;
    forgotPasswordButton?: string;
    forgottenPasswordSubmitButton?: string;
  };
  loginApp?: {
    [optionId: string]: string;
  };
  otpToken?: string;
  termsAgreementSectionContent?: string;
  validatePassword?: (arg0: string) => boolean;
  /**
   * This is a temporary configuration only. Keep in mind that this property will be removed in the future.
   * @deprecated
   */
  userInputNote?: string;
  /**
   * This is a temporary configuration only. Keep in mind that this property will be removed in the future.
   * @deprecated
   */
  passwordInputNote?: string;
  /**
   * This is a temporary configuration only. Keep in mind that this property will be removed in the future.
   * @deprecated
   */
  passwordCheckInputNote?: string;
}) => void;

type renderForm = (props: {
  arguments?: Record<string, string>;
  renderElementSelector: string;
  onFail?: (error: Error) => void;
  onRenderComponent?: onRenderComponent;
  onSuccess: (arg0: DataTokenResponseType) => void;
  redirectUri?: string;
  labels?: {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    registerButton?: string;
    registerLinkButton?: string;
    alreadyHaveAnAccountButton?: string;
    loginButton?: string;
    forgotPasswordButton?: string;
    forgottenPasswordSubmitButton?: string;
    newPassword?: string;
    confirmNewPassword?: string;
    setNewPasswordButton?: string;
  };
  loginApp?: {
    [optionId: string]: string;
  };
  otpToken?: string;
  termsAgreementSectionContent?: string;
}) => void;

type renderForgotPasswordForm = (props: {
  renderElementSelector: string;
  loginPath?: string;
  labels?: {
    username?: string;
    submitButton?: string;
    backToLogin?: string;
  };
}) => void;

type renderSetNewPasswordForm = (props: {
  token: string;
  renderElementSelector: string;
  validatePassword?: (arg0: string) => boolean;
  labels?: {
    newPassword?: string;
    confirmNewPassword?: string;
    submitButton?: string;
  };
}) => void;

interface IKUICore {
  /**
   * @deprecated Use `renderForm` function instead.
   */
  renderLogin: renderLogin;
  /**
   * @deprecated Use `renderForm` function instead.
   */
  renderRegister: renderRegister;
  /**
   * @deprecated Use `renderForm` function instead.
   */
  render: render;
  renderForm: renderForm;
  /**
   * @deprecated Use `renderForm` function instead.
   */
  renderForgotPasswordForm: renderForgotPasswordForm;
  /**
   * @deprecated Use `renderForm` function instead.
   */
  renderSetNewPasswordForm: renderSetNewPasswordForm;
}

export const IKUICore: IKUICore;

type ErrorObjectType = {
  code: string;
  label?: string;
  msg: string;
  extensions: Record<string, string | number>;
};

export type ErrorResponseType = {
  type: string;
  "~error": ErrorObjectType;
};

export type SetupOptsType = {
  "~ord": number;
  "@type": string;
  "@id": string;
  prv?: string;
  fields?: Array<Record<string, any>>;
  opts?: Array<Record<string, any>>;
};

export type LoginSetupDataType = {
  "@type": string;
  op?: string;
  prv?: string;
  url?: string;
  opts?: Array<SetupOptsType>;
  "~thread": {
    thid: string;
  };
};

type logoutCurrentUser = () => Promise<boolean>;
type logoutUser = (userId?: string) => Promise<boolean>;
type logoutAllUsers = () => Promise<{ [userId: string]: boolean }>;
type login = (
  email: string,
  password: string,
  setupData: LoginSetupDataType,
) => Promise<DataTokenResponseType | Error>;
type isAuthenticated = (userId?: string) => Promise<boolean>;
type getValidAccessToken = (options?: {
  refreshToken?: string;
  userId?: string;
}) => Promise<string>;
type refreshAccessToken = (
  refreshToken?: string,
  codeChallenge?: string,
  omitAuthorizationHeaders?: boolean,
) => Promise<string>;
type register = (email: string, password: string) => Promise<DataTokenResponseType>;
type sendResetPasswordEmail = (email: string) => Promise<{ "@type": string }>;
type sendNewPassword = (
  referenceId: string,
  newPassword: string,
) => Promise<DataTokenResponseType>;

type setupRequestConfig = {
  otpToken?: string;
};
type loginSetup = (config?: setupRequestConfig) => Promise<LoginSetupDataType>;
type registerSetup = (config?: setupRequestConfig) => Promise<LoginSetupDataType>;

interface IKUIUserAPI {
  isAuthenticated: isAuthenticated;
  logoutAllUsers: logoutAllUsers;
  /**
    @deprecated
  */
  logoutCurrentUser: logoutCurrentUser;
  logoutUser: logoutUser;
  login: login;
  getValidAccessToken: getValidAccessToken;
  register: register;
  sendResetPasswordEmail: sendResetPasswordEmail;
  sendNewPassword: sendNewPassword;
  loginSetup: loginSetup;
  registerSetup: registerSetup;
  refreshAccessToken: refreshAccessToken;
}

export const IKUIUserAPI: IKUIUserAPI;

interface oidcSetup {
  (options?: { id?: string; redirectUri?: string; threadId?: string; loginApp?: string }): void;

  /**
   * @deprecated Move all the parameters to an options object.
   */
  (id?: string | null, redirectUri?: string | null, threadId?: string | null): void;
}

type singleOidcSetupInput = {
  "~thread": {
    thid: string;
  };
  url: string;
};

type singleOidcSetup = (singleOidcSetupInput) => void;
type oidcCallback = () => Promise<DataTokenResponseType>;
type handleOidcOriginalParamsAndRedirect = () => void;
type initOidcAuthorizationRequest = (
  oauth2Host: string,
  queryParams: Record<string, string>,
) => void;
type handleOauth2Callback = () => void;

interface IKUIOidc {
  oidcSetup: oidcSetup;
  singleOidcSetup: singleOidcSetup;
  oidcCallback: oidcCallback;
  handleOidcOriginalParamsAndRedirect: handleOidcOriginalParamsAndRedirect;
  initOidcAuthorizationRequest: initOidcAuthorizationRequest;
  handleOauth2Callback: handleOauth2Callback;
}

export const IKUIOidc: IKUIOidc;
