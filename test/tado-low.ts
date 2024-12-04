import type { Me } from "../src";

import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import { Tado, TadoX } from "../src";
import auth_response from "./response/auth.json";
import me_response from "./response/me.json";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("Low-level API tests", function () {
  const tests = [
    {
      title: "Tado",
      getTado: (): Tado => {
        return new Tado();
      },
    },
    {
      title: "TadoX",
      getTado: (): Tado => {
        return new TadoX();
      },
    },
  ];

  tests.forEach(({ title, getTado }) => {
    describe(title, function () {
      afterEach(async function () {
        nock.cleanAll();
      });

      it('Login and get "me"', async function () {
        nock("https://auth.tado.com").post("/oauth/token").reply(200, auth_response);
        nock("https://my.tado.com").get("/api/v2/me").reply(200, me_response);

        const tado = getTado();
        await tado.login("username", "password");
        const response = await tado.apiCall<Me>("/api/v2/me");

        expect(typeof response).to.equal("object");
        expect(response.name).to.equal("John Doe");
      });

      it('Don\'t login and get "me"', async function () {
        const tado = new Tado();

        await expect(tado.apiCall<Me>("/api/v2/me")).to.be.rejectedWith(Error);
      });

      it('Login and fail to get "me"', async function () {
        nock("https://auth.tado.com").post("/oauth/token").reply(200, auth_response);
        nock("https://my.tado.com").get("/api/v2/me").reply(500, {});

        const tado = new Tado();
        await tado.login("username", "password");

        await expect(tado.apiCall<Me>("/api/v2/me")).to.be.rejectedWith(Error);
      });
    });
  });
});
