import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE,
});

const saved = sessionStorage.getItem("token");
if (saved) {
  API.defaults.headers.common["Authorization"] = `Bearer ${saved}`;
}

export function setToken(token) {
  if (token) {
    sessionStorage.setItem("token", token);
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    sessionStorage.removeItem("token");
    delete API.defaults.headers.common["Authorization"];
  }
}

export default API;
