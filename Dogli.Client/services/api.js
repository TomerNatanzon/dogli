// src/services/api.js

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthToken } from "./storage";

const BaseUrl =
  "https://73d2-2a02-ed0-4360-300-93fe-8b61-650d-fae7.ngrok-free.app"; // TODO: replace this with a remote host OR ngrok tunnel

const api = axios.create({
  baseURL: `${BaseUrl}/api`,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { api };
