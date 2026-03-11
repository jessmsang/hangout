import { BASE_URL } from "../constants/apiEndpoints";
import { checkResponse } from "./weatherApi";
import { getToken } from "../utils/token";

// Forgot password (unauthenticated)
export const forgotPassword = (email) => {
  return fetch(`${BASE_URL}/users/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  }).then(checkResponse);
};

//Private
export const getCurrentUser = () => {
  return fetch(`${BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  }).then(checkResponse);
};

export const updateUser = (user) => {
  return fetch(`${BASE_URL}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  }).then(checkResponse);
};

export const deleteUser = () => {
  return fetch(`${BASE_URL}/users/me`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  }).then(checkResponse);
};

export const updatePassword = ({ oldPassword, newPassword }) => {
  const token = getToken();
  if (!token) return Promise.reject(new Error("No authentication token found"));

  return fetch(`${BASE_URL}/users/me/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  }).then(checkResponse);
};
