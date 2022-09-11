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

function jsonCity(data) {
  weatherData.cityName = data.name;
  weatherData.cityTemperature = Math.round(data.main.temp);
  weatherData.icon = data.weather[0].icon;
  weatherData.feelsLike = Math.round(data.main.feels_like);
  weatherData.weather = data.weather[0].main;
  weatherData.sunrise = data.sys.sunrise;
  weatherData.sunset = data.sys.sunset;

  return new Promise((resolve) => {
    resolve(weatherData);
  });
}

function addZerro(num) {
  if (num >= 0 && num <= 9) {
    return `0${num}`;
  }
  return num;
}

function changeDetailsDateFormat(time) {
  const date = new Date(time * 1000);
  const hour = addZerro(date.getHours());
  const min = addZerro(date.getMinutes());
  return `${hour}:${min}`;
}

function setWeatherData() {
  UI_ELEM.NOWS_CITY.textContent = weatherData.cityName;
  UI_ELEM.NOWS_DEGREES.textContent = `${weatherData.cityTemperature}°`;
  UI_ELEM.NOWS_ICON.src = `../images/nows/${weatherData.icon}.svg`;
  UI_ELEM.DETAILS_CITY.textContent = weatherData.cityName;
  UI_ELEM.DETAILS_TEMP.innerHTML = `<span>Temperature:</span> ${weatherData.cityTemperature}°`;
  UI_ELEM.DETAILS_FEEL.innerHTML = `<span>Feels like:</span> ${weatherData.feelsLike}°`;
  UI_ELEM.DETAILS_WEATHER.innerHTML = `<span>Weather:</span> ${weatherData.weather}`;
  UI_ELEM.DETAILS_SUNRISE.innerHTML = `<span>Sunrise:</span> ${changeDetailsDateFormat(
    weatherData.sunrise
  )}`;
  UI_ELEM.DETAILS_SUNSET.innerHTML = `<span>Sunset:</span> ${changeDetailsDateFormat(
    weatherData.sunset
  )}`;
}

function fetchCityWeather(cityName) {
  const url = `${SERVER_URL_WEATHER}?q=${cityName}&appid=${API_KEY}&units=metric`;
  fetch(url)
    .then(status)
    .then(json)
    .then(jsonCity)
    .then(setWeatherData)
    .catch(() => {
      UI_ELEM.NOWS_CITY.textContent = "Not Found";
      UI_ELEM.INPUT_NAME.classList.add("error");
    });
}

function reset() {
  UI_ELEM.FORM.reset();
}

UI_ELEM.FORM.addEventListener("submit", (event) => {
  event.preventDefault();
  UI_ELEM.NOWS__LIKE.setAttribute("src", "../images/heart-icon.svg");
  UI_ELEM.INPUT_NAME.classList.remove("error");
  fetchCityWeather(UI_ELEM.INPUT_NAME.value);

  reset();
});

function saveCities(cities) {
  try {
    storage.saveFavoriteCities(cities);
  } catch (error) {
    alert("out of local storage space!");
  }
}

function changeLocalStorage(newCity) {
  try {
    const favoriteCities = storage.getFavoriteCities();
    favoriteCities.add(newCity);
    storage.saveFavoriteCities(favoriteCities);
  } catch (error) {
    alert("out of local storage space!");
  }
}

function removeCity(button) {
  button.parentElement.remove();
}

function filterCities(button) {
  const favoriteCities = storage.getFavoriteCities();
  const deletedCity = button.parentElement.textContent.trim();
  const FILTERED_CITIES = [...favoriteCities].filter(
    (city) => city !== deletedCity
  );
  return FILTERED_CITIES;
}

function deleteZerro(num) {
  if (num >= 0 && num <= 9) {
    return num.slice(1);
  }
  return num;
}

function changeFormatForecastDate(date) {
  const months = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const fullDate = date.slice(0, 10);
  const arr = fullDate.split("-");
  const month = deleteZerro(arr[1]);
  const newFormatDate = `${arr[2]} ${months[month]}`;
  return newFormatDate;
}

function createTables(forecastList) {
  UI_ELEM.FORECAST_TABLES.innerHTML = "";

  forecastList.forEach((element) => {
    const table = document.createElement("table");
    table.classList.add("about__table");
    const tr1 = document.createElement("tr");
    tr1.classList.add("about__table-tr");
    const td1 = document.createElement("td");
    td1.classList.add("about__table-td", "first");
    td1.textContent = changeFormatForecastDate(element.dt_txt);
    const td2 = document.createElement("td");
    td2.classList.add("about__table-td", "first");
    td2.textContent = element.dt_txt.slice(11, 16);
    tr1.append(td1, td2);

    const tr2 = document.createElement("tr");
    tr1.classList.add("about__table-tr");
    const td3 = document.createElement("td");
    td3.classList.add("about__table-td");
    td3.textContent = `Temperature: ${Math.round(element.main.temp)}°`;
    const td4 = document.createElement("td");
    td4.textContent = element.weather[0].main;
    tr2.append(td3, td4);

    const tr3 = document.createElement("tr");
    tr3.classList.add("about__table-tr");
    const td5 = document.createElement("td");
    td5.classList.add("about__table-td");
    td5.textContent = `Feels like: ${Math.round(element.main.feels_like)}°`;
    const td6 = document.createElement("td");
    const img = document.createElement("img");
    img.classList.add("table-img");
    img.src = `../images/animated/${element.weather[0].icon}.svg`;
    td6.append(img);
    tr3.append(td5, td6);

    table.append(tr1, tr2, tr3);
    UI_ELEM.FORECAST_TABLES.append(table);
  });
}

async function fetchCityForecast(cityName) {
  const url = `${SERVER_URL_FORECAST}?q=${cityName}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    const statusResult = await status(response);
    const data = await json(statusResult);
    const forecastList = data.list.slice(0, 20);
    createTables(forecastList);
  } catch (error) {
    UI_ELEM.FORECAST_CITY.textContent = "Not Found";
  }
}

function createNewElement(city) {
  const cityElement = document.createElement("li");
  cityElement.classList.add("item-location__link");
  cityElement.textContent = city;

  cityElement.addEventListener("click", () => {
    UI_ELEM.NOWS__LIKE.setAttribute("src", "../images/heart-icon.svg");
    UI_ELEM.INPUT_NAME.classList.remove("error");
    UI_ELEM.FORECAST_CITY.textContent = cityElement.textContent;

    fetchCityWeather(cityElement.textContent);
    fetchCityForecast(cityElement.textContent);
  });

  const deleteButton = document.createElement("input");
  deleteButton.type = "button";
  deleteButton.classList.add("delete-button");

  deleteButton.addEventListener("click", (event) => {
    event.stopImmediatePropagation();
    const filteredCities = filterCities(event.target);
    saveCities(filteredCities);
    removeCity(event.target);
  });

  cityElement.append(deleteButton);

  return cityElement;
}

UI_ELEM.FORECAST.addEventListener("click", () => {
  UI_ELEM.FORECAST_CITY.textContent = UI_ELEM.NOWS_CITY.textContent;
  fetchCityForecast(UI_ELEM.NOWS_CITY.textContent);
});

function addNewCity() {
  if (weatherData.cityName) {
    const newCityElement = createNewElement(weatherData.cityName);
    UI_ELEM.LOCATION_LIST.append(newCityElement);
  }
  return weatherData.cityName;
}

function loadStorage() {
  if (localStorage.getItem("cities")) {
    const favoriteCities = storage.getFavoriteCities();
    favoriteCities.forEach((city) => {
      UI_ELEM.LOCATION_LIST.append(createNewElement(city));
    });
  } else {
    localStorage.setItem("cities", "[]");
  }
}
loadStorage();

function createLikedList() {
  UI_ELEM.NOWS__LIKE.addEventListener("click", () => {
    UI_ELEM.NOWS__LIKE.setAttribute("src", "../images/heart-icon-liked.svg");

    const favoriteCities = storage.getFavoriteCities();
    if (!favoriteCities.has(weatherData.cityName)) {
      const newCityElem = addNewCity();
      changeLocalStorage(newCityElem);
    }
  });
}

createLikedList();

window.addEventListener("load", () => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const now = () =>
    `${
      months[new Date().getMonth()]
    }, ${new Date().getDate()} ${new Date().getFullYear()}`;
  UI_ELEM.DATE.innerText = now();
});
