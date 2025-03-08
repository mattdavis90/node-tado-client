import type { Me } from "../src";
import type { BaseTado } from "../src/base";

import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import { Tado, TadoX } from "../src";
import auth_response from "./response/auth.json";
import device_authorise from "./response/device_authorise.json";
import me_response from "./response/me.json";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Low-level API tests", function () {
  const tests = [
    {
      title: "Tado",
      getTado: (): BaseTado => {
        return new Tado(undefined, true);
      },
    },
    {
      title: "TadoX",
      getTado: (): BaseTado => {
        return new TadoX(undefined, true);
      },
    },
  ];

  tests.forEach(({ title, getTado }) => {
    describe(title, function () {
      afterEach(async function () {
        nock.cleanAll();
      });

      it('Login and get "me"', async function () {
        nock("https://login.tado.com")
          .post("/oauth2/device_authorize")
          .query(true)
          .reply(200, device_authorise)
          .post("/oauth2/token")
          .query(true)
          .reply(200, auth_response);
        nock("https://my.tado.com").get("/api/v2/me").reply(200, me_response);

        const tado = getTado();
        const response = await tado.apiCall<Me>("/api/v2/me");

        expect(typeof response).to.equal("object");
        expect(response.name).to.equal("John Doe");
      });

      it('Login and fail to get "me"', async function () {
        nock("https://login.tado.com")
          .post("/oauth2/device_authorize")
          .query(true)
          .reply(200, device_authorise)
          .post("/oauth2/token")
          .query(true)
          .reply(200, auth_response);
        nock("https://my.tado.com").get("/api/v2/me").reply(500, {});

        const tado = new Tado(undefined, true);

        await expect(tado.apiCall<Me>("/api/v2/me")).to.be.rejectedWith(Error);
      });
    });
  });
});
