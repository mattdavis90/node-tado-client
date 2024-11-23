# node-tado-client

[Documentation](https://mattdavis90.github.io/node-tado-client/)

A Tado API client for Node

Based on the work of SCPhillips on his [blog](http://blog.scphillips.com/posts/2017/01/the-tado-api-v2/)

_Please note: This is based on reverse engineering the Tado Web App's API and hence may be unstable_

_DEPRECATION notice: The Zone Overlay API calls are being deprecated, see below for further information_

## Usage

```javascript
// Import the Tado client
const { Tado } = require("node-tado-client");

// Create a new Tado instance
var tado = new Tado();

// Login to the Tado Web API
tado.login("username", "password").then(() => {
    tado.getMe().then((resp) => {
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

/****************************************/
/* High-level methods (Tado and Tado-X) */
/****************************************/
tado.getMe();
tado.getHome(home_id);
tado.getWeather(home_id);
tado.getInstallations(home_id);
tado.getUsers(home_id);
tado.getState(home_id);
tado.getMobileDevices(home_id);
tado.getMobileDevice(home_id, device_id);
tado.getMobileDeviceSettings(home_id, device_id);
tado.isAnyoneAtHome(home_id);
tado.setPresence(home_id, presence);
tado.updatePresence(home_id);
tado.getAirComfort(home_id);
tado.getEnergyIQ(home_id);
tado.getEnergyIQTariff(home_id);
tado.addEnergyIQTariff(home_id, unit, startDate, endDate, tariffInCents);
tado.updateEnergyIQTariff(home_id, tariff_id, unit, startDate, endDate, tariffInCents);
tado.getEnergyIQMeterReadings(home_id);
tado.addEnergyIQMeterReading(home_id, date, reading);
tado.deleteEnergyIQMeterReading(home_id, reading_id);
tado.getEnergySavingsReport(home_id, year, month, countryCode); // countryCode should match home country, it can be retrieved from getHome(home_id).address.country

/**********************************/
/* High-level methods (Tado only) */
/**********************************/
tado.getZones(home_id);
tado.getZoneState(home_id, zone_id);
tado.getZoneCapabilities(home_id, zone_id);
tado.getZoneOverlay(home_id, zone_id);
tado.getZoneDayReport(home_id, zone_id, reportDate)
tado.getTimeTables(home_id, zone_id);
tado.getAwayConfiguration(home_id, zone_id);
tado.getTimeTable(home_id, zone_id, timetable_id);
tado.setWindowDetection(home_id, zone_id, enabled, timeout);
tado.clearZoneOverlays(home_id, [zone_id, ...]);
tado.setZoneOverlays(home_id, [overlays, ...], termination);
tado.getZoneDefaultOverlay(home_id, zone_id);
tado.setZoneDefaultOverlay(home_id, zone_id, overlay);
tado.getDevices(home_id);
tado.getDeviceTemperatureOffset(device_id);
tado.setDeviceTemperatureOffset(device_id, temperatureOffset);
tado.identifyDevice(device_id);

/***********************************/
/* High-level methods (TadoX only) */
/***********************************/
tado.getRoomsAndDevice(home_id);
tado.getRooms(home_id);
tado.getRoomState(home_id, room_id);
tado.resumeSchedule(home_id, room_id);
tado.manualControl(home_id, room_id, power, temperature termination);

/**********************************/
/* Deprecated methods (Tado only) */
/**********************************/
tado.clearZoneOverlay(home_id, zone_id);
tado.setZoneOverlay(home_id, zone_id, power, temperature, termination);
```

### Setting Zone Overlays

The `setZoneOverlay` and `clearZoneOverlay` methods have been deprecated in favour of `setZoneOverlays` and `clearZoneOverlays` respectively.

The `setZoneOverlays` method takes an array of `overlays` in the form of

```javascript
{
    zone_id: 123,           # Required
    power: "ON",            # HEATING and AC
    temperature: {          # HEATING and AC
        celsius: 24,
        fahrenheit: 75.2
    },
    mode: "HEAT",           # AC only
    fanLevel: "LEVEL1",     # AC only
    verticalSwing: "OFF",   # AC only
    horizontalSwing: "OFF", # AC only
    light: "OFF",           # AC only
}
```

It is not required to use upper case in the values, the library will convert the strings for you. It is also not required to supply both celsius and fahrenheit, the Tado API is able to convert for you.

The `termination` argument should be one of the following:

-   A positive integer - this will be interpreted as the number of seconds to set the overlay for
-   "auto" - this will put the overlay into "TADO_MODE"
    -   _Note: This uses the default termination type set on the zone_
-   "next_time_block" - overlay until the next scheduled event
-   Anything else - the overlay will exist indefinitely and will need manually clearing

### Setting Geo Presence

The `setPresence` method call takes the following arguments

-   _presence_ - **home**, **away** or **auto**

**Documentation of deprecated methods**

The `setZoneOverlay` method call takes the following arguments

**Note:** It will automatically determine the type of system that it is affecting

-   _power_ - **on** or **off** (case insensitive) [**default:** off]
-   _temperature_ - _Integer_ temperature in Celsius, if affecting a HEATING system
-   _termination_ - _Integer_ , **auto**, **next_time_block**, or **manual** (case insensitive, integer denotes a timer in seconds) [**default:** manual]
