import { AxiosError } from "axios";
import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import { Tado } from "../src";
import auth_response from "./response/auth.json";
import away_configuration_response from "./response/away.json";
import device_authorise from "./response/device_authorise.json";
import devices_response from "./response/devices.json";
import devices_offset_response from "./response/devices.offset.json";
import early_start_response from "./response/earlyStart.json";
import timetable_response from "./response/timetable.json";
import timetables_response from "./response/timetables.json";
import zone_capabilities_response from "./response/zone.capabilities.json";
import zone_control_response from "./response/zone.control.json";
import zone_day_report from "./response/zone.dayReport.json";
import zone_default_overlay_response from "./response/zone.defaultOverlay.json";
import zone_overlay_response from "./response/zone.overlay.json";
import zone_state_response from "./response/zone.state.json";
import zone_states_response from "./response/zone.states.json";
import zones_response from "./response/zones.json";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("High-level API tests (v2)", function () {
  describe("Tado", function () {
    let tado: Tado;

    beforeEach(async function () {
      nock("https://login.tado.com")
        .post("/oauth2/device_authorize")
        .query(true)
        .reply(200, device_authorise)
        .post("/oauth2/token")
        .query(true)
        .reply(200, auth_response);

      tado = new Tado();
      const [_, futureToken] = await tado.authenticate();
      await futureToken;
    });

    afterEach(async function () {
      nock.cleanAll();
    });

    it("Should get the devices", async function () {
      nock("https://my.tado.com")
        .get("/api/v2/homes/1907/devices")
        .reply(200, devices_response);

      const response = await tado.getDevices(1907);

      expect(typeof response).to.equal("object");
      expect(response.length).to.equal(1);
      expect(response[0].shortSerialNo).to.equal("RU04932458");
    });

    it("Should get the device temperature offset", async function () {
      nock("https://my.tado.com")
        .get("/api/v2/devices/RU04932458/temperatureOffset")
        .reply(200, devices_offset_response);

      const response = await tado.getDeviceTemperatureOffset("RU04932458");

      expect(typeof response).to.equal("object");
      expect(response.celsius).to.equal(0.2);
      expect(response.fahrenheit).to.equal(0.2);
    });

    it("Should get zones", async function () {
      nock("https://my.tado.com").get("/api/v2/homes/1907/zones").reply(200, zones_response);

      const response = await tado.getZones(1907);

      expect(typeof response).to.equal("object");
    });

    it("Should get a zone's state", async function () {
      nock("https://my.tado.com")
        .get("/api/v2/homes/1907/zones/1/state")
        .reply(200, zone_state_response);

      const response = await tado.getZoneState(1907, 1);

      expect(typeof response).to.equal("object");
    });

    it("Should get a zone's capabilities", async function () {
      nock("https://my.tado.com")
        .get("/api/v2/homes/1907/zones/1/capabilities")
        .reply(200, zone_capabilities_response);

      const response = await tado.getZoneCapabilities(1907, 1);

      expect(typeof response).to.equal("object");
    });

    it("Should get a zone's day report", async function () {
      nock("https://my.tado.com")
        .get("/api/v2/homes/1907/zones/1/dayReport?date=2023-01-19")
        .reply(200, zone_day_report);

      const response = await tado.getZoneDayReport(1907, 1, "2023-01-19");

      expect(typeof response).to.equal("object");
    });

    it("Should get early start enabled value", async () => {
      nock("https://my.tado.com")
        .get("/api/v2/homes/1907/zones/1/earlyStart")
        .reply(200, early_start_response);

      const response = await tado.isZoneEarlyStartEnabled(1907, 1);

      expect(response).to.equal(true);
    });

    it("Should set early state enabled value", async () => {
      nock("https://my.tado.com")
        .put("/api/v2/homes/1907/zones/1/earlyStart", (body) => {
          expect(Object.keys(body)).to.deep.equal(["enabled"]);
          expect(body.enabled).to.equal(false);
          return true;
        })
        .reply(204, "");

      const response = await tado.setZoneEarlyStart(1907, 1, false);

      expect(response).to.equal("");
    });

    it("Should get a zone's overlay", async function () {
      nock("https://my.tado.com")
        .get("/api/v2/homes/1907/zones/1/overlay")
        .reply(200, zone_overlay_response);

      const response = await tado.getZoneOverlay(1907, 1);

      expect(typeof response).to.equal("object");
    });

    it("Should handle 404 when getting zone's overlay", async function () {
      nock("https://my.tado.com")
        .get("/api/v2/homes/1907/zones/1/overlay")
        .reply(404, "Not Found");

      const response = await tado.getZoneOverlay(1907, 1);

      expect(response).deep.equal({});
    });

    it("Should raise non-404 exceptions when getting zone's overlay", async function () {
      nock("https://my.tado.com")
        .get("/api/v2/homes/1907/zones/1/overlay")
        .reply(400, "Bad Request");

      try {
        await tado.getZoneOverlay(1907, 1);
        throw new Error("Exception was not thrown");
      } catch (error) {
        expect(error instanceof AxiosError && error.response?.status !== 404);
      }
    });

    it("should get a zone's timetables", async function () {
      nock("https://my.tado.com")
        .get("/api/v2/homes/1907/zones/1/schedule/activeTimetable")
        .reply(200, timetables_response);

      const response = await tado.getTimeTables(1907, 1);

      expect(typeof response).to.equal("object");
    });

    it("should get a zone's away configuration", async function () {
      nock("https://my.tado.com")
        .get("/api/v2/homes/1907/zones/1/awayConfiguration")
        .reply(200, away_configuration_response);

      const response = await tado.getAwayConfiguration(1907, 1);

      expect(typeof response).to.equal("object");
    });

    it("should set a zone's away configuration", async function () {
      nock("https://my.tado.com")
        .put("/api/v2/homes/1907/zones/1/awayConfiguration")
        .reply(204);

      const response = await tado.setAwayConfiguration(1907, 1, {
        type: "HEATING",
        preheatingLevel: "ECO",
        minimumAwayTemperature: {
          celsius: 5.0,
          fahrenheit: 41.0,
        },
      });

      expect(response).to.equal("");
    });

    it("should get a timetable", async function () {
      nock("https://my.tado.com")
        .get("/api/v2/homes/1907/zones/1/schedule/timetables/0/blocks")
        .reply(200, timetable_response);

      const response = await tado.getTimeTable(1907, 1, 0);

      expect(typeof response).to.equal("object");
    });

    it("Should clear a zone's overlay", async function () {
      nock("https://my.tado.com").delete("/api/v2/homes/1907/zones/1/overlay").reply(200, {});

      const response = await tado.clearZoneOverlay(1907, 1);

      expect(typeof response).to.equal("object");
    });

    it("Should set a zone's overlay to Off", async function () {
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

      const response = await tado.setZoneOverlay(1907, 1, "OFF");

      expect(typeof response).to.equal("object");
    });

    it("Should set a zone's overlay to On with no temperature", async function () {
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

      const response = await tado.setZoneOverlay(1907, 1, "ON");

      expect(typeof response).to.equal("object");
    });

    it("Should set a zone's overlay to On with Timer resume", async function () {
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

      const response = await tado.setZoneOverlay(1907, 1, "ON", 20, 300);

      expect(typeof response).to.equal("object");
    });

    it("Should set a zone's overlay to On with Auto resume", async function () {
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

      const response = await tado.setZoneOverlay(1907, 1, "ON", 20, "AUTO");

      expect(typeof response).to.equal("object");
    });

    it("Should set a zone's overlay to On until next time block ", async function () {
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

      const response = await tado.setZoneOverlay(1907, 1, "ON", 20, "NEXT_TIME_BLOCK");

      expect(typeof response).to.equal("object");
    });

    it("Should set a device's temperature offset", async function () {
      nock("https://my.tado.com")
        .put("/api/v2/devices/RU04932458/temperatureOffset")
        .reply(200, (_uri, req) => {
          return req;
        });

      const response = await tado.setDeviceTemperatureOffset("RU04932458", 0.2);

      expect(typeof response).to.equal("object");
    });

    it("Should get identify a device", async function () {
      nock("https://my.tado.com").post("/api/v2/devices/RU04932458/identify").reply(200, {});

      const response = await tado.identifyDevice("RU04932458");

      expect(typeof response).to.equal("object");
    });

    it("Should allow boosting heating of all rooms", async function () {
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

      const response = await tado.setZoneOverlays(
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
      );

      expect(typeof response).to.equal("object");
    });

    it("Should allow setting overlay with only celsius", async function () {
      nock("https://my.tado.com")
        .get("/api/v2/homes/1907/zones/1/capabilities")
        .reply(200, zone_capabilities_response);

      nock("https://my.tado.com").post("/api/v2/homes/1907/overlay").reply(204, {});

      const response = await tado.setZoneOverlays(
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
      );

      expect(typeof response).to.equal("object");
    });

    it("should set device child lock", async function () {
      const device_serial_number = "RU04932458";

      nock("https://my.tado.com")
        .put(`/api/v2/devices/${device_serial_number}/childLock`)
        .reply(204);

      const response = await tado.setChildlock(device_serial_number, true);

      expect(response).to.equal("");
    });

    it("should get zone control", async function () {
      const home_id = 1907;
      const zone_id = 1;

      nock("https://my.tado.com")
        .get(`/api/v2/homes/${home_id}/zones/${zone_id}/control`)
        .reply(200, zone_control_response);

      const response = await tado.getZoneControl(home_id, zone_id);

      expect(typeof response).to.equal("object");
      expect(response.type).to.equal("HEATING");
      expect(response.earlyStartEnabled).to.equal(true);
      expect(response.heatingCircuit).to.equal(1);
    });

    it("should get zone states", async function () {
      const home_id = 1907;

      nock("https://my.tado.com")
        .get(`/api/v2/homes/${home_id}/zoneStates`)
        .reply(200, zone_states_response);

      const response = await tado.getZoneStates(home_id);

      expect(typeof response).to.equal("object");
    });

    it("should set window detection (true)", async function () {
      const home_id = 1907;
      const zone_id = 1;

      nock("https://my.tado.com")
        .put(`/api/v2/homes/${home_id}/zones/${zone_id}/openWindowDetection`)
        .reply(204);

      const response = await tado.setWindowDetection(home_id, zone_id, true, 10);

      expect(response).to.equal("");
    });

    it("should set window detection (false)", async function () {
      const home_id = 1907;
      const zone_id = 1;

      nock("https://my.tado.com")
        .put(`/api/v2/homes/${home_id}/zones/${zone_id}/openWindowDetection`)
        .reply(204);

      const response = await tado.setWindowDetection(home_id, zone_id, false);

      expect(response).to.equal("");
    });

    it("should set open window mode (true)", async function () {
      const home_id = 1907;
      const zone_id = 1;

      nock("https://my.tado.com")
        .post(`/api/v2/homes/${home_id}/zones/${zone_id}/state/openWindow/activate`)
        .reply(204);

      const response = await tado.setOpenWindowMode(home_id, zone_id, true);

      expect(response).to.equal("");
    });

    it("should set open window mode (false)", async function () {
      const home_id = 1907;
      const zone_id = 1;

      nock("https://my.tado.com")
        .delete(`/api/v2/homes/${home_id}/zones/${zone_id}/state/openWindow`)
        .reply(204);

      const response = await tado.setOpenWindowMode(home_id, zone_id, false);

      expect(response).to.equal("");
    });

    it("should clear zone overlays", async function () {
      const home_id = 1907;
      const zone_ids = [1, 2, 3];
      const rooms = zone_ids.join(",");

      nock("https://my.tado.com")
        .delete(`/api/v2/homes/${home_id}/overlay?rooms=${rooms}`)
        .reply(204);

      const response = await tado.clearZoneOverlays(home_id, zone_ids);

      expect(response).to.equal("");
    });

    it("should get zone default overlay", async function () {
      const home_id = 1907;
      const zone_id = 1;

      nock("https://my.tado.com")
        .get(`/api/v2/homes/${home_id}/zones/${zone_id}/defaultOverlay`)
        .reply(200, zone_default_overlay_response);

      const response = await tado.getZoneDefaultOverlay(home_id, zone_id);

      expect(typeof response).to.equal("object");
      expect(response.terminationCondition.type).to.equal("TADO_MODE");
    });

    it("should set zone default overlay", async function () {
      const home_id = 1907;
      const zone_id = 1;

      nock("https://my.tado.com")
        .put(`/api/v2/homes/${home_id}/zones/${zone_id}/defaultOverlay`)
        .reply(204);

      const response = await tado.setZoneDefaultOverlay(home_id, zone_id, {
        terminationCondition: { type: "TADO_MODE" },
      });

      expect(response).to.equal("");
    });
  });
});
