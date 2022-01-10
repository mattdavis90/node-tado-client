# node-tado-client
[![Node.js Package](https://github.com/mattdavis90/node-tado-client/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/mattdavis90/node-tado-client/actions/workflows/npm-publish.yml)
[![CodeQL](https://github.com/mattdavis90/node-tado-client/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/mattdavis90/node-tado-client/actions/workflows/codeql-analysis.yml)

A Tado API client for Node

Based on the work of SCPhillips on his [blog](http://blog.scphillips.com/posts/2017/01/the-tado-api-v2/)

*Please note: This is based on reverse engineering the Tado Web App's API and hence may be unstable*

## Usage
```javascript
// Import the Tado client
const Tado = require('node-tado-client');

// Create a new Tado instance
var tado = new Tado();

// Login to the Tado Web API
tado.login('username', 'password').then(() => {
    tado.getMe().then(resp => {
        console.log(resp);
    });
});

// Get the User's information
```

This call will return something similar to the following Javascript object.

```javascript
{
    "name": "John Doe",
    "email": "john_doe@gmail.com",
    "username": "john_doe",
    "id": "523acf000089",
    "homes": [
        {
            "id": 1907,
            "name": "Home"
        }
    ],
    "locale": "en",
    "mobileDevices": [
        {
            "name": "John's Phone",
            "id": 644583,
            "settings": {
                "geoTrackingEnabled": true
            },
            "location": {
                "stale": false,
                "atHome": true,
                "bearingFromHome": {
                    "degrees": 1.0228772862994653,
                    "radians": 6.03530586900973365
                },
                "relativeDistanceFromHomeFence": 10
            },
            "deviceMetadata": {
                "platform": "Android",
                "osVersion": "6.0.0",
                "model": "Samsung Galaxy",
                "locale": "en"
            }
        }
    ]
}
```

The following API calls are available

```javascript
/*********************/
/* Low-level methods */
/*********************/
tado.login(username, password);
tado.apiCall(url, method = 'get', data = {});

/**********************/
/* High-level methods */
/**********************/
tado.getMe();
tado.getHome(home_id);
tado.getWeather(home_id);
tado.getDevices(home_id);
tado.getDeviceTemperatureOffset(device_id);
tado.getInstallations(home_id);
tado.getUsers(home_id);
tado.getState(home_id);
tado.getMobileDevices(home_id);
tado.getMobileDevice(home_id, device_id);
tado.getMobileDeviceSettings(home_id, device_id);
tado.getZones(home_id);
tado.getZoneState(home_id, zone_id);
tado.getZoneCapabilities(home_id, zone_id);
tado.getZoneOverlay(home_id, zone_id);
tado.getZoneDayReport(home_id, zone_id, reportDate)
tado.getTimeTables(home_id, zone_id);
tado.getAwayConfiguration(home_id, zone_id);
tado.getTimeTable(home_id, zone_id, timetable_id);
tado.clearZoneOverlay(home_id, zone_id);
tado.isAnyoneAtHome(home_id);
tado.setZoneOverlay(home_id, zone_id, power, temperature, termination);
tado.setDeviceTemperatureOffset(device_id, temperatureOffset);
tado.identifyDevice(device_id);
tado.setPresence(home_id, presence);
tado.updatePresence(home_id);
tado.setWindowDetection(home_id, zone_id, enabled, timeout);
tado.getAirComfort(home_id);

/**********************/
/* EnergyIQ & Savings methods */
/**********************/
tado.getEnergyIQ(home_id);
tado.getEnergyIQTariff(home_id)
tado.updateEnergyIQTariff(home_id, unit, tariffInCents)
tado.getEnergyIQMeterReadings(home_id)
tado.addEnergyIQMeterReading(home_id, date, reading);
tado.deleteEnergyIQMeterReading(home_id, reading_id)
tado.getEnergySavingsReport(home_id, year, month, countryCode); // countryCode should match home country, it can be retrieved from getHome(home_id).address.country
```

The ```setZoneOverlay``` method call takes the following arguments

**Note:** It will automatically determine the type of system that it is affecting

* *power* - **on** or **off** (case insensitive) [**default:** off]
* *temperature* - *Integer* temperature in Celsius, if affecting a HEATING system
* *termination* - *Integer* , **auto**, **next_time_block**, or **manual** (case insensitive, integer denotes a timer in seconds) [**default:** manual]

The ```setPresence``` method call takes the following arguments

* *presence* - **home**, **away** or **auto**
