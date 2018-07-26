# node-tado-client
A Tado API client for Node

Based on the work of SCPhillips on his [blog](http://blog.scphillips.com/posts/2017/01/the-tado-api-v2/)

*Please note: This is based on reverse engineering the Tado Web App's API and hence may be unstable*

## Usage
```javascript
// Import the Tado client
const Tado = requre('node-tado-client');

// Create a new Tado instance
var tado = new Tado();

// Login to the Tado Web API
tado.login('username', 'password');

// Get the User's information
tado.getMe();
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
tado.apiCall(url, method='get', data={});

/**********************/
/* High-level methods */
/**********************/
tado.getMe();
tado.getHome(home_id);
tado.getWeather(home_id);
tado.getDevices(home_id);
tado.getInstallations(home_id);
tado.getUsers(home_id);
tado.getMobileDevices(home_id);
tado.getMobileDevice(home_id, device_id);
tado.getMobileDeviceSettings(home_id, device_id);
tado.getZones(home_id);
tado.getZoneState(home_id, zone_id);
tado.getZoneCapabilities(home_id, zone_id);
tado.getZoneOverlay(home_id, zone_id);
tado.clearZoneOverlay(home_id, zone_id);
tado.setZoneOverlay(home_id, zone_id, power, temperature, termination);
tado.identifyDevice(device_id);
```

The ```setZoneOverlay``` method call takes the following arguments

* *power* - **on** or **off** (case insensitive) [**default:** off]
* *temperature* - *Integer* temperature in Celsius
* *termination* - *Integer* , **auto**, or **manual** (case insensitive, integer denotes a timer in seconds) [**default:** manual]
