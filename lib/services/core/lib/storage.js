const oidcOrgnlParamsPath = "IKUISDK/oidcOrgnlParams";
const oidcSetupResponsePath = "IKUISDK/oidcSetupResponse";

// Code challenge and code verifier
const cvPath = "IDKUISDK/cv";
const ccPath = "IDKUISDK/cc";

// Session storage
const threadIdPath = "@indykite/thid";
const forgottenPasswordThreadIdPath = "@indykite/forgot-password-thid";
const pendingResponsePath = "@indykite/pendingRequest";
const responseList = "@indykite/response-list";
const authFlowStartPointPath = "@indykite/authFlowStartPoint";

// IndexedDB
const DATABASE_NAME = "indykite";
const TOKENS_TABLE_NAME = "tokens";
const OPTIONS_TABLE_NAME = "options";
const DEFAULT_USER_OPTION_NAME = "defaultUser";

/**
 * @returns {Promise<IDBDatabase>}
 */
const getDatabase = async () => {
  return new Promise((resolve, reject) => {
    const db = window.indexedDB.open(DATABASE_NAME);
    db.onsuccess = () => {
      resolve(db.result);
    };
    db.onerror = (event) => {
      reject(event.target.error);
    };
    // when the database doesn't exist yet, it needs to be initialized
    db.onupgradeneeded = (event) => {
      const upgradedDb = event.currentTarget.result;
      upgradedDb.createObjectStore("tokens", { keyPath: "userId" });
      upgradedDb.createObjectStore("options", { keyPath: "name" });
    };
  });
};

/**
 * Get a list of all keys created in the table.
 * @param {IDBDatabase} database The database instance.
 * @param {string} tableName The table you want to get the keys from.
 * @returns {Promise<IDBValidKey[]>}
 */
const getTableKeys = async (database, tableName) => {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(tableName);
    transaction.onerror = (event) => {
      reject(event.target.error);
    };
    const objectStore = transaction.objectStore(tableName);
    const getKeysRequest = objectStore.getAllKeys();
    getKeysRequest.onsuccess = () => {
      resolve(getKeysRequest.result);
    };
    getKeysRequest.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

/**
 * Get a value from the database.
 * @param {IDBDatabase} database The database instance.
 * @param {string} tableName The table you want to get the value from.
 * @param {string} key The key assigned to the value in the table.
 * @returns {Promise<*>}
 */
const getTableValue = async (database, tableName, key) => {
  return new Promise((resolve, reject) => {
    if (!key) {
      resolve();
      return;
    }

    const transaction = database.transaction(tableName);
    transaction.onerror = (event) => {
      reject(event.target.error);
    };
    const objectStore = transaction.objectStore(tableName);
    const getRequest = objectStore.get(key);
    getRequest.onsuccess = () => {
      resolve(getRequest.result);
    };
    getRequest.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

/**
 * Set a new value into the database.
 * @param {IDBDatabase} database The database instance.
 * @param {string} tableName The table you want to save the value into.
 * @param {object} value The value (it needs to contain the particular key property - e.g. `userId`).
 * @returns {Promise<void>}
 */
const setTableValue = async (database, tableName, value) => {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(tableName, "readwrite");
    transaction.onerror = (event) => {
      reject(event.target.error);
    };
    const objectStore = transaction.objectStore(tableName);
    const putRequest = objectStore.put(value);
    putRequest.onsuccess = () => {
      resolve();
    };
    putRequest.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

/**
 * Remove a value from the database.
 * @param {IDBDatabase} database The database instance.
 * @param {string} tableName The table you want to remove a value from.
 * @param {string} key The key assigned to the value in the table.
 * @returns {Promise<void>}
 */
const removeTableValue = async (database, tableName, key) => {
  return new Promise((resolve, reject) => {
    if (!key) {
      resolve();
      return;
    }

    const transaction = database.transaction(tableName, "readwrite");
    transaction.onerror = (event) => {
      reject(event.target.error);
    };
    const objectStore = transaction.objectStore(tableName);
    const deleteRequest = objectStore.delete(key);
    deleteRequest.onsuccess = () => {
      resolve();
    };
    deleteRequest.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

/**
 * Get the saved option in the database.
 * @param {IDBDatabase} database The database instance.
 * @param {string} optionName The option name.
 * @returns {Promise<string>} The option value.
 */
const getOptionTableValue = async (database, optionName) => {
  const option = await getTableValue(database, OPTIONS_TABLE_NAME, optionName);
  return option && option.value;
};

/**
 * Save the CV into the storage
 * @param codeVerifier {string}
 */
const setCv = (codeVerifier) => {
  localStorage.setItem(cvPath, codeVerifier);
};

/**
 * Return the CV from the storage
 * @returns {(string | null)}
 */
const getCv = () => {
  return localStorage.getItem(cvPath);
};

/**
 * Save the auth flow start point URL into the storage
 * @param path {string}
 */
const setAuthFlowStartPoint = (path) => {
  sessionStorage.setItem(authFlowStartPointPath, path);
};

/**
 * Return the auth flow start point URL from the storage
 * @returns {(string | null)}
 */
const getAuthFlowStartPoint = () => {
  return sessionStorage.getItem(authFlowStartPointPath);
};

/**
 * Save an object which should be considered as a response to the initial request
 * @param path {string}
 */
const setPendingResponse = (response) => {
  if (!response) {
    sessionStorage.removeItem(pendingResponsePath);
    return;
  }
  sessionStorage.setItem(pendingResponsePath, JSON.stringify(response));
};

/**
 * Get an object which should be considered as a response to the initial request
 * @returns {(string | null)}
 */
const getPendingResponse = () => {
  return JSON.parse(sessionStorage.getItem(pendingResponsePath));
};

/**
 * @param {string} userId
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {number} expirationTime
 * @returns {Promise<void>}
 */
const setTokens = async (userId, accessToken, refreshToken, expirationTime) => {
  try {
    const database = await getDatabase();
    await setTableValue(database, TOKENS_TABLE_NAME, {
      accessToken,
      refreshToken,
      expirationTime,
      userId,
    });
  } catch (err) {
    console.error(err);
  }
};

/**
 * @param {string|undefined} userId
 * @returns {Promise<{
 *   accessToken: string;
 *   expirationTime: number;
 *   refreshToken: string;
 *   userId: string;
 * }>}
 */
const getTokens = async (userId) => {
  let userIdOrDefaultUserId = userId;
  try {
    const database = await getDatabase();
    if (!userId) {
      userIdOrDefaultUserId = await getOptionTableValue(database, DEFAULT_USER_OPTION_NAME);
    }

    const userValues = await getTableValue(database, TOKENS_TABLE_NAME, userIdOrDefaultUserId);
    if (!userValues) {
      return {};
    }

    return {
      accessToken: userValues.accessToken,
      expirationTime: userValues.expirationTime,
      refreshToken: userValues.refreshToken,
      userId: userValues.userId,
    };
  } catch (err) {
    console.error(err);
    return {};
  }
};

/**
 * @returns {Promise<{
 *   [userId: string]: {
 *     accessToken: string;
 *     expirationTime: number;
 *     refreshToken: string;
 *     userId: string;
 *   }
 * }>}
 */
const getAllUserTokens = async () => {
  try {
    const database = await getDatabase();
    const userIds = await getTableKeys(database, TOKENS_TABLE_NAME);
    const tokensObject = {};
    for (let i = 0; i < userIds.length; ++i) {
      tokensObject[userIds[i]] = await getTableValue(database, TOKENS_TABLE_NAME, userIds[i]);
    }
    return tokensObject;
  } catch (err) {
    console.error(err);
  }
};

/**
 * @param {string | undefined} userId The ID of a user you want to remove tokens of. If this parameter
 * is omitted then the ID of default user is used.
 * @returns {Promise<void>}
 */
const removeUserTokens = async (userId) => {
  const database = await getDatabase();
  const defaultUserOption = await getTableValue(
    database,
    OPTIONS_TABLE_NAME,
    DEFAULT_USER_OPTION_NAME,
  );
  const defaultUserId = defaultUserOption && defaultUserOption.value;
  const userIdOrDefaultUserId = userId || defaultUserId;
  await removeTableValue(database, TOKENS_TABLE_NAME, userIdOrDefaultUserId);
  if (defaultUserId && userIdOrDefaultUserId === defaultUserId) {
    await removeDefaultUser();
  }
};

/**
 * @param {string} userId
 * @returns {Promise<void>}
 */
const setDefaultUser = async (userId) => {
  try {
    const database = await getDatabase();
    await setTableValue(database, OPTIONS_TABLE_NAME, {
      name: DEFAULT_USER_OPTION_NAME,
      value: userId,
    });
  } catch (err) {
    console.error(err);
  }
};

/**
 * @returns {Promise<void>}
 */
const removeDefaultUser = async () => {
  try {
    const database = await getDatabase();
    await removeTableValue(database, OPTIONS_TABLE_NAME, DEFAULT_USER_OPTION_NAME);
  } catch (err) {
    console.error(err);
  }
};

/**
 * Returns refresh token
 * @param {string | undefined} userId If specified, return the refresh token of the specified user. Otherwise
 * the refresh token of the last logged user will be returned.
 * @returns {Promise<string | null>}
 */
const getRefreshToken = async (userId) => {
  const { refreshToken } = await getTokens(userId);
  return refreshToken;
};

const setOidcOriginalParams = (params) => {
  localStorage.setItem(oidcOrgnlParamsPath, JSON.stringify(params));
};

const getOidcOriginalParams = () => {
  const params = localStorage.getItem(oidcOrgnlParamsPath);
  return params ? JSON.parse(params) : params;
};

const setOidcSetupResponse = (data) => {
  localStorage.setItem(oidcSetupResponsePath, JSON.stringify(data));
};

const getOidcSetupResponse = () => {
  const params = localStorage.getItem(oidcSetupResponsePath);
  return params ? JSON.parse(params) : params;
};

/**
 * Uses Session storage
 * @param threadId
 */
const setThreadId = (threadId) => sessionStorage.setItem(threadIdPath, threadId);
const getThreadId = () => sessionStorage.getItem(threadIdPath);

/**
 * Uses Session Storage
 * @param threadId
 */
const setFPThreadId = (threadId) =>
  sessionStorage.setItem(forgottenPasswordThreadIdPath, threadId);
const getFPThreadId = () => sessionStorage.getItem(forgottenPasswordThreadIdPath);

const clearOidcData = () => {
  setOidcOriginalParams(null);
  setOidcSetupResponse(null);
};

/**
 * Stores token, refresh token and
 */
const storeOnLoginSuccess = async (data) => {
  if (data["@type"] === "success") {
    await setTokens(data.sub, data.token, data.refresh_token, data.expiration_time);
    await setDefaultUser(data.sub);
    clearOidcData();
  } else {
    console.error(
      "IKUISDK Tried to save the login data, but the login has not been success",
      data,
    );
  }
};

const pushResponse = (response) => {
  const previousResponses = JSON.parse(sessionStorage.getItem(responseList) || "[]");
  previousResponses.push(response);
  sessionStorage.setItem(responseList, JSON.stringify(previousResponses));
};

const popResponse = () => {
  const previousResponses = JSON.parse(sessionStorage.getItem(responseList) || "[]");
  const item = previousResponses.pop();
  const previousThreadId = item && item["~thread"] && item["~thread"].thid;
  if (previousThreadId) {
    setThreadId(previousThreadId);
  }
  sessionStorage.setItem(responseList, JSON.stringify(previousResponses));
  return item;
};

const clearResponses = () => {
  sessionStorage.setItem(responseList, "[]");
};

module.exports = {
  getRefreshToken,
  getAllUserTokens,
  removeUserTokens,
  storeOnLoginSuccess,
  setCv,
  getCv,
  setTokens,
  setDefaultUser,
  getTokens,
  // session
  setThreadId,
  getThreadId,
  setFPThreadId,
  getFPThreadId,
  setAuthFlowStartPoint,
  getAuthFlowStartPoint,
  setPendingResponse,
  getPendingResponse,
  // oidc
  setOidcOriginalParams,
  getOidcOriginalParams,
  setOidcSetupResponse,
  getOidcSetupResponse,
  clearOidcData,
  pushResponse,
  popResponse,
  clearResponses,
};
