function Services() {
  const WEATHERSERVICE_ENDPOINT =
    'https://api.openweathermap.org/data/2.5/weather?';
  const MAPBOXSERVICE_ENDPOINT =
    'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/{LON},{LAT},11,0/{WIDTH}x200?access_token={APIKEY}';
  const APIKEY = '9fa2468c862862753aab902c6957e682';
  const MAPBOX_APIKEY =
    'pk.eyJ1IjoiY21vY2hvIiwiYSI6ImNrZG13bmp1cTAweHozM3FvZWsxODFkNWkifQ.HjsX2waKZL1Y68kFhDToxw';

  function getWeatherByCity(city) {
    return new Promise((resolve, reject) => {
      fetch(
        WEATHERSERVICE_ENDPOINT + 'q=' + city + '&units=metric&appid=' + APIKEY
      )
        .then((resp) => resp.json())
        .then((json) => resolve(json))
        .catch((err) => reject(err));
    });
  }

  function getWeatherByGeolocation(gl) {
    return new Promise((resolve, reject) => {
      fetch(
        WEATHERSERVICE_ENDPOINT +
          'lat=' +
          gl.latitude +
          '&units=metric' +
          '&lon=' +
          gl.longitude +
          '&appid=' +
          APIKEY
      )
        .then((resp) => resp.json())
        .then((json) => resolve(json))
        .catch((err) => reject(err));
    });
  }

  function saveData(data) {
    if (data)
      window.localStorage.setItem(
        'cloud.ezsystems.ezweather.data',
        JSON.stringify(data)
      );
  }

  function loadData() {
    const data = window.localStorage.getItem('cloud.ezsystems.ezweather.data');
    if (data) return JSON.parse(data);
    else return null;
  }

  function mapImageSource(width, gl) {
    return MAPBOXSERVICE_ENDPOINT.replace('{WIDTH}', width.toString())
      .replace('{LAT}', gl.latitude.toString())
      .replace('{LON}', gl.longitude.toString())
      .replace('{APIKEY}', MAPBOX_APIKEY);
  }

  function getCurrentLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (gl) => {
          resolve(gl.coords);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  return {
    getWeatherByCity,
    getWeatherByGeolocation,
    saveData,
    loadData,
    mapImageSource,
    getCurrentLocation,
  };
}
