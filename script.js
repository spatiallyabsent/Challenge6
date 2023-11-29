//below references incase I need them again
var requestUrl = "https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude=hourly,minutely,alerts&appid=4e8d7462123efddd1c5f764de1e845d2"
var geoUrl = "http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit=2&appid=4e8d7462123efddd1c5f764de1e845d2"//http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid={API key}

//api key
const weatherKey = `70c876464a5531b394887ba68e30a76a`;
//storing user input
const citySearch = document.querySelector("#citySearch")
const cityBtn = document.querySelector("#cityBtn")

//----below-----are the data points to get the temp humidity and windspeed from the API---used as a reference for myself
// var humidityApi = daily[0].humidity
// var tempApi = daily[0].temp.day //(for max add .max) (for min add .min)
// var windspeedApi = daily[0].wind_speed
// the [0] is an index. to get the next days add to the [0] using a for loop;

//event listener for the search button
cityBtn.addEventListener("click", function (event) {
  event.preventDefault();
  const namedCity = citySearch.value.trim();
  getWeatherData(namedCity);
});

//creating the api call to get city name and lat and longitude.
function getWeatherData(namedCity) {
  var geoSearchUrlTwo = `https://api.openweathermap.org/geo/1.0/direct?q=${namedCity}&cnt=5&appid=${weatherKey}`;
  fetch(geoSearchUrlTwo)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('city not found');
      }
      return response.json();
    })
    .then(function (data) {
      console.log('Geolocation Data', data); // looking at the data
      var lat = data[0].lat
      var lon = data[0].lon
      var forecastRequest = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=hourly,minutely,alerts&appid=${weatherKey}`;
      return fetch(forecastRequest)
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log('Weather Forecast Data', data);//seing the data from forcastRequest
      //beloow code is to make the search button add the list in later code of previous searched cities
      let previousSearches = JSON.parse(localStorage.getItem('previousSearches')) || [];
      previousSearches.push(namedCity);
      localStorage.setItem('previousSearches', JSON.stringify(previousSearches));
      displayPreviousSearches();
      //------below-----had originally tried to make this outside of this function and couldn't get it to gather data. note to self work on scoping. took way to long to figure out, also it had alot of redundencies initially.
      document.getElementById('cityName').textContent = namedCity;
      //adding data to the current weather day
      var currentDayData = data.current;

      var temperatureElement = document.getElementById('temp');
      temperatureElement.textContent = `Temperature: ${data.daily[0].temp.day} F`;

      var windElement = document.getElementById('wind');
      windElement.textContent = `Wind Speed: ${currentDayData.wind_speed} m/s`;

      var humidityElement = document.getElementById('humidity');
      humidityElement.textContent = `Humidity: ${currentDayData.humidity}%`;
      //five day forecast
      var fiveDayForecast = document.getElementById('weatherFiveDay');
      fiveDayForecast.innerHTML = ''; //this is used to clear the previous days forecast
      for (let i = 1; i <= 5; i++) {
        var fiveDayData = data.daily[i];
        var fiveDayElement = document.createElement('div');
        fiveDayElement.classList.add('dailyForecasts')
        //---below--- had to look up how to get the days to show using openweather. 
        fiveDayElement.innerHTML = `
        <h5>${getDateString(fiveDayData.dt)}</h5>
        <p>Temperature: ${data.daily[i].temp.day} F</p>
        <p>Wind Speed; ${fiveDayData.wind_speed} m/s</p>
        <p>Humidity: ${fiveDayData.humidity}%</p>
        `;
        fiveDayForecast.appendChild(fiveDayElement);
      }
      //this is a function I had to look up to convert the api day into a text value. I was getting a long list of numbers instead.
      function getDateString(timestamp) {
        var date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }
    })
    .catch(function (error) {
      console.error('Error', error);
    })
};

function displayPreviousSearches() {
  var perviousCitiesContainer = document.getElementById('previousCities');
  perviousCitiesContainer.innerHTML = ''; // used to clear previous content
  //retrieve previous searches from local storage
  let previousSearches = JSON.parse(localStorage.getItem('previousSearches')) || [];
  let citiesSearchedIndex = Math.max(0, previousSearches.length - 5);
  for (let i = previousSearches.length - 1; i >= citiesSearchedIndex; i--) { //this little monstrosity I had to look up because I didnt like the searches building up and wanted to limit it to five.
    var citiesParagraph = document.createElement('p');
    citiesParagraph.textContent = previousSearches[i];
    perviousCitiesContainer.appendChild(citiesParagraph);
  }
}