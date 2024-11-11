import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import { TadoX } from "../src";
import auth_response from "./response/auth.json";
import me_response from "./response/me.json";
import zone_capabilities_response from "./response/zone.capabilities.json";
import zone_state_response from "./response/zone.state.json";
import zones_response from "./response/zones.json";

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
      nock("https://hops.tado.com").get("/homes/1907/roomsAndDevices").reply(200, me_response);

      const response = await tado.getRoomsAndDevices(1907);

      expect(typeof response).to.equal("object");
    });

    it("Should get zones", async function () {
      nock("https://hops.tado.com").get("/homes/1907/rooms").reply(200, zones_response);

      const response = await tado.getRooms(1907);

      expect(typeof response).to.equal("object");
    });

    it("Should get a zone's state", async function () {
      nock("https://hops.tado.com").get("/homes/1907/rooms/1").reply(200, zone_state_response);

      const response = await tado.getRoomState(1907, 1);

      expect(typeof response).to.equal("object");
    });

    it("Should clear a zone's overlay", async function () {
      nock("https://hops.tado.com").post("/homes/1907/rooms/1/resumeSchedule").reply(200, {});

      const response = await tado.resumeSchedule(1907, 1);

      expect(typeof response).to.equal("object");
    });

    it("Should set a zone's overlay to Off", async function () {
      nock("https://my.tado.com")
        .get("/api/v2/homes/1907/zones/1/capabilities")
        .reply(200, zone_capabilities_response);

      nock("https://hops.tado.com")
        .post("/homes/1907/rooms/1/manualControl")
        .reply(200, (_uri, req) => {
          return req;
        });

      const response = await tado.manualControl(1907, 1, "OFF");

      expect(typeof response).to.equal("object");
    });
  });
});
