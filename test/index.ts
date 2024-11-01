import type { Me } from "../src";

import { expect } from "chai";
import nock from "nock";
import { Tado } from "../src";
import auth_response from "./response.auth.json";
import away_configuration_response from "./response.away.json";
import devices_response from "./response.devices.json";
import devices_offset_response from "./response.devices.offset.json";
import eneryIQConsumptionDetails_response from "./response.energyIQConsumptionDetails.json";
import eneryIQOverview_response from "./response.energyIQOverview.json";
import eneryIQ_meter_readings_response from "./response.eneryIQ.meterReadings.json";
import eneryIQ_savings_response from "./response.eneryIQ.savings.json";
import eneryIQ_tariff_response from "./response.eneryIQ.tariff.json";
import home_response from "./response.home.json";
import installations_response from "./response.installations.json";
import me_response from "./response.me.json";
import mobileDevice_response from "./response.mobileDevice.json";
import mobileDevice_settings_response from "./response.mobileDevice.settings.json";
import mobileDevices_response from "./response.mobileDevices.json";
import mobileDevice_push_notification_registration_response from "./response.pushNotificationRegistration.json";
import state_response from "./response.state.json";
import timetable_response from "./response.timetable.json";
import timetables_response from "./response.timetables.json";
import users_response from "./response.users.json";
import weather_response from "./response.weather.json";
import zone_capabilities_response from "./response.zone.capabilities.json";
import zone_day_report from "./response.zone.dayReport.json";
import zone_overlay_response from "./response.zone.overlay.json";
import zone_state_response from "./response.zone.state.json";
import zones_response from "./response.zones.json";

describe("OAuth2 tests", () => {
  it("Should login", (done) => {
    nock("https://auth.tado.com").post("/oauth/token").reply(200, auth_response);

    const tado = new Tado();

    tado.login("username", "password").then(() => {
      // @ts-expect-error testing private property is intentional
      expect(typeof tado._accessToken).to.equal("object");

      // @ts-expect-error testing private property is intentional
      expect(tado._accessToken?.token.access_token).to.equal("eyJraW0UQ");
      // @ts-expect-error testing private property is intentional
      expect(tado._accessToken?.token.token_type).to.equal("bearer");

      done();
    });
  });

  it("Should fail to login", (done) => {
    nock("https://auth.tado.com").post("/oauth/token").reply(500, {});

    const tado = new Tado();

    tado.login("username", "password").catch((_error) => {
      done();
    });
  });

  it("Should login then refresh token", (done) => {
    nock("https://auth.tado.com").post("/oauth/token").reply(200, auth_response);

    const tado = new Tado();

    tado.login("username", "password").then((_response) => {
      nock("https://auth.tado.com").post("/oauth/token").reply(200, auth_response);

      // Force a refresh
      // @ts-expect-error testing private property is intentional
      tado._accessToken.token.expires_at = new Date();
      tado
        // @ts-expect-error testing private property is intentional
        ._refreshToken()
        .then((_res) => {
          done();
        })
        .catch(done);
    });
  });
});

describe("Low-level API tests", () => {
  it('Login and get "me"', (done) => {
    const tado = new Tado();

    nock("https://auth.tado.com").post("/oauth/token").reply(200, auth_response);
    nock("https://my.tado.com").get("/api/v2/me").reply(200, me_response);

    tado.login("username", "password").then((_response) => {
      tado
        .apiCall<Me>("/api/v2/me")
        .then((response) => {
          expect(typeof response).to.equal("object");
          expect(response.name).to.equal("John Doe");

          done();
        })
        .catch(done);
    });
  });

  it('Don\'t login and get "me"', (done) => {
    const tado = new Tado();

    tado.apiCall<Me>("/api/v2/me").catch((_error) => {
      done();
    });
  });

  it('Login and fail to get "me"', (done) => {
    const tado = new Tado();

    nock("https://auth.tado.com").post("/oauth/token").reply(200, auth_response);
    nock("https://my.tado.com").get("/api/v2/me").reply(500, {});

    tado.login("username", "password").then((_response) => {
      tado
        .apiCall<Me>("/api/v2/me")
        .catch((_error) => {
          done();
        })
        .catch(done);
    });
  });
});

describe("High-level API tests", () => {
  let tado: Tado;

  beforeEach((ready) => {
    tado = new Tado();

    nock("https://auth.tado.com").post("/oauth/token").reply(200, auth_response);

    tado.login("username", "password").then((_res) => {
      ready();
    });
  });

  it("Should get the current user", (done) => {
    nock("https://my.tado.com").get("/api/v2/me").reply(200, me_response);

    tado
      .getMe()
      .then((response) => {
        expect(typeof response).to.equal("object");

        expect(response.name).to.equal("John Doe");

        done();
      })
      .catch(done);
  });

  it("Should get home", (done) => {
    nock("https://my.tado.com").get("/api/v2/homes/1907").reply(200, home_response);

    tado
      .getHome(1907)
      .then((response) => {
        expect(typeof response).to.equal("object");
        expect(response.id).to.equal(1907);
        expect(response.name).to.equal("Dummy Home");
        expect(response.address).to.deep.equals({
          addressLine1: "Museumplein 6",
          addressLine2: null,
          zipCode: "1071",
          city: "Amsterdam",
          state: null,
          country: "NLD",
        });

        done();
      })
      .catch(done);
  });

  it("Should set the home away radius", (done) => {
    const radius = 500.0;

    nock("https://my.tado.com")
      .put("/api/v2/homes/1907/awayRadiusInMeters", (body) => {
        expect(typeof body.awayRadiusInMeters).to.equal("number");
        expect(body.awayRadiusInMeters).to.equal(radius);
        return true;
      })
      .reply(204, "");

    tado
      .setAwayRadius(1907, radius)
      .then((response) => {
        expect(response).to.equal("");
        done();
      })
      .catch(done);
  });

  it("Should get the weather", (done) => {
    nock("https://my.tado.com").get("/api/v2/homes/1907/weather").reply(200, weather_response);

    tado
      .getWeather(1907)
      .then((response) => {
        expect(typeof response).to.equal("object");

        expect(response.weatherState.value).to.equal("DRIZZLE");

        done();
      })
      .catch(done);
  });

  it("Should get the devices", (done) => {
    nock("https://my.tado.com").get("/api/v2/homes/1907/devices").reply(200, devices_response);

    tado
      .getDevices(1907)
      .then((response) => {
        expect(typeof response).to.equal("object");

        expect(response.length).to.equal(1);
        expect(response[0].shortSerialNo).to.equal("RU04932458");

        done();
      })
      .catch(done);
  });

  it("Should get the device temperature offset", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/devices/RU04932458/temperatureOffset")
      .reply(200, devices_offset_response);

    tado
      .getDeviceTemperatureOffset("RU04932458")
      .then((response) => {
        expect(typeof response).to.equal("object");

        expect(response.celsius).to.equal(0.2);
        expect(response.fahrenheit).to.equal(0.2);

        done();
      })
      .catch(done);
  });

  it("Should get the installations", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/installations")
      .reply(200, installations_response);

    tado
      .getInstallations(1907)
      .then((response) => {
        expect(typeof response).to.equal("object");

        expect(response.length).to.equal(1);
        expect(response[0].devices.length).to.equal(1);
        expect(response[0].devices[0].shortSerialNo).to.equal("RU04932458");

        done();
      })
      .catch(done);
  });

  it("Should get the users", (done) => {
    nock("https://my.tado.com").get("/api/v2/homes/1907/users").reply(200, users_response);

    tado
      .getUsers(1907)
      .then((response) => {
        expect(typeof response).to.equal("object");

        expect(response.length).to.equal(1);
        expect(response[0].name).to.equal("John Doe");

        done();
      })
      .catch(done);
  });

  it("should get the home state", (done) => {
    nock("https://my.tado.com").get("/api/v2/homes/1907/state").reply(200, state_response);

    tado
      .getState(1907)
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should get the mobile devices", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/mobileDevices")
      .reply(200, mobileDevices_response);

    tado
      .getMobileDevices(1907)
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should get a mobile device", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/mobileDevices/644583")
      .reply(200, mobileDevice_response);

    tado
      .getMobileDevice(1907, 644583)
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should get a mobile device settings", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/mobileDevices/644583/settings")
      .reply(200, mobileDevice_settings_response);

    tado
      .getMobileDeviceSettings(1907, 644583)
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should register push notification endpoints", (done) => {
    const token = "5ad64f2d-b9a2-47ff-be65-3f3f9327a775";

    nock("https://my.tado.com")
      .put(
        "/api/v2/homes/1907/mobileDevices/644583/pushNotificationRegistration",
        (body): boolean => {
          expect(body).to.deep.equal({
            token: token,
            firebaseProject: "tado-app",
            provider: "FCM",
          });
          return true;
        },
      )
      .reply(200, mobileDevice_push_notification_registration_response);

    tado
      .createPushNotificationRegistration(1907, 644583, token)
      .then((response) => {
        expect(typeof response).to.equal("object");
        expect(response.endpointArnValue).to.equal(
          "arn:aws:sns:eu-west-0:000000000000:endpoint/GCM/Android-Production/e00000d0-0f00-0000-a0e0-00ee00e0b000",
        );
        done();
      })
      .catch(done);
  });

  it("Should get zones", (done) => {
    nock("https://my.tado.com").get("/api/v2/homes/1907/zones").reply(200, zones_response);

    tado
      .getZones(1907)
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should get a zone's state", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/state")
      .reply(200, zone_state_response);

    tado
      .getZoneState(1907, 1)
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should get a zone's capabilities", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/capabilities")
      .reply(200, zone_capabilities_response);

    tado
      .getZoneCapabilities(1907, 1)
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should get a zone's day report", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/dayReport?date=2023-01-19")
      .reply(200, zone_day_report);

    tado
      .getZoneDayReport(1907, 1, "2023-01-19")
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should get a zone's overlay", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/overlay")
      .reply(200, zone_overlay_response);

    tado
      .getZoneOverlay(1907, 1)
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("should get a zone's timetables", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/schedule/activeTimetable")
      .reply(200, timetables_response);

    tado
      .getTimeTables(1907, 1)
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("should get a zone's away configuration", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/awayConfiguration")
      .reply(200, away_configuration_response);

    tado
      .getAwayConfiguration(1907, 1)
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("should set a zone's away configuration", (done) => {
    nock("https://my.tado.com").put("/api/v2/homes/1907/zones/1/awayConfiguration").reply(204);

    tado
      .setAwayConfiguration(1907, 1, {
        type: "HEATING",
        preheatingLevel: "ECO",
        minimumAwayTemperature: {
          celsius: 5.0,
          fahrenheit: 41.0,
        },
      })
      .then((response) => {
        expect(response).to.equal("");
        done();
      })
      .catch(done);
  });

  it("should get a timetable", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/schedule/timetables/0/blocks")
      .reply(200, timetable_response);

    tado
      .getTimeTable(1907, 1, 0)
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should clear a zone's overlay", (done) => {
    nock("https://my.tado.com").delete("/api/v2/homes/1907/zones/1/overlay").reply(200, {});

    tado
      .clearZoneOverlay(1907, 1)
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should set a zone's overlay to Off", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/capabilities")
      .reply(200, zone_capabilities_response);

    nock("https://my.tado.com")
      .put("/api/v2/homes/1907/zones/1/overlay")
      .reply(200, (_uri, req) => {
        return req;
      });

    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/state")
      .reply(200, zone_state_response);

    tado
      .setZoneOverlay(1907, 1, "OFF")
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should set a zone's overlay to On with no temperature", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/capabilities")
      .reply(200, zone_capabilities_response);

    nock("https://my.tado.com")
      .put("/api/v2/homes/1907/zones/1/overlay")
      .reply(200, (_uri, req) => {
        return req;
      });

    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/state")
      .reply(200, zone_state_response);

    tado
      .setZoneOverlay(1907, 1, "ON")
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should set a zone's overlay to On with Timer resume", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/capabilities")
      .reply(200, zone_capabilities_response);

    nock("https://my.tado.com")
      .put("/api/v2/homes/1907/zones/1/overlay")
      .reply(200, (_uri, req) => {
        return req;
      });

    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/state")
      .reply(200, zone_state_response);

    tado
      .setZoneOverlay(1907, 1, "ON", 20, 300)
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should set a zone's overlay to On with Auto resume", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/capabilities")
      .reply(200, zone_capabilities_response);

    nock("https://my.tado.com")
      .put("/api/v2/homes/1907/zones/1/overlay")
      .reply(200, (_uri, req) => {
        return req;
      });

    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/state")
      .reply(200, zone_state_response);

    tado
      .setZoneOverlay(1907, 1, "ON", 20, "AUTO")
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should set a zone's overlay to On until next time block ", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/capabilities")
      .reply(200, zone_capabilities_response);

    nock("https://my.tado.com")
      .put("/api/v2/homes/1907/zones/1/overlay")
      .reply(200, (_uri, req) => {
        return req;
      });

    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/state")
      .reply(200, zone_state_response);

    tado
      .setZoneOverlay(1907, 1, "ON", 20, "NEXT_TIME_BLOCK")
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should set a device's temperature offset", (done) => {
    nock("https://my.tado.com")
      .put("/api/v2/devices/RU04932458/temperatureOffset")
      .reply(200, (_uri, req) => {
        return req;
      });

    tado
      .setDeviceTemperatureOffset("RU04932458", 0.2)
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should get identify a device", (done) => {
    nock("https://my.tado.com").post("/api/v2/devices/RU04932458/identify").reply(200, {});

    tado
      .identifyDevice("RU04932458")
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should get getEnergyIQOverview", (done) => {
    nock("https://energy-insights.tado.com")
      .get("/api/homes/1907/consumptionOverview?month=2024-10")
      .reply(200, eneryIQOverview_response);

    tado
      .getEnergyIQOverview(1907, 10, 2024)
      .then((response) => {
        expect(typeof response).to.equal("object");
        done();
      })
      .catch(done);
  });

  it("Should get getEnergyIQConsumptionDetails", (done) => {
    nock("https://energy-insights.tado.com")
      .get("/api/homes/1907/consumptionDetails?month=2024-10")
      .reply(200, eneryIQConsumptionDetails_response);

    tado
      .getEnergyIQConsumptionDetails(1907, 10, 2024)
      .then((response) => {
        expect(typeof response).to.equal("object");
        expect(response.summary.averageDailyCostInCents).to.equal(164.7665);
        expect(response.graphConsumption).to.deep.equal(eneryIQOverview_response);
        done();
      })
      .catch(done);
  });

  it("Should get energyIQ Tariff", (done) => {
    nock("https://energy-insights.tado.com")
      .get("/api/homes/1907/tariffs")
      .reply(200, eneryIQ_tariff_response);

    tado
      .getEnergyIQTariff(1907)
      .then((response) => {
        expect(typeof response).to.equal("object");
        done();
      })
      .catch(done);
  });

  it("Should update energyIQ Tariff", (done) => {
    nock("https://energy-insights.tado.com")
      .put("/api/homes/1907/tariffs/tariff-id")
      .reply(200, (_uri, req) => {
        return req;
      });

    tado
      .updateEnergyIQTariff(1907, "tariff-id", "m3", "1/1/1970", "2/1/1970", 1)
      .then((response) => {
        expect(typeof response).to.equal("object");
        done();
      })
      .catch(done);
  });

  it("Should get energyIQ meter readings", (done) => {
    nock("https://energy-insights.tado.com")
      .get("/api/homes/1907/meterReadings")
      .reply(200, eneryIQ_meter_readings_response);

    tado
      .getEnergyIQMeterReadings(1907)
      .then((response) => {
        expect(typeof response).to.equal("object");
        done();
      })
      .catch(done);
  });

  it("Should add energyIQ meter readings", (done) => {
    nock("https://energy-insights.tado.com")
      .post("/api/homes/1907/meterReadings")
      .reply(200, (_uri, req) => {
        return req;
      });

    tado
      .addEnergyIQMeterReading(1907, "2022-01-05", 6813)
      .then((response) => {
        expect(typeof response).to.equal("object");
        done();
      })
      .catch(done);
  });

  it("Should get energyIQ savings", (done) => {
    nock("https://energy-bob.tado.com")
      .get("/1907/2021-11?country=NLD")
      .reply(200, eneryIQ_savings_response);

    tado
      .getEnergySavingsReport(1907, 2021, 11, "NLD")
      .then((response) => {
        expect(typeof response).to.equal("object");
        done();
      })
      .catch(done);
  });

  it("Should allow boosting heating of all rooms", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/capabilities")
      .reply(200, zone_capabilities_response);

    nock("https://my.tado.com")
      .post("/api/v2/homes/1907/overlay", (body): boolean => {
        expect(body).to.deep.equal({
          overlays: [
            {
              overlay: {
                setting: {
                  isBoost: true,
                  power: "ON",
                  temperature: {
                    celsius: 25,
                    fahrenheit: 77,
                  },
                  type: "HEATING",
                },
                termination: {
                  typeSkillBasedApp: "TIMER",
                  durationInSeconds: 1800,
                },
              },
              room: 1,
            },
          ],
        });
        return true;
      })
      .reply(204, {});

    tado
      .setZoneOverlays(
        1907,
        [
          {
            isBoost: true,
            power: "ON",
            temperature: {
              celsius: 25,
              fahrenheit: 77,
            },
            zone_id: 1,
          },
        ],
        1800,
      )
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });

  it("Should allow setting overlay with only celsius", (done) => {
    nock("https://my.tado.com")
      .get("/api/v2/homes/1907/zones/1/capabilities")
      .reply(200, zone_capabilities_response);

    nock("https://my.tado.com").post("/api/v2/homes/1907/overlay").reply(204, {});

    tado
      .setZoneOverlays(
        1907,
        [
          {
            power: "ON",
            temperature: {
              celsius: 25,
            },
            zone_id: 1,
          },
        ],
        "AUTO",
      )
      .then((response) => {
        expect(typeof response).to.equal("object");

        done();
      })
      .catch(done);
  });
});
