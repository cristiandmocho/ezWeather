ons.ready(onDeviceReady);
document.addEventListener('readystatechange', onDeviceReady, false);

function onDeviceReady() {
  let myCities = Services().loadData() || [];
  const WEATHER_ICON = 'https://openweathermap.org/img/wn/{ICON}.png';

  if (document.readyState !== 'complete') return;

  function showCities() {
    if (myCities) {
      // Shows the cities
      const $list = document.querySelector('ons-list');

      $list.innerHTML = myCities
        .map((city) => {
          const el = `<ons-list-item data-city="${city}">
                      <div class="left">
                        <img class="list-item__thumbnail" src="{ICON}">
                      </div>
                      <div class="center">
                        <span class="list-item__title">{CITY}</span><span class="list-item__subtitle">{TEMP}</span>
                      </div>
                      <div class="right">
                        <ons-button modifier="quiet material" data-city="${city}"><ons-icon icon="md-delete"></ons-icon></ons-button>
                      </div>
                    </ons-list-item>`;

          // Get the weather data for this city
          Services()
            .getWeatherByCity(city)
            .then((data) => {
              const $item = document.querySelector(
                'ons-list-item[data-city="' + city + '"]'
              );

              if (data.cod === '404') {
                $item.remove();
              } else {
                $item.querySelector(
                  '.list-item__title'
                ).innerHTML = `${data.name}, ${data.sys.country}`;
                $item.querySelector(
                  '.list-item__subtitle'
                ).innerHTML = `${Number(data.main.temp).toFixed(1)} °C`;
                $item.querySelector(
                  '.list-item__thumbnail'
                ).src = WEATHER_ICON.replace('{ICON}', data.weather[0].icon);
              }
            });

          return el;
        })
        .join('');
    }
  }

  // Get the user's current position
  Services()
    .getCurrentLocation()
    .then((gl) => {
      // Shows the map for the region
      const mapWidth = document.querySelector('#imgMap').parentElement
        .offsetWidth;
      const mapSource = Services().mapImageSource(mapWidth, gl);

      document.querySelector('#imgMap').src = mapSource;

      // Get the weather data
      Services()
        .getWeatherByGeolocation({
          latitude: gl.latitude,
          longitude: gl.longitude,
        })
        .then((data) => {
          const $weatherIcon = document.querySelector('#imgWeatherIcon');

          document.querySelector(
            '#cityName'
          ).innerText = `${data.name}, ${data.sys.country}`;

          document.querySelector('#temp').innerText =
            Number(data.main.temp).toFixed(1).toString() + '°C';
          document.querySelector('#feelsLike').innerHTML =
            '<span>Feels like</span>: ' +
            Number(data.main.feels_like).toFixed(1).toString() +
            '°C';

          $weatherIcon.src = WEATHER_ICON.replace(
            '{ICON}',
            data.weather[0].icon
          );
          $weatherIcon.setAttribute('title', data.weather[0].description);

          // Shows additional info
          const infoHTML = (info) => {
            return '<p><span>{LABEL}</span>:&nbsp;{VALUE}</p>'
              .replace('{LABEL}', info.label)
              .replace('{VALUE}', info.value);
          };
          const $weatherContent = document.querySelector('ons-card .content');
          let infoString = '';

          infoString += infoHTML({
            label: 'Humidity',
            value: data.main.humidity.toString() + '%',
          });
          infoString += infoHTML({
            label: 'Pressure',
            value: data.main.pressure.toString() + ' hPa',
          });
          infoString += infoHTML({
            label: 'Max Temp.',
            value: data.main.temp_max.toString() + ' °C',
          });
          infoString += infoHTML({
            label: 'Min Temp.',
            value: data.main.temp_min.toString() + ' °C',
          });

          $weatherContent.innerHTML = infoString;
        });
    })
    .catch((err) => console.log(err));

  // Loads saved data to show
  showCities();

  // UI events
  const $btnAddCity = document.querySelector('#btnAddCity');
  const $onsList = document.querySelector('ons-list');

  $btnAddCity.addEventListener('click', () => {
    ons.notification.prompt('Enter a city name').then((input) => {
      myCities.push(input);
      myCities = myCities.sort();

      Services().saveData(myCities);

      showCities();
    });
  });

  $onsList.addEventListener('click', (e) => {
    const city = e.target.closest('ons-button').getAttribute('data-city');
    myCities = myCities
      .filter((c) => {
        return city !== c;
      })
      .sort();

    Services().saveData(myCities);

    showCities();
  });

  $onsList.addEventListener('hold', () => {
    ons.notification.confirm('Are you sure?').then(() => {
      localStorage.clear();
    });
    showCities();
  });
}
