module.exports = {
  zoneType: "HEATING",
  interval: {
    from: "2023-01-19T22:45:00.000Z",
    to: "2023-01-20T23:15:00.000Z",
  },
  hoursInDay: 24,
  measuredData: {
    measuringDeviceConnected: {
      timeSeriesType: "dataIntervals",
      valueType: "boolean",
      dataIntervals: [
        {
          from: "2023-01-19T22:45:00.000Z",
          to: "2023-01-20T23:15:00.000Z",
          value: true,
        },
      ],
    },
    insideTemperature: {
      timeSeriesType: "dataPoints",
      valueType: "temperature",
      min: {
        celsius: 21.29,
        fahrenheit: 70.32,
      },
      max: {
        celsius: 22.26,
        fahrenheit: 72.07,
      },
      dataPoints: [
        {
          timestamp: "2023-01-19T22:45:00.000Z",
          value: {
            celsius: 21.29,
            fahrenheit: 70.32,
          },
        },
        {
          timestamp: "2023-01-20T23:15:00.000Z",
          value: {
            celsius: 22.26,
            fahrenheit: 72.07,
          },
        },
      ],
    },
    humidity: {
      timeSeriesType: "dataPoints",
      valueType: "percentage",
      percentageUnit: "UNIT_INTERVAL",
      min: 0.378,
      max: 0.433,
      dataPoints: [
        {
          timestamp: "2023-01-19T22:45:00.000Z",
          value: 0.378,
        },
        {
          timestamp: "2023-01-20T23:15:00.000Z",
          value: 0.433,
        },
      ],
    },
  },
  stripes: {
    timeSeriesType: "dataIntervals",
    valueType: "stripes",
    dataIntervals: [
      {
        from: "2023-01-19T22:45:00.000Z",
        to: "2023-01-19T23:00:00.000Z",
        value: {
          stripeType: "HOME",
          setting: {
            type: "HEATING",
            power: "ON",
            temperature: {
              celsius: 21.5,
              fahrenheit: 70.7,
            },
          },
        },
      },
      {
        from: "2023-01-20T23:00:00.000Z",
        to: "2023-01-20T23:15:00.000Z",
        value: {
          stripeType: "HOME",
          setting: {
            type: "HEATING",
            power: "ON",
            temperature: {
              celsius: 18.0,
              fahrenheit: 64.4,
            },
          },
        },
      },
    ],
  },
  settings: {
    timeSeriesType: "dataIntervals",
    valueType: "heatingSetting",
    dataIntervals: [
      {
        from: "2023-01-19T22:45:00.000Z",
        to: "2023-01-19T23:00:00.000Z",
        value: {
          type: "HEATING",
          power: "ON",
          temperature: {
            celsius: 21.5,
            fahrenheit: 70.7,
          },
        },
      },
      {
        from: "2023-01-20T23:00:00.000Z",
        to: "2023-01-20T23:15:00.000Z",
        value: {
          type: "HEATING",
          power: "ON",
          temperature: {
            celsius: 18.0,
            fahrenheit: 64.4,
          },
        },
      },
    ],
  },
  callForHeat: {
    timeSeriesType: "dataIntervals",
    valueType: "callForHeat",
    dataIntervals: [
      {
        from: "2023-01-19T22:45:00.000Z",
        to: "2023-01-20T08:19:34.488Z",
        value: "NONE",
      },
      {
        from: "2023-01-20T17:38:20.071Z",
        to: "2023-01-20T23:15:00.000Z",
        value: "NONE",
      },
    ],
  },
  weather: {
    condition: {
      timeSeriesType: "dataIntervals",
      valueType: "weatherCondition",
      dataIntervals: [
        {
          from: "2023-01-19T22:45:00.000Z",
          to: "2023-01-19T22:59:22.983Z",
          value: {
            state: "NIGHT_CLOUDY",
            temperature: {
              celsius: -4.45,
              fahrenheit: 23.99,
            },
          },
        },
        {
          from: "2023-01-20T23:14:24.373Z",
          to: "2023-01-20T23:15:00.000Z",
          value: {
            state: "NIGHT_CLOUDY",
            temperature: {
              celsius: -1.84,
              fahrenheit: 28.69,
            },
          },
        },
      ],
    },
    sunny: {
      timeSeriesType: "dataIntervals",
      valueType: "boolean",
      dataIntervals: [
        {
          from: "2023-01-19T22:45:00.000Z",
          to: "2023-01-20T23:15:00.000Z",
          value: false,
        },
      ],
    },
    slots: {
      timeSeriesType: "slots",
      valueType: "weatherCondition",
      slots: {
        "04:00": {
          state: "NIGHT_CLOUDY",
          temperature: {
            celsius: -4.45,
            fahrenheit: 23.99,
          },
        },
        "08:00": {
          state: "SCATTERED_SNOW",
          temperature: {
            celsius: -4.84,
            fahrenheit: 23.29,
          },
        },
        "12:00": {
          state: "SCATTERED_SNOW",
          temperature: {
            celsius: -1.72,
            fahrenheit: 28.9,
          },
        },
        "16:00": {
          state: "SCATTERED_SNOW",
          temperature: {
            celsius: 0.15,
            fahrenheit: 32.27,
          },
        },
        "20:00": {
          state: "NIGHT_CLOUDY",
          temperature: {
            celsius: -1.84,
            fahrenheit: 28.69,
          },
        },
      },
    },
  },
};
