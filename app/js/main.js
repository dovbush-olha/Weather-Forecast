import { UI_ELEM } from "./view.js";
import { tab } from "./tab.js";
import { storage } from "./storage.js";

tab();

const SERVER_URL_WEATHER = "http://api.openweathermap.org/data/2.5/weather";
const SERVER_URL_FORECAST = "http://api.openweathermap.org/data/2.5/forecast";
const API_KEY = "73b04f10a5d603d29c52ac0a00cc5625";
const weatherData = {};

function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  }
  return Promise.reject(new Error(response.statusText));
}

function json(response) {
  return response.json();
}
