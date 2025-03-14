import type { BaseTado } from "../src/base";

import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import { Tado, TadoX } from "../src";
import auth_response from "./response/auth.json";
import device_authorise from "./response/device_authorise.json";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("OAuth2 tests", function () {
  const tests = [
    {
      title: "Tado",
      getTado: (): BaseTado => {
        return new Tado();
      },
    },
    {
      title: "TadoX",
      getTado: (): BaseTado => {
        return new TadoX();
      },
    },
  ];

  tests.forEach(({ title, getTado }) => {
    describe(title, function () {
      afterEach(async function () {
        nock.cleanAll();
      });

      it("Should login", async function () {
        nock("https://login.tado.com", { allowUnmocked: false })
          .post("/oauth2/device_authorize")
          .query(true)
          .reply(200, device_authorise)
          .post("/oauth2/token")
          .query(true)
          .reply(200, auth_response);
        nock("https://my.tado.com", { allowUnmocked: false });

        const tado = getTado();
        const [_, futureToken] = await tado.authenticate();
        const token = await futureToken;

        expect(typeof token).to.equal("object");
        expect(token.access_token).to.equal("eyJraW0UQ");
      });
    });
  });
});
