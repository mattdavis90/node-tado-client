module.exports = {
  tadoMode: "HOME",
  geolocationOverride: false,
  geolocationOverrideDisableTime: null,
  preparation: null,
  setting: {
    type: "HEATING",
    power: "ON",
    temperature: {
      celsius: 21,
      fahrenheit: 69.8,
    },
  },
  overlayType: null,
  overlay: null,
  openWindow: null,
  nextScheduleChange: {
    start: "2018-07-26T20:00:00Z",
    setting: {
      type: "HEATING",
      power: "ON",
      temperature: {
        celsius: 18,
        fahrenheit: 64.4,
      },
    },
  },
  link: {
    state: "ONLINE",
  },
  activityDataPoints: {
    heatingPower: {
      type: "PERCENTAGE",
      percentage: 0,
      timestamp: "2018-07-26T11:05:06.610Z",
    },
  },
  sensorDataPoints: {
    insideTemperature: {
      celsius: 28.95,
      fahrenheit: 84.11,
      timestamp: "2018-07-26T11:21:17.581Z",
      type: "TEMPERATURE",
      precision: {
        celsius: 0.1,
        fahrenheit: 0.1,
      },
    },
    humidity: {
      type: "PERCENTAGE",
      percentage: 40.5,
      timestamp: "2018-07-26T11:21:17.581Z",
    },
  },
};
