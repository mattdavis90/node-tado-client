import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import nock from "nock";
import { Tado, TadoX } from "../src";
import { BaseTado } from "../src/base";
import auth_response from "./response/auth.json";
import boiler_information_response from "./response/boilerInformation.json";
import device_authorise from "./response/device_authorise.json";
import early_start_response from "./response/earlyStart.json";
import eneryIQConsumptionDetails_response from "./response/energyIQConsumptionDetails.json";
import eneryIQOverview_response from "./response/energyIQOverview.json";
import eneryIQ_meter_readings_response from "./response/eneryIQ.meterReadings.json";
import eneryIQ_savings_response from "./response/eneryIQ.savings.json";
import eneryIQ_tariff_response from "./response/eneryIQ.tariff.json";
import heating_system_response from "./response/heatingSystem.json";
import home_response from "./response/home.json";
import incident_detection_response from "./response/incidentDetection.json";
import installations_response from "./response/installations.json";
import invitations_response from "./response/invitations.json";
import me_response from "./response/me.json";
import mobileDevice_response from "./response/mobileDevice.json";
import mobileDevice_settings_response from "./response/mobileDevice.settings.json";
import mobileDevice_geoLocation_config_response from "./response/mobileDeviceGeoLocationConfig.json";
import mobileDevices_response from "./response/mobileDevices.json";
import mobileDevice_push_notification_registration_response from "./response/pushNotificationRegistration.json";
import state_response from "./response/state.json";
import users_response from "./response/users.json";
import weather_response from "./response/weather.json";

chai.use(chaiAsPromised);
const expect = chai.expect;

describe("High-level API tests (common)", function () {
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
      let tado: BaseTado;

      beforeEach(async function () {
        nock("https://login.tado.com")
          .post("/oauth2/device_authorize")
          .query(true)
          .reply(200, device_authorise)
          .post("/oauth2/token")
          .query(true)
          .reply(200, auth_response);

        tado = getTado();
        const [_, futureToken] = await tado.authenticate();
        await futureToken;
      });

      afterEach(async function () {
        nock.cleanAll();
      });

      it("Should get the current user", async function () {
        nock("https://my.tado.com").get("/api/v2/me").reply(200, me_response);

        const response = await tado.getMe();

        expect(typeof response).to.equal("object");
        expect(response.name).to.equal("John Doe");
      });

      it("Should get home", async function () {
        nock("https://my.tado.com").get("/api/v2/homes/1907").reply(200, home_response);

        const response = await tado.getHome(1907);

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
      });

      it("Should set the home away radius", async function () {
        const radius = 500.0;

        nock("https://my.tado.com")
          .put("/api/v2/homes/1907/awayRadiusInMeters", (body) => {
            expect(typeof body.awayRadiusInMeters).to.equal("number");
            expect(body.awayRadiusInMeters).to.equal(radius);
            return true;
          })
          .reply(204, "");

        const response = await tado.setAwayRadius(1907, radius);

        expect(response).to.equal("");
      });

      it("Should get incident detection status", async function () {
        nock("https://my.tado.com")
          .get("/api/v2/homes/1907/incidentDetection")
          .reply(200, incident_detection_response);

        const response = await tado.getIncidentDetection(1907);

        expect(response.supported).to.equal(true);
        expect(response.enabled).to.equal(true);
      });

      it("Should set incident detection status", async function () {
        nock("https://my.tado.com")
          .put("/api/v2/homes/1907/incidentDetection", (body) => {
            expect(Object.keys(body)).to.deep.equal(["enabled"]);
            expect(body.enabled).to.equal(false);
            return true;
          })
          .reply(204, "");

        const response = await tado.setIncidentDetection(1907, false);

        expect(response).to.equal("");
      });

      it("Should get early start enabled value", async function () {
        nock("https://my.tado.com")
          .get("/api/v2/homes/1907/earlyStart")
          .reply(200, early_start_response);

        const response = await tado.isEarlyStartEnabled(1907);

        expect(response).to.equal(true);
      });

      it("Should set early state enabled value", async function () {
        nock("https://my.tado.com")
          .put("/api/v2/homes/1907/earlyStart", (body) => {
            expect(Object.keys(body)).to.deep.equal(["enabled"]);
            expect(body.enabled).to.equal(false);
            return true;
          })
          .reply(204, "");

        const response = await tado.setEarlyStart(1907, false);

        expect(response).to.equal("");
      });

      it("Should get the weather", async function () {
        nock("https://my.tado.com")
          .get("/api/v2/homes/1907/weather")
          .reply(200, weather_response);

        const response = await tado.getWeather(1907);

        expect(typeof response).to.equal("object");
        expect(response.weatherState.value).to.equal("DRIZZLE");
      });

      it("Should get the installations", async function () {
        nock("https://my.tado.com")
          .get("/api/v2/homes/1907/installations")
          .reply(200, installations_response);

        const response = await tado.getInstallations(1907);

        expect(typeof response).to.equal("object");
        expect(response.length).to.equal(1);
        expect(response[0].devices.length).to.equal(1);
        expect(response[0].devices[0].shortSerialNo).to.equal("RU04932458");
      });

      it("Should get the invitations", async function () {
        nock("https://my.tado.com")
          .get("/api/v2/homes/1907/invitations")
          .reply(200, invitations_response);

        const response = await tado.getInvitations(1907);

        expect(typeof response).to.equal("object");
        expect(response.length).to.equal(1);
        expect(response[0].email).to.equal("person@example.com");
      });

      it("Should get a single invitation", async function () {
        const invitation_token = "12345";
        const response_body = invitations_response[0];
        response_body.token = invitation_token;

        nock("https://my.tado.com")
          .get(`/api/v2/homes/1907/invitations/${invitation_token}`)
          .reply(200, response_body);

        const response = await tado.getInvitation(1907, invitation_token);

        expect(typeof response).to.equal("object");
        expect(response.token).to.equal(invitation_token);
      });

      it("Should create an invitation", async function () {
        const invitation = { email: "person@example.com" };

        nock("https://my.tado.com")
          .post("/api/v2/homes/1907/invitations", (body) => {
            expect(body).to.deep.equal(invitation);
            return true;
          })
          .reply(200, invitations_response[0]);

        const response = await tado.createInvitation(1907, invitation.email);

        expect(typeof response).to.equal("object");
        expect(response.email).to.equal(invitation.email);
      });

      it("Should delete an invitation", async function () {
        const invitation_token = "12345";

        nock("https://my.tado.com")
          .delete(`/api/v2/homes/1907/invitations/${invitation_token}`)
          .reply(204);

        const response = await tado.deleteInvitation(1907, invitation_token);

        expect(response).to.equal("");
      });

      it("Should resend an invitation", async function () {
        const invitation_token = "12345";

        nock("https://my.tado.com")
          .post(`/api/v2/homes/1907/invitations/${invitation_token}/resend`, (body) => {
            expect(body).to.deep.equal({});
            return true;
          })
          .reply(204);

        const response = await tado.resendInvitation(1907, invitation_token);

        expect(response).to.equal("");
      });

      it("Should get the users", async function () {
        nock("https://my.tado.com").get("/api/v2/homes/1907/users").reply(200, users_response);

        const response = await tado.getUsers(1907);

        expect(typeof response).to.equal("object");
        expect(response.length).to.equal(1);
        expect(response[0].name).to.equal("John Doe");
      });

      it("should get the home state", async function () {
        nock("https://my.tado.com").get("/api/v2/homes/1907/state").reply(200, state_response);

        const response = await tado.getState(1907);

        expect(typeof response).to.equal("object");
      });

      it("Should get the mobile devices", async function () {
        nock("https://my.tado.com")
          .get("/api/v2/homes/1907/mobileDevices")
          .reply(200, mobileDevices_response);

        const response = await tado.getMobileDevices(1907);

        expect(typeof response).to.equal("object");
      });

      it("Should get a mobile device", async function () {
        nock("https://my.tado.com")
          .get("/api/v2/homes/1907/mobileDevices/644583")
          .reply(200, mobileDevice_response);

        const response = await tado.getMobileDevice(1907, 644583);

        expect(typeof response).to.equal("object");
      });

      it("Should get a mobile device settings", async function () {
        nock("https://my.tado.com")
          .get("/api/v2/homes/1907/mobileDevices/644583/settings")
          .reply(200, mobileDevice_settings_response);

        const response = await tado.getMobileDeviceSettings(1907, 644583);

        expect(typeof response).to.equal("object");
      });

      it("Should get a mobile device geo-location config", async function () {
        nock("https://my.tado.com")
          .get("/api/v2/homes/1907/mobileDevices/644583/geoLocationConfig")
          .reply(200, mobileDevice_geoLocation_config_response);

        const response = await tado.getMobileDeviceGeoLocationConfig(1907, 644583);

        expect(typeof response).to.equal("object");
        expect(response.home).to.deep.equal({
          geolocation: {
            latitude: 51.2993,
            longitude: 9.491,
          },
          region: 100,
          wifiRegion: 1900,
        });
      });

      it("Should register push notification endpoints", async function () {
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

        const response = await tado.createPushNotificationRegistration(1907, 644583, token);

        expect(typeof response).to.equal("object");
        expect(response.endpointArnValue).to.equal(
          "arn:aws:sns:eu-west-0:000000000000:endpoint/GCM/Android-Production/e00000d0-0f00-0000-a0e0-00ee00e0b000",
        );
      });

      it("Should get getEnergyIQOverview", async function () {
        nock("https://energy-insights.tado.com")
          .get("/api/homes/1907/consumptionOverview?month=2024-10")
          .reply(200, eneryIQOverview_response);

        const response = await tado.getEnergyIQOverview(1907, 10, 2024);

        expect(typeof response).to.equal("object");
      });

      it("Should get getEnergyIQConsumptionDetails", async function () {
        nock("https://energy-insights.tado.com")
          .get("/api/homes/1907/consumptionDetails?month=2024-10")
          .reply(200, eneryIQConsumptionDetails_response);

        const response = await tado.getEnergyIQConsumptionDetails(1907, 10, 2024);

        expect(typeof response).to.equal("object");
        expect(response.summary.averageDailyCostInCents).to.equal(164.7665);
        expect(response.graphConsumption).to.deep.equal(eneryIQOverview_response);
      });

      it("Should get energyIQ Tariff", async function () {
        nock("https://energy-insights.tado.com")
          .get("/api/homes/1907/tariffs")
          .reply(200, eneryIQ_tariff_response);

        const response = await tado.getEnergyIQTariff(1907);

        expect(typeof response).to.equal("object");
      });

      it("Should update energyIQ Tariff", async function () {
        nock("https://energy-insights.tado.com")
          .put("/api/homes/1907/tariffs/tariff-id")
          .reply(200, (_uri, req) => {
            return req;
          });

        const response = await tado.updateEnergyIQTariff(
          1907,
          "tariff-id",
          "m3",
          "1/1/1970",
          "2/1/1970",
          1,
        );

        expect(typeof response).to.equal("object");
      });

      it("Should get energyIQ meter readings", async function () {
        nock("https://energy-insights.tado.com")
          .get("/api/homes/1907/meterReadings")
          .reply(200, eneryIQ_meter_readings_response);

        const response = await tado.getEnergyIQMeterReadings(1907);

        expect(typeof response).to.equal("object");
      });

      it("Should add energyIQ meter readings", async function () {
        nock("https://energy-insights.tado.com")
          .post("/api/homes/1907/meterReadings")
          .reply(200, (_uri, req) => {
            return req;
          });

        const response = await tado.addEnergyIQMeterReading(1907, "2022-01-05", 6813);

        expect(typeof response).to.equal("object");
      });

      it("Should get energyIQ savings", async function () {
        nock("https://energy-bob.tado.com")
          .get("/1907/2021-11?country=NLD")
          .reply(200, eneryIQ_savings_response);

        const response = await tado.getEnergySavingsReport(1907, 2021, 11, "NLD");

        expect(typeof response).to.equal("object");
      });

      it("should get home heating system information", async function () {
        nock("https://my.tado.com")
          .get("/api/v2/homes/1907/heatingSystem")
          .reply(200, heating_system_response);

        const response = await tado.getHomeHeatingSystem(1907);

        expect(typeof response).to.equal("object");
        expect(response.boiler.id).to.equal(2017);
        expect(response.boiler.present).to.equal(true);
        expect(response.boiler.found).to.equal(true);
        expect(response.underfloorHeating.present).to.equal(false);
      });

      it("should get boiler system information", async function () {
        nock("https://ivar.tado.com")
          .post("/graphql", (body): boolean => {
            expect(body.query).to.equal(
              "{ system(id: 2017) { modelName shortModelName: modelName(type: SHORT) thumbnail { schematic { url } } manufacturers { name } } }",
            );
            return true;
          })
          .reply(200, boiler_information_response);

        const response = await tado.getBoilerSystemInformation(2017);

        expect(typeof response).to.equal("object");
        expect(response.modelName).to.equal("ZR/ZSR/ZWR ..-2");
        expect(response.manufacturers.length).to.equal(1);
        expect(response.manufacturers[0].name).to.equal("Junkers");
      });
    });
  });
});
