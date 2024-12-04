import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import { Tado, TadoX } from "../src";
import auth_response from "./response/auth.json";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("OAuth2 tests", function () {
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

      it("Should login", async function () {
        nock("https://auth.tado.com").post("/oauth/token").reply(200, auth_response);
        nock("https://my.tado.com", { allowUnmocked: false });

        const tado = getTado();
        await tado.login("username", "password");

        expect(typeof tado.accessToken).to.equal("object");
        expect(tado.accessToken?.token.access_token).to.equal("eyJraW0UQ");
        expect(tado.accessToken?.token.token_type).to.equal("bearer");
      });

      it("Should fail to login", async function () {
        nock("https://auth.tado.com").post("/oauth/token").reply(500, {});

        const tado = getTado();
        await expect(tado.login("username", "password")).to.be.rejectedWith(Error);
      });
    });
  });
});
