import type {
  AddEnergiIQMeterReadingResponse,
  AirComfortDetailed,
  BoilerSystemInformation,
  Country,
  DeviceToken,
  DeviceVerification,
  EnergyIQConsumptionDetails,
  EnergyIQMeterReadings,
  EnergyIQOverview,
  EnergyIQTariffInfo,
  EnergyIQTariffs,
  EnergySavingReport,
  HeatingCircuit,
  HeatingSystem,
  Home,
  HomeIncidentDetection,
  Installation,
  Invitation,
  IQUnit,
  Me,
  MobileDevice,
  MobileDeviceGeoLocationConfig,
  MobileDeviceSettings,
  PushNotificationRegistration,
  PushNotificationRegistrationData,
  RateLimit,
  RunningTimeAggregation,
  RunningTimes,
  RunningTimesSummaryOnly,
  State,
  StatePresence,
  Token,
  User,
  Weather,
} from "./types";

import { Agent } from "https";
import axios, { AxiosHeaders, Method } from "axios";
import { Semaphore } from "./semaphore";
import { AuthTimeout, InvalidRefreshToken, NotAuthenticated, TadoError } from "./types";

const tado_url = "https://my.tado.com";
const client_id = "1bb50063-6b0c-4d11-bd99-387f4a91cc46";
const scope = "offline_access";
const grant_type = "urn:ietf:params:oauth:grant-type:device_code";

export class BaseTado {
  #httpsAgent: Agent;
  #token?: Token | undefined;
  #tokenCallback?: (token: Token) => void;
  #semaphore: Semaphore;
  #ratelimit: RateLimit | undefined = undefined;

  constructor() {
    this.#httpsAgent = new Agent({ keepAlive: true });
    this.#semaphore = new Semaphore(1);
  }

  #parseDeviceToken(deviceToken: DeviceToken): Token {
    const expiry = new Date();
    expiry.setSeconds(expiry.getSeconds() + deviceToken.expires_in - 5); // Minus 5 seconds grace

    return {
      access_token: deviceToken.access_token,
      refresh_token: deviceToken.refresh_token,
      expiry,
    };
  }

  async #checkDevice(device_code: string, timeout: number): Promise<Token> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        axios<DeviceToken>({
          url: "https://login.tado.com/oauth2/token",
          method: "POST",
          params: {
            client_id,
            device_code: device_code,
            grant_type,
          },
        })
          .then((resp) => {
            const deviceToken = resp.data;
            resolve(this.#parseDeviceToken(deviceToken));
          })
          .catch(reject);
      }, timeout);
    });
  }

  async #waitForAuth(
    device_code: string,
    interval: number,
    expires_in: number,
  ): Promise<Token> {
    for (let i = 0; i < expires_in; i += interval) {
      try {
        const token = await this.#checkDevice(device_code, interval * 1000);
        this.#token = token;
        this.#tokenCallback?.(token);
        return token;
      } catch {
        // Keep trying, we'll throw later
      }
    }

    throw new AuthTimeout("Timeout waiting for user input");
  }

  async #getToken(): Promise<Token> {
    try {
      await this.#semaphore.acquire();

      if (!this.#token) {
        throw new NotAuthenticated(
          "Tado is not authenticated. Please call the authenticate method.",
        );
      }

      const now = new Date();

      if (this.#token.expiry < now) {
        try {
          const resp = await axios<DeviceToken>({
            url: "https://login.tado.com/oauth2/token",
            method: "POST",
            params: {
              client_id,
              grant_type: "refresh_token",
              refresh_token: this.#token.refresh_token,
            },
          });

          const token = this.#parseDeviceToken(resp.data);
          this.#token = token;
          this.#tokenCallback?.(token);
          return token;
        } catch {
          throw new InvalidRefreshToken(
            "The refresh token has expired. Please call the authenticate method.",
          );
        }
      } else {
        return this.#token;
      }
    } finally {
      this.#semaphore.release();
    }
  }

  /**
   * Get the latest Oauth Token and Refresh Token
   *
   * @returns The latest token
   */
  get token(): Token | undefined {
    return this.#token;
  }

  /**
   * Set the callback function that is called when the Oauth token changes.
   *
   * @param cb - The callback function
   */
  setTokenCallback(cb?: (token: Token) => void): void {
    this.#tokenCallback = cb;
  }

  /**
   * Get the Tado API rate limit information
   *
   * @returns `RateLimit` if an API call has occured
   */
  getRatelimit(): RateLimit | undefined {
    return this.#ratelimit;
  }

  /**
   * Authenticate with the Oauth server. A refresh token may be supplied to bypass the device auth
   * flow if it is still valid, otherwise the device flow is initiaited.
   *
   * @param refreshToken - Attempt to use this refresh token to re-authenticate
   * @param timeout - Ignore the Tado provided timeout for device auth and use this value
   * @returns A promise that resolves to either a `DeviceVerification` object for device auth flows
   * and a promise of a token, or an undefined auth flow and a promise of a token, if the refresh token
   * was supplied
   */
  async authenticate(
    refreshToken?: string,
    timeout?: number,
  ): Promise<[DeviceVerification | undefined, Promise<Token>]> {
    if (refreshToken) {
      this.#token = {
        access_token: "",
        refresh_token: refreshToken,
        expiry: new Date(0),
      };

      try {
        const token = await this.#getToken();
        return [undefined, new Promise((resolve) => resolve(token))];
      } catch {
        // Refresh token is no good
      }
    }

    const verify = await axios<DeviceVerification>({
      url: "https://login.tado.com/oauth2/device_authorize",
      method: "POST",
      params: {
        client_id,
        scope,
      },
    });

    if (timeout !== undefined) {
      timeout = Math.min(timeout, verify.data.expires_in);
    } else {
      timeout = verify.data.expires_in;
    }

    const token = new Promise<Token>((resolve, reject) => {
      this.#waitForAuth(verify.data.device_code, verify.data.interval, timeout)
        .then(resolve)
        .catch(reject);
    });

    return [verify.data, token];
  }

  /**
   * Makes an API call to the provided URL with the specified method and data.
   *
   * @typeParam R - The type of the response
   * @typeParam T - The type of the request body
   * @param url - The endpoint to which the request is sent. If the URL contains "https", it will be used as is.
   * @param method - The HTTP method to use for the request (e.g., "get", "post").
   * @param data - The payload to send with the request, if applicable.
   * @returns A promise that resolves to the response data.
   */
  async apiCall<R, T = unknown>(url: string, method: Method = "get", data?: T): Promise<R> {
    const token = await this.#getToken();

    let callUrl = tado_url + url;
    if (url.includes("https")) {
      callUrl = url;
    }
    const request = {
      url: callUrl,
      method: method,
      data: data,
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
      httpsAgent: this.#httpsAgent,
    };
    if (method !== "get" && method !== "GET") {
      request.data = data;
    }
    const response = await axios<R>(request);

    const headers = response.headers;
    if (headers instanceof AxiosHeaders) {
      const ratelimit: RateLimit = {
        policy: {
          quota: 0,
          window: 0,
        },
        current: {
          remaining: 0,
          resetsIn: undefined,
        },
      };

      headers
        .get("ratelimit-policy")
        ?.toString()
        .split(";")
        .forEach((v) => {
          if (v.includes("=")) {
            const parts = v.split("=");
            if (parts[0] == "q") {
              ratelimit.policy.quota = Number.parseInt(parts[1]);
            } else if (parts[0] == "w") {
              ratelimit.policy.window = Number.parseInt(parts[1]);
            }
          }
        });
      headers
        .get("ratelimit")
        ?.toString()
        .split(";")
        .forEach((v) => {
          if (v.includes("=")) {
            const parts = v.split("=");
            if (parts[0] == "r") {
              ratelimit.current.remaining = Number.parseInt(parts[1]);
            } else if (parts[0] == "t") {
              ratelimit.current.resetsIn = Number.parseInt(parts[1]);
            }
          }
        });

      this.#ratelimit = ratelimit;
    }

    return response.data;
  }

  /**
   * Fetches the current user data.
   *
   * @returns A promise that resolves to the user data.
   */
  getMe(): Promise<Me> {
    return this.apiCall("/api/v2/me");
  }

  /**
   * Fetches and returns the home details for the specified home ID.
   *
   * @param home_id - The ID of the home to be retrieved.
   * @returns A promise that resolves to the details of the home.
   */
  getHome(home_id: number): Promise<Home> {
    return this.apiCall(`/api/v2/homes/${home_id}`);
  }

  /**
   * Sets the away radius for a specific home.
   *
   * @param home_id - The ID of the home.
   * @param away_radius_meters - The away radius in meters.
   * @returns A promise that resolves when the away radius is successfully set.
   */
  setAwayRadius(home_id: number, away_radius_meters: number): Promise<void> {
    return this.apiCall(`/api/v2/homes/${home_id}/awayRadiusInMeters`, "PUT", {
      awayRadiusInMeters: away_radius_meters,
    });
  }

  /**
   * Fetches incident detection details for the specified home.
   *
   * @param home_id - The unique identifier of the home.
   * @returns A promise that resolves to the incident detection details of the home.
   */
  getIncidentDetection(home_id: number): Promise<HomeIncidentDetection> {
    return this.apiCall(`/api/v2/homes/${home_id}/incidentDetection`);
  }

  /**
   * Enables or disables incident detection for a specified home.
   *
   * @param home_id - The unique identifier of the home.
   * @param enabled - Indicates whether incident detection should be enabled (true) or disabled (false).
   * @returns A promise that resolves when the operation is complete.
   */
  setIncidentDetection(home_id: number, enabled: boolean): Promise<void> {
    return this.apiCall(`/api/v2/homes/${home_id}/incidentDetection`, "PUT", {
      enabled: enabled,
    });
  }

  /**
   * Checks if the early start feature is enabled for a given home.
   *
   * @param home_id - The unique identifier of the home.
   * @returns A promise that resolves to a boolean indicating whether the early start feature is enabled.
   */
  async isEarlyStartEnabled(home_id: number): Promise<boolean> {
    const { enabled } = await this.apiCall<{ enabled: boolean }>(
      `/api/v2/homes/${home_id}/earlyStart`,
    );
    return enabled;
  }

  /**
   * Sets the early start feature for a specified home.
   *
   * @param home_id - The unique identifier of the home.
   * @param enabled - A boolean indicating whether the early start feature should be enabled or disabled.
   * @returns A promise that resolves when the early start setting has been successfully updated.
   */
  setEarlyStart(home_id: number, enabled: boolean): Promise<void> {
    return this.apiCall(`/api/v2/homes/${home_id}/earlyStart`, "PUT", {
      enabled: enabled,
    });
  }

  /**
   * Fetches the weather information for a specified home.
   *
   * @param home_id - The unique identifier of the home for which to retrieve the weather data.
   * @returns A promise that resolves to a Weather object containing the weather information for the specified home.
   */
  getWeather(home_id: number): Promise<Weather> {
    return this.apiCall(`/api/v2/homes/${home_id}/weather`);
  }

  /**
   * Fetches the list of installations for a given home.
   *
   * @param home_id - The ID of the home for which to fetch installations.
   * @returns A promise that resolves to an array of installations.
   */
  getInstallations(home_id: number): Promise<Installation[]> {
    return this.apiCall(`/api/v2/homes/${home_id}/installations`);
  }

  /**
   * Fetches the list of invitations for a specified home.
   *
   * @param home_id - The ID of the home for which to retrieve invitations.
   * @returns A promise that resolves to an array of Invitation objects.
   */
  getInvitations(home_id: number): Promise<Invitation[]> {
    return this.apiCall(`/api/v2/homes/${home_id}/invitations`);
  }

  /**
   * Retrieves an invitation based on the provided home ID and token.
   *
   * @param home_id - The ID of the home for which the invitation is to be retrieved.
   * @param token - The unique token (invitation id) associated with the invitation.
   * @returns A promise that resolves to the invitation details.
   */
  getInvitation(home_id: number, token: string): Promise<Invitation> {
    return this.apiCall(`/api/v2/homes/${home_id}/invitations/${token}`);
  }

  /**
   * Creates an invitation for a specified home.
   *
   * @param home_id - The unique identifier of the home to which the invitation will be sent.
   * @param email - The email address of the invitee.
   * @returns A promise that resolves to an Invitation object.
   */
  createInvitation(home_id: number, email: string): Promise<Invitation> {
    return this.apiCall(`/api/v2/homes/${home_id}/invitations`, "POST", {
      email: email,
    });
  }

  /**
   * Resends an invitation to a specific home.
   *
   * @param home_id - The ID of the home for which the invitation is to be resent.
   * @param token - The token representing the invitation to be resent.
   * @returns A promise that resolves once the invitation has been resent.
   */
  resendInvitation(home_id: number, token: string): Promise<void> {
    return this.apiCall(`/api/v2/homes/${home_id}/invitations/${token}/resend`, "POST", {});
  }

  /**
   * Deletes an invitation associated with a home.
   *
   * @param home_id - The unique identifier of the home.
   * @param token - The token associated with the invitation.
   * @returns A promise that resolves when the invitation is successfully deleted.
   */
  deleteInvitation(home_id: number, token: string): Promise<void> {
    return this.apiCall(`/api/v2/homes/${home_id}/invitations/${token}`, "DELETE");
  }

  /**
   * Fetches the list of users associated with a given home.
   *
   * @param home_id - The ID of the home for which to fetch users.
   * @returns A promise that resolves to an array of User objects.
   */
  getUsers(home_id: number): Promise<User[]> {
    return this.apiCall(`/api/v2/homes/${home_id}/users`);
  }

  /**
   * Fetches the state of a home based on the provided home ID.
   *
   * @param home_id - The unique identifier of the home for which the state is to be retrieved.
   * @returns A promise that resolves to the state of the specified home.
   */
  getState(home_id: number): Promise<State> {
    return this.apiCall(`/api/v2/homes/${home_id}/state`);
  }

  /**
   * Retrieves the heating circuits associated with a given home based on the home ID.
   *
   * @param home_id - The ID of the home for which to retrieve heating circuits.
   * @returns A promise that resolves to a HeatingCircuit object.
   */
  getHeatingCircuits(home_id: number): Promise<HeatingCircuit> {
    return this.apiCall(`/api/v2/homes/${home_id}/heatingCircuits`);
  }

  /**
   * Retrieves a list of mobile devices associated with a given home ID.
   * @param home_id - The unique identifier of the home.
   * @returns A promise that resolves to an array of MobileDevice objects.
   */
  getMobileDevices(home_id: number): Promise<MobileDevice[]> {
    return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices`);
  }

  /**
   * Fetches a mobile device associated with the given home ID and mobile device ID.
   *
   * @param home_id - The ID of the home.
   * @param mobile_device_id - The ID of the mobile device.
   * @returns A promise that resolves to the mobile device data.
   */
  getMobileDevice(home_id: number, mobile_device_id: number): Promise<MobileDevice> {
    return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices/${mobile_device_id}`);
  }

  /**
   * Fetches the settings for a specific mobile device within a given home.
   *
   * @param home_id - The unique identifier of the home.
   * @param mobile_device_id - The unique identifier of the mobile device.
   * @returns  A promise that resolves to the mobile device's settings.
   */
  getMobileDeviceSettings(
    home_id: number,
    mobile_device_id: number,
  ): Promise<MobileDeviceSettings> {
    return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices/${mobile_device_id}/settings`);
  }

  /**
   * Sets the geo-tracking settings for a specified mobile device in a given home.
   *
   * @param home_id - The ID of the home.
   * @param mobile_device_id - The ID of the mobile device.
   * @param geoTrackingEnabled - A flag indicating whether geo-tracking should be enabled.
   * @returns A promise that resolves to the updated mobile device settings.
   */
  async setGeoTracking(
    home_id: number,
    mobile_device_id: number,
    geoTrackingEnabled: boolean,
  ): Promise<MobileDeviceSettings> {
    const settings = await this.getMobileDeviceSettings(home_id, mobile_device_id);
    return this.apiCall(
      `/api/v2/homes/${home_id}/mobileDevices/${mobile_device_id}/settings`,
      "put",
      {
        ...settings,
        geoTrackingEnabled: geoTrackingEnabled,
      },
    );
  }

  /**
   * Creates a push notification registration for a given home and mobile device.
   *
   * Note: Do not use this unless you know what you are doing, you might want to consider
   * registering a dummy device.
   *
   * @param home_id - The identifier for the home.
   * @param mobile_device_id - The identifier for the mobile device.
   * @param token - The push notification token for the device.
   * @returns A promise that resolves to the push notification registration (AWS SNS Endpoint ARN).
   */
  createPushNotificationRegistration(
    home_id: number,
    mobile_device_id: number,
    token: string,
  ): Promise<PushNotificationRegistration> {
    return this.apiCall<PushNotificationRegistration>(
      `/api/v2/homes/${home_id}/mobileDevices/${mobile_device_id}/pushNotificationRegistration`,
      "put",
      {
        token: token,
        firebaseProject: "tado-app",
        provider: "FCM",
      } as PushNotificationRegistrationData,
    );
  }

  /**
   * Fetches the geo-location configuration for a specific mobile device in a home.
   *
   * @param home_id - The unique identifier of the home.
   * @param mobile_device_id - The unique identifier of the mobile device.
   * @returns A promise that resolves to the mobile device's geo-location configuration.
   */
  getMobileDeviceGeoLocationConfig(
    home_id: number,
    mobile_device_id: number,
  ): Promise<MobileDeviceGeoLocationConfig> {
    return this.apiCall(
      `/api/v2/homes/${home_id}/mobileDevices/${mobile_device_id}/geoLocationConfig`,
    );
  }

  /**
   * Retrieves the running times for a specific home within a given date range.
   *
   * @param home_id - The unique identifier for the home.
   * @param from - The start date of the range in ISO 8601 format.
   * @param to - The end date of the range in ISO 8601 format.
   * @param aggregate - The method of aggregation for the running times.
   * @param summary_only - Indicates that only a summary of the running times is to be returned.
   *
   * @returns A promise that resolves to a summary of the running times.
   */
  getRunningTimes(
    home_id: number,
    from: string,
    to: string,
    aggregate: RunningTimeAggregation,
    summary_only: true,
  ): Promise<RunningTimesSummaryOnly>;
  /**
   * Retrieves the running times of a specific home within a specified date range.
   *
   * @param home_id - The unique identifier of the home.
   * @param from - The start date of the range in ISO 8601 format.
   * @param to - The end date of the range in ISO 8601 format.
   * @param aggregate - The type of aggregation to apply to the running times.
   * @param summary_only - If false, detailed running times are included; otherwise, only the summary is provided.
   * @returns A promise that resolves to the running times data for the specified home and date range.
   */
  getRunningTimes(
    home_id: number,
    from: string,
    to: string,
    aggregate: RunningTimeAggregation,
    summary_only: false,
  ): Promise<RunningTimes>;
  /**
   * Fetches the running times for a given home within the specified date range.
   *
   * @param home_id - The ID of the home from which to retrieve running times.
   * @param from - The start date of the period in the format `YYYY-MM-DD`.
   * @param to - The end date of the period in the format `YYYY-MM-DD`.
   * @param aggregate - The aggregation type for running times (e.g., daily, weekly, monthly).
   * @param summary_only - Determines whether to fetch only a summary of running times or detailed data.
   *
   * @returns A promise that resolves to either detailed running times or a summary, depending on the `summary_only` parameter.
   */
  getRunningTimes(
    home_id: number,
    from: string,
    to: string,
    aggregate: RunningTimeAggregation,
    summary_only: boolean,
  ): Promise<RunningTimes | RunningTimesSummaryOnly> {
    return this.apiCall(
      `https://minder.tado.com/v1/homes/${home_id}/runningTimes?from=${from}&to=${to}&aggregate=${aggregate}&summary_only=${summary_only}`,
    );
  }

  /**
   * Updates the presence status for a specified home.
   *
   * @param home_id - The unique identifier for the home.
   * @param presence - The new presence state which must be "HOME", "AWAY", or "AUTO".
   * @returns Resolves when the presence status has been successfully updated.
   * @throws {@link TadoError} if the supplied presence state is not "HOME", "AWAY", or "AUTO".
   */
  setPresence(home_id: number, presence: StatePresence): Promise<void> {
    const upperCasePresence = presence.toUpperCase();

    if (!["HOME", "AWAY", "AUTO"].includes(upperCasePresence)) {
      throw new TadoError(
        `Invalid presence "${upperCasePresence}" must be "HOME", "AWAY", or "AUTO"`,
      );
    }

    const method = upperCasePresence == "AUTO" ? "delete" : "put";
    const config = {
      homePresence: upperCasePresence,
    };

    return this.apiCall(`/api/v2/homes/${home_id}/presenceLock`, method, config);
  }

  /**
   * Checks if anyone is at home based on the geo-tracking data of mobile devices.
   *
   * @param home_id - The unique identifier of the home.
   * @returns A promise that resolves to a boolean indicating if any tracked device is at home.
   */
  async isAnyoneAtHome(home_id: number): Promise<boolean> {
    const devices = await this.getMobileDevices(home_id);

    for (const device of devices) {
      if (device.settings.geoTrackingEnabled && device.location && device.location.atHome) {
        return true;
      }
    }

    return false;
  }

  /**
   * Updates the presence state of the specified home.
   *
   * This method checks if anyone is currently at home and compares it
   * with the current presence state. If there is a discrepancy, it updates
   * the presence state accordingly. If the presence state is already accurate,
   * it returns a message indicating no change was needed.
   *
   * @param home_id - The unique identifier of the home whose presence state is to be updated.
   * @returns A promise that resolves when the operation is complete,
   * or returns a message if the presence state was already accurate.
   */
  async updatePresence(home_id: number): Promise<void | "already up to date"> {
    const [isAnyoneAtHome, presenceState] = await Promise.all([
      this.isAnyoneAtHome(home_id),
      this.getState(home_id),
    ]);
    const isPresenceAtHome = presenceState.presence === "HOME";

    if (isAnyoneAtHome !== isPresenceAtHome) {
      return this.setPresence(home_id, isAnyoneAtHome ? "HOME" : "AWAY");
    } else {
      return "already up to date";
    }
  }

  /**
   * Fetches detailed air comfort information for a specific home.
   *
   * @param home_id - The unique identifier of the home.
   * @returns  A promise that resolves to detailed air comfort data.
   */
  async getAirComfortDetailed(home_id: number): Promise<AirComfortDetailed> {
    const home = await this.getHome(home_id);
    const location = `latitude=${home.geolocation.latitude}&longitude=${home.geolocation.longitude}`;
    return this.apiCall(`https://acme.tado.com/v1/homes/${home_id}/airComfort?${location}`);
  }

  /**
   * Retrieves energy consumption details for a specified home, month, and year.
   *
   * @param home_id - The unique identifier of the home.
   * @param month - The specific month for which the consumption details are requested.
   * @param year - The specific year for which the consumption details are requested.
   * @returns A promise resolving to the energy consumption details for the specified time period.
   */
  async getEnergyIQConsumptionDetails(
    home_id: number,
    month: number,
    year: number,
  ): Promise<EnergyIQConsumptionDetails> {
    const date = `${year}-${month.toString().padStart(2, "0")}`;
    return this.apiCall(
      `https://energy-insights.tado.com/api/homes/${home_id}/consumptionDetails?month=${date}`,
    );
  }

  /**
   * Fetches the energy consumption overview for a specified home, month, and year.
   *
   * @param home_id - The unique identifier of the home.
   * @param month - The month for which the energy overview is needed.
   * @param year - The year for which the energy overview is needed.
   * @returns A promise that resolves to an EnergyIQOverview object containing the energy consumption details.
   */
  async getEnergyIQOverview(
    home_id: number,
    month: number,
    year: number,
  ): Promise<EnergyIQOverview> {
    const date = `${year}-${month.toString().padStart(2, "0")}`;
    return this.apiCall(
      `https://energy-insights.tado.com/api/homes/${home_id}/consumptionOverview?month=${date}`,
    );
  }

  /**
   * Fetches the EnergyIQ tariff for a given home.
   *
   * @param home_id - The unique identifier of the home.
   * @returns  A promise that resolves to the {@link EnergyIQTariffs} object.
   */
  getEnergyIQTariff(home_id: number): Promise<EnergyIQTariffs> {
    return this.apiCall(`https://energy-insights.tado.com/api/homes/${home_id}/tariffs`);
  }

  /**
   * Adds a new energy IQ tariff for a specified home.
   *
   * @param home_id - The identifier of the home.
   * @param unit - The unit of energy measurement.
   * @param startDate - The start date of the tariff in ISO format.
   * @param endDate - The end date of the tariff in ISO format.
   * @param tariffInCents - The tariff amount in cents.
   * @returns A promise that resolves to the API response.
   * @throws  {@link TadoError} if the unit is not valid.
   */
  addEnergyIQTariff(
    home_id: number,
    unit: IQUnit,
    startDate: string,
    endDate: string,
    tariffInCents: number,
  ): Promise<void> {
    if (!["m3", "kWh"].includes(unit)) {
      throw new TadoError(`Invalid unit "${unit}" must be "m3", or "kWh"`);
    }

    return this.apiCall(
      `https://energy-insights.tado.com/api/homes/${home_id}/tariffs`,
      "post",
      {
        unit: unit,
        startDate: startDate,
        endDate: endDate,
        tariffInCents: tariffInCents,
      },
    );
  }

  /**
   * Updates the Energy IQ tariff for a specified home.
   *
   * @param home_id - The unique identifier for the home.
   * @param tariff_id - The unique identifier for the tariff.
   * @param unit - The unit of the tariff, either "m3" or "kWh."
   * @param startDate - The start date of the tariff in the format 'YYYY-MM-DD.'
   * @param endDate - The end date of the tariff in the format 'YYYY-MM-DD.'
   * @param tariffInCents - The tariff rate in cents.
   * @returns A promise that resolves to the response of the API call.
   * @throws {@link TadoError} if the unit is not "m3" or "kWh."
   */
  updateEnergyIQTariff(
    home_id: number,
    tariff_id: string,
    unit: IQUnit,
    startDate: string,
    endDate: string,
    tariffInCents: number,
  ): Promise<EnergyIQTariffInfo> {
    if (!["m3", "kWh"].includes(unit)) {
      throw new TadoError(`Invalid unit "${unit}" must be "m3", or "kWh"`);
    }

    return this.apiCall(
      `https://energy-insights.tado.com/api/homes/${home_id}/tariffs/${tariff_id}`,
      "put",
      {
        unit: unit,
        startDate: startDate,
        endDate: endDate,
        tariffInCents: tariffInCents,
      },
    );
  }

  /**
   * Fetches the Energy IQ meter readings for a specified home.
   *
   * @param home_id - The unique identifier of the home for which the meter readings are to be retrieved.
   * @returns A promise that resolves to the Energy IQ meter readings for the specified home.
   */
  getEnergyIQMeterReadings(home_id: number): Promise<EnergyIQMeterReadings> {
    return this.apiCall(`https://energy-insights.tado.com/api/homes/${home_id}/meterReadings`);
  }

  /**
   * Adds an energy IQ meter reading for a given home.
   *
   * @param home_id - The ID of the home.
   * @param date - The date of the meter reading in ISO format.
   * @param reading - The meter reading value.
   * @returns A promise that resolves to the response of the API call.
   */
  addEnergyIQMeterReading(
    home_id: number,
    date: string,
    reading: number,
  ): Promise<AddEnergiIQMeterReadingResponse> {
    return this.apiCall(
      `https://energy-insights.tado.com/api/homes/${home_id}/meterReadings`,
      "post",
      { date: date, reading: reading },
    );
  }

  /**
   * Deletes a specific energy meter reading for a given home.
   *
   * @param home_id - The unique identifier of the home.
   * @param reading_id - The unique identifier of the meter reading to be deleted.
   * @returns  A promise that resolves when the meter reading has been successfully deleted.
   */
  deleteEnergyIQMeterReading(home_id: number, reading_id: number): Promise<void> {
    return this.apiCall(
      `https://energy-insights.tado.com/api/homes/${home_id}/meterReadings/${reading_id}`,
      "delete",
      {},
    );
  }

  /**
   * Fetches the energy savings report for a specific home and time period.
   *
   * @example Get the energy savings report for the current month
   * ```typescript
   * const today = new Date();
   * const countryCode = await tado.getHome(home_id).address.country;
   * const report = await this tado.getEnergySavingsReport(home_id, today.getFullYear(), today.getMonth() + 1)
   * ```
   *
   * @param home_id - The unique identifier of the home.
   * @param year - The year for the report.
   * @param month - The month for the report.
   * @param countryCode - The country code of the home.
   * @returns A promise that resolves to the energy savings report.
   */
  getEnergySavingsReport(
    home_id: number,
    year: number,
    month: number,
    countryCode: Country,
  ): Promise<EnergySavingReport> {
    return this.apiCall(
      `https://energy-bob.tado.com/${home_id}/${year}-${month}?country=${countryCode}`,
    );
  }

  /**
   * Retrieves the heating system information for a specific home.
   *
   * @param home_id - The unique identifier of the home.
   * @returns A promise that resolves to the heating system information of the specified home.
   */
  getHomeHeatingSystem(home_id: number): Promise<HeatingSystem> {
    return this.apiCall(`/api/v2/homes/${home_id}/heatingSystem`);
  }

  /**
   * Retrieves information about the specified boiler system. This includes model name, image
   * used by the app, and manufacturer names.
   *
   * @example
   * ```typescript
   * const heatingSystem = await tado.getHomeHeatingSystem(1907);
   * const boilerInformation = await tado.getBoilerSystemInformation(heatingSystem.boiler.id);
   * console.log(
   *   `Your boiler model is ${boilerInformation.modelName} manufactured by ${boilerInformation.manufacturers[0].name}`,
   * );
   * ```
   *
   * @param system_id - The unique identifier of the boiler system as retrieved in {@link getHomeHeatingSystem}.
   * @returns A promise that resolves to an object containing the boiler system information.
   */
  async getBoilerSystemInformation(system_id: number): Promise<BoilerSystemInformation> {
    type getBoilerSystemInformationResponse = {
      data: {
        system: BoilerSystemInformation;
      };
    };

    const response = await this.apiCall<getBoilerSystemInformationResponse>(
      `https://ivar.tado.com/graphql`,
      "POST",
      {
        query: `{ system(id: ${system_id}) { modelName shortModelName: modelName(type: SHORT) thumbnail { schematic { url } } manufacturers { name } } }`,
      },
    );
    return response.data.system;
  }
}
