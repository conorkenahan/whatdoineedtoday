// pollen count
const pollenAPIKey = 'X7y3al5ruA4rD9fbHADfu9mYllWuFmEa4Ad5IlPd';
const pollenSearchURL = 'https://api.ambeedata.com/latest/pollen/by-lat-lng';

//weather & UV index
const openWeatherAPIKey = 'c275bb66aefa9d10226b84d72aee4eab';
const openWeatherSearchURL ='https://api.openweathermap.org/data/2.5/onecall';

//zip code to long/lat
const zipCodeSearchURL = 'https://public.opendatasoft.com/api/records/1.0/search/';


let userLong = {};
let userLat ={};
let weather = [];
let uvi = [];
let pollenRisk = ""; 
let today = new Date();
let userTime = (today.getHours() + ":" + today.getMinutes());

// encode URL parameters
function formatQueryParams(params){
  const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}


// convert "location" zip into long/lat
// returns "response.records.location.lat/lng" values s
function locationToLongLat(location){
  const locationParams = {
    dataset: "us-zip-code-latitude-and-longitude",
    q: location
  };
  const locationQueryString = formatQueryParams(locationParams)
  const locationURL = zipCodeSearchURL + '?' + locationQueryString;

  fetch(locationURL)
  .then(response=>response.json())
  .then(data=> {
    userLong = data.records[0].fields.longitude;
    userLat = data.records[0].fields.latitude;
    getWeather(userLong, userLat);
  })
  .catch(err=> {
   alert("Something went wrong. Make sure you're connected to the internet, or try again.");
   $('#loading').addClass('hidden');}
  );
}

// gets weather and uvi
function getWeather(userLong, userLat){
  const weatherParams = {
    lat: userLat,
    lon: userLong,
    appid: openWeatherAPIKey
   };
  const weatherQueryString = formatQueryParams(weatherParams)
  const openWeatherURL = openWeatherSearchURL + '?' + weatherQueryString;

  fetch(openWeatherURL)
  .then(response=>response.json())
  .then(data => {
    weather = data.current.weather[0].main;
    uvi = data.current.uvi;
    getPollen(userLong, userLat);
  })
  .catch(err=> alert("Something went wrong. Make sure you're connected to the internet, or try again.")
  );
}



// return "data.risk" value (low/medium/high)
// long/lat sometimes returning "Absent" - meaning there is no count
function getPollen(userLong, userLat){
  const pollenParams = {
    lat: userLat,
    lng: userLong
  };
  const pollenOptions = {
  headers: new Headers({
    'x-api-key': pollenAPIKey
   })
  };
  const pollenQueryString = formatQueryParams(pollenParams)
  const pollenURL = pollenSearchURL + '?' + pollenQueryString;

  fetch(pollenURL, pollenOptions)
  .then(response => response.json())
  .then(data => {
    pollenRisk = data.data.risk;
  })
  .catch(err=> {$('#error').html(``);
  });
  displayResults(weather, uvi, pollenRisk);
}



function displayResults(weather, uvi, pollenRisk){
  $('#loading').addClass('hidden');
  $('#loading').addClass('hidden');
  let count = 0;
  if (weather.toLowerCase() === 'thunderstorm' || weather.toLowerCase() === 'drizzle' || weather.toLowerCase() === 'rain') {
    count++;
    $('#rainIndicator').html(`<p>
    It's going to rain today. Don't forget your umbrella!</p>
     <i class="wi wi-day-sprinkle colorRainIcon"></i>`);
  }
  if (weather.toLowerCase() === 'snow') {
    count++;
    $('#snowIndicator').html(`<p>It's going to snow today! Make sure you bring boots and gloves.</p>
     <i class="wi wi-snow colorSnowIcon"></i>`);
  }
  if (userTime < '18:00') {
    if (uvi > 3) {
      count++;
      $('#uvIndicator').html(`<p>Make sure you bring your sunscreen today. UV Index of: <a href="https://www.epa.gov/sunsafety/uv-index-scale-0">${uvi}</a></p>
     <i class="wi wi-day-sunny colorSunIcon"></i>`);
      $('#uvIndicator').removeClass('hidden');
    }
  }
  if (pollenRisk.toLowerCase() === 'high' || pollenRisk.toLowerCase() === 'medium') {
    count++;
    $('#pollenIndicator').html(`<p>Pollen is high! If you suffer from allergies, bring allergy medicine!</p>
     <i class="wi wi-snowflake-cold colorPollenIcon"></i>`);
  }
  if(count===0){
    if (userTime < "18:00") {
      $('#noresults').html('<p>It looks like clear skies, low pollen, and low <a href="https://www.epa.gov/sunsafety/uv-index-scale-0">UVI</a>. You have nothing to bring but a smile!<br>Have a great day! :)</p><i class="wi wi-alien"></i>').removeClass('hidden');}
    if (userTime > "18:00") {
    $('#noresults').html('<p>It looks like a beautiful night. You have nothing to bring but a smile!<br>Have a great evening! :)</p><i class="wi wi-moon-alt-waning-crescent-4"></i>').removeClass('hidden');}
 }
}

// grabs "location" value (zip code)
// sends to locationToLongLat function
function watchForm(){
  $('#submit').submit(event =>{
    event.preventDefault();
    const location = $('#location').val();
    $('#loading').removeClass('hidden');
    $('#error').empty();
    $('#rainIndicator').addClass('hidden');
    $('#uvIndicator').addClass('hidden');
    $('#pollenIndicator').addClass('hidden');
    $('#snowIndicator').addClass('hidden');
    $('#noresults').addClass('hidden');
    locationToLongLat(location);
    // for testing purposes
    if (location === '00000') {
    $('#rainIndicator').html(`<p>
    It's going to rain today. Don't forget your umbrella!</p>
     <i class="wi wi-day-sprinkle colorRainIcon"></i>`).removeClass('hidden');
    $('#uvIndicator').html(`<p>Make sure you bring your sunscreen today. UV Index of: <a href="https://www.epa.gov/sunsafety/uv-index-scale-0">${uvi}</a></p>
     <i class="wi wi-day-sunny colorSunIcon"></i>`).removeClass('hidden');
    $('#pollenIndicator').html(`<p>Pollen is high! If you suffer from allergies, bring allergy medicine!</p>
     <i class="wi wi-snowflake-cold colorPollenIcon"></i>`).removeClass('hidden');
    $('#snowIndicator').html(`<p>It's going to snow today! Make sure you bring boots and gloves.</p>
     <i class="wi wi-snow colorSnowIcon"></i>`).removeClass('hidden');
    }
  });
}



$(watchForm);
