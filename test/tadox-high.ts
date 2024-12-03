import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import { TadoX } from "../src";
import actionable_devices_response from "./response_x/actionableDevices.json";
import away_configuration_response from "./response_x/away.json";
import features_response from "./response_x/features.json";
import rooms_response from "./response_x/getRooms.json";
import rooms_and_devices_response from "./response_x/getRoomsAndDevices.json";
import room_state_response from "./response_x/getRoomState.json";
import resume_schedule_response from "./response_x/resumeSchedule.json";
import auth_response from "./response/auth.json";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("High-level API tests (TadoX)", async function () {
  describe("TadoX", function () {
    let tado: TadoX;

    beforeEach(async function () {
      nock("https://auth.tado.com").post("/oauth/token").reply(200, auth_response);

      tado = new TadoX();
      await tado.login("username", "password");
    });

    afterEach(async function () {
      nock.cleanAll();
    });

    it("Should get the user's devices", async function () {
      nock("https://hops.tado.com")
        .get("/homes/1907/roomsAndDevices")
        .reply(200, rooms_and_devices_response);

      const response = await tado.getRoomsAndDevices(1907);

      expect(typeof response).to.equal("object");
    });

    it("Should get zones", async function () {
      nock("https://hops.tado.com").get("/homes/1907/rooms").reply(200, rooms_response);

      const response = await tado.getRooms(1907);

      expect(typeof response).to.equal("object");
    });

    it("Should get a zone's state", async function () {
      nock("https://hops.tado.com").get("/homes/1907/rooms/1").reply(200, room_state_response);

      const response = await tado.getRoomState(1907, 1);

      expect(typeof response).to.equal("object");
    });

    it("Should clear a zone's overlay", async function () {
      nock("https://hops.tado.com")
        .post("/homes/1907/rooms/1/resumeSchedule")
        .reply(200, resume_schedule_response);

      const response = await tado.resumeSchedule(1907, 1);

      expect(typeof response).to.equal("string");
    });

    it("Should set a zone's overlay to Off", async function () {
      nock("https://hops.tado.com").get("/homes/1907/rooms/1").reply(200, room_state_response);

      nock("https://hops.tado.com")
        .post("/homes/1907/rooms/1/manualControl")
        .reply(200, (_uri, req) => {
          return req;
        });

      const response = await tado.manualControl(1907, 1, "OFF", "MANUAL");

      expect(response).to.deep.equal({
        setting: {
          power: "OFF",
          temperature: null,
        },
        termination: {
          type: "MANUAL",
        },
      });
    });

    it("Should set a zone's overlay to 18C manual termination", async function () {
      nock("https://hops.tado.com").get("/homes/1907/rooms/1").reply(200, room_state_response);

      nock("https://hops.tado.com")
        .post("/homes/1907/rooms/1/manualControl")
        .reply(200, (_uri, req) => {
          return req;
        });

      const response = await tado.manualControl(1907, 1, "ON", "MANUAL", 18);

      expect(response).to.deep.equal({
        setting: {
          power: "ON",
          temperature: {
            value: 18,
            precision: 0.1,
          },
        },
        termination: {
          type: "MANUAL",
        },
      });
    });

    it("Should set a zone's overlay to 18C next_time_block", async function () {
      nock("https://hops.tado.com").get("/homes/1907/rooms/1").reply(200, room_state_response);

      nock("https://hops.tado.com")
        .post("/homes/1907/rooms/1/manualControl")
        .reply(200, (_uri, req) => {
          return req;
        });

      const response = await tado.manualControl(1907, 1, "ON", "NEXT_TIME_BLOCK", 18);

      expect(response).to.deep.equal({
        setting: {
          power: "ON",
          temperature: {
            value: 18,
            precision: 0.1,
          },
        },
        termination: {
          type: "NEXT_TIME_BLOCK",
        },
      });
    });

    it("Should set a zone's overlay to 18C timed", async function () {
      nock("https://hops.tado.com").get("/homes/1907/rooms/1").reply(200, room_state_response);

      nock("https://hops.tado.com")
        .post("/homes/1907/rooms/1/manualControl")
        .reply(200, (_uri, req) => {
          return req;
        });

      const response = await tado.manualControl(1907, 1, "ON", 3600, 18);

      expect(response).to.deep.equal({
        setting: {
          power: "ON",
          temperature: {
            value: 18,
            precision: 0.1,
          },
        },
        termination: {
          type: "TIMER",
          durationInSeconds: 3600,
        },
      });
    });

    it("should get a room's away configuration", async function () {
      nock("https://hops.tado.com")
        .get("/homes/1907/settings/away/rooms/1")
        .reply(200, away_configuration_response);

      const response = await tado.getAwayConfiguration(1907, 1);

      expect(typeof response).to.equal("object");
    });

    it("should set a room's away configuration", async function () {
      nock("https://hops.tado.com").put("/homes/1907/settings/away/rooms/1").reply(204);

      const response = await tado.setAwayConfiguration(1907, 1, {
        mode: "ON",
        awayTemperatureCelsius: 18.0,
      });

      expect(response).to.equal("");
    });

    it("Should set a device's temperature offset", async function () {
      const device_serial_number = "RU04932458";

      nock("https://hops.tado.com")
        .patch(`/homes/1907/roomsAndDevices/devices/${device_serial_number}`)
        .reply(200, (_uri, req) => {
          return req;
        });

      const response = await tado.setDeviceTemperatureOffset(1907, device_serial_number, 0.2);

      expect(typeof response).to.equal("object");
    });

    it("should check if home is domestic hot water capable", async function () {
      nock("https://hops.tado.com")
        .get("/homes/1907/programmer/domesticHotWater")
        .reply(200, { isDomesticHotWaterCapable: true });

      const response = await tado.isDomesticHotWaterCapable(1907);

      expect(response).to.equal(true);
    });

    it("should set device child lock", async function () {
      const device_serial_number = "RU04932458";

      nock("https://hops.tado.com")
        .patch(`/homes/1907/roomsAndDevices/devices/${device_serial_number}`)
        .reply(204);

      const response = await tado.setChildlock(1907, device_serial_number, true);

      expect(response).to.equal("");
    });

    it("should get actionable devices", async function () {
      nock("https://hops.tado.com")
        .get("/homes/1907/actionableDevices")
        .reply(200, actionable_devices_response);

      const response = await tado.getActionableDevices(1907);

      expect(typeof response).to.equal("object");
      expect(response.length).to.equal(2);
    });

    it("should get features", async function () {
      nock("https://hops.tado.com").get("/homes/1907/features").reply(200, features_response);

      const response = await tado.getFeatures(1907);

      expect(typeof response).to.equal("object");
      expect(response.availableFeatures.length).to.equal(3);
    });

    it("should perform action (allOff)", async function () {
      const action = "allOff";
      nock("https://hops.tado.com")
        .post(`/homes/1907/quickActions/${action}`)
        .reply(200, (_uri, req) => {
          return req;
        });

      const response = await tado.performQuickAction(1907, action);

      expect(typeof response).to.equal("object");
    });

    it("should perform action (boost)", async function () {
      const action = "boost";
      nock("https://hops.tado.com")
        .post(`/homes/1907/quickActions/${action}`)
        .reply(200, (_uri, req) => {
          return req;
        });

      const response = await tado.performQuickAction(1907, action);

      expect(typeof response).to.equal("object");
    });

    it("should perform action (resumeSchedule)", async function () {
      const action = "resumeSchedule";
      nock("https://hops.tado.com")
        .post(`/homes/1907/quickActions/${action}`)
        .reply(200, (_uri, req) => {
          return req;
        });

      const response = await tado.performQuickAction(1907, action);

      expect(typeof response).to.equal("object");
    });
  });
});
