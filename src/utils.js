import { getAuth } from "firebase/auth";

import environment from "./environment";

import firebaseApp from "./firebase";

/** FIREBASE RELATED */

export const setFirebaseProviderId = (value = "") => {
  localStorage.setItem("firebaseProviderId", value);
};

export const getFirebaseProviderId = () => {
  const providerId = localStorage.getItem("firebaseProviderId");

  return providerId || "none";
};

export const getIdTokenFromCurrentUser = async () => {
  const auth = getAuth(firebaseApp);

  const { currentUser } = auth;

  if (!currentUser) {
    return undefined;
  }

  const token = await currentUser.getIdToken();

  return token;
};

/** FIREBASE RELATED */

/** DATE RELATED */

// function to format date
export const formatDate = (value = "") => {
  const parsedDate = new Date(value);

  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsedDate);
};

// function to format date time
export const formatDateTime = (value = "") => {
  const parsedDate = new Date(value);

  return parsedDate.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const addDays = (date = new Date(), days = 0) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const subtractDays = (date = new Date(), days = 0) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

export const addMinutes = (date = new Date(), minutes = 0) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

export const subtractMinutes = (date = new Date(), minutes = 0) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() - minutes);
  return result;
};

export const monthNumberToMonthName = (monthNumber = 0) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  const monthName = capitalizeFirstLetter(date.toLocaleString("es-CO", {
    month: "short",
  }));

  return monthName;
};

/** DATE RELATED */

/** EPAYCO RELATED */

export const calculateEpaycoFee = (value = 0) => {
  return value * 0.03 + 900;
};

export const shouldUseEpayco = (value = 0) => {
  const epaycoFee = calculateEpaycoFee(value);
  const fractionValue = value * 0.1;

  return epaycoFee < fractionValue;
};

/** EPAYCO RELATED */

/** OTHERS */

export const delay = (ms) => {
  const timeToWait = ms || parseInt(environment.DELAY_TIME, 10);

  return new Promise((resolve) => {
    setTimeout(resolve, timeToWait);
  });
};

export const getMessageFromAxiosError = (error) => {
  // eslint-disable-next-line no-console
  console.log("error", error);
  if (error.response) {
    const { data } = error.response;

    if (data && data.message) {
      return data.message;
    }
  }

  return "something went wrong";
};

// function to capitalize first letter of string
export const capitalizeFirstLetter = (value = "") => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// function to format currency
export const formatCurrency = (value = 0) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(value);
};

/** OTHERS */
