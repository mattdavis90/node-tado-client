import { Agent } from "https";
import axios, { AxiosError, Method } from "axios";
import { AccessToken, ResourceOwnerPassword } from "simple-oauth2";
import {
  ACMode,
  AddEnergiIQMeterReadingResponse,
  AirComfort,
  AirComfortDetailed,
  AwayConfiguration,
  Country,
  DeepPartial,
  DefaultOverlay,
  Device,
  EnergyIQConsumptionDetails,
  EnergyIQMeterReadings,
  EnergyIQOverview,
  EnergyIQTariffInfo,
  EnergyIQTariffs,
  EnergySavingReport,
  FanLevel,
  FanSpeed,
  HeatingCircuit,
  Home,
  HorizontalSwing,
  Installation,
  IQUnit,
  Me,
  MobileDevice,
  MobileDeviceSettings,
  Power,
  RunningTimeAggregation,
  RunningTimes,
  RunningTimesSummaryOnly,
  SetZoneOverlayArg,
  SetZoneOverlaysArg,
  State,
  StatePresence,
  Temperature,
  Termination,
  TimeTable,
  TimeTableDayType,
  TimeTables,
  User,
  VerticalSwing,
  Weather,
  Zone,
  ZoneCapabilities,
  ZoneControl,
  ZoneDayReport,
  ZoneMultiOverlay,
  ZoneOverlay,
  ZoneOverlayTermination,
  ZoneState,
  ZoneStates,
} from "./types";

export * from "./types";

const EXPIRATION_WINDOW_IN_SECONDS = 300;

const tado_auth_url = "https://auth.tado.com";
const tado_url = "https://my.tado.com";
const tado_config = {
  client: {
    id: "tado-web-app",
    secret: "wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc",
  },
  auth: {
    tokenHost: tado_auth_url,
  },
};

const client = new ResourceOwnerPassword(tado_config);

/**
 * TadoError extends the base Error class to represent errors specific to the Tado ecosystem.
 * This custom error class can be used to differentiate between general errors
 * and those that are Tado-specific, enabling more precise error handling and debugging.
 */
export class TadoError extends Error {}

/**
 * Tado class provides functions to interact with the Tado API, including
 * user authentication and various home and device management operations.
 *
 * @example Fetch user information (javascript)
 * ```javascript
 * // Import the Tado client
 * const { Tado } = require("node-tado-client");
 *
 * // Create a new Tado instance
 * var tado = new Tado();
 *
 * // Login to the Tado Web API
 * tado.login("username", "password").then(() => {
 *     tado.getMe().then((resp) => {
 *         console.log(resp);
 *     });
 * });
 * ```
 */
export class Tado {
  private _httpsAgent: Agent;
  private _accessToken?: AccessToken | null;
  private _username?: string;
  private _password?: string;

  constructor(username?: string, password?: string) {
    this._username = username;
    this._password = password;
    this._httpsAgent = new Agent({ keepAlive: true });
  }

  private async _login(): Promise<void> {
    if (!this._username || !this._password) {
      throw new Error("Please login before using Tado!");
    }

    const tokenParams = {
      username: this._username,
      password: this._password,
      scope: "home.user",
    };

    this._accessToken = await client.getToken(tokenParams);
  }

  /**
   * Refreshes the access token if it has expired or is about to expire.
   *
   * The method checks if an access token is available. If not, it attempts to login to obtain one.
   * If the token is within the expiration window, it tries to refresh the token.
   * In case of a failure during the refresh, it sets the token to null and attempts to login again.
   *
   * @returns A promise that resolves when the token has been refreshed or re-obtained.
   * @throws {@link TadoError} if no access token is available after attempting to login.
   */
  private async _refreshToken(): Promise<void> {
    if (!this._accessToken) {
      await this._login();
    }

    if (!this._accessToken) {
      throw new TadoError(`No access token available, even after login in.`);
    }

    // If the start of the window has passed, refresh the token
    const shouldRefresh = this._accessToken.expired(EXPIRATION_WINDOW_IN_SECONDS);

    if (shouldRefresh) {
      try {
        this._accessToken = await this._accessToken.refresh();
      } catch (_error) {
        this._accessToken = null;
        await this._login();
      }
    }
  }

  /**
   * Authenticates a user using the provided public client credentials, username and password.
   * For more information see
   * [https://support.tado.com/en/articles/8565472-how-do-i-update-my-rest-api-authentication-method-to-oauth-2](https://support.tado.com/en/articles/8565472-how-do-i-update-my-rest-api-authentication-method-to-oauth-2).
   *
   * @param username - The username of the user attempting to login.
   * @param password - The password of the user attempting to login.
   * @returns A promise that resolves when the login process is complete.
   */
  async login(username: string, password: string): Promise<void> {
    this._username = username;
    this._password = password;
    await this._login();
  }

  /**
   * Makes an API call to the provided URL with the specified method and data.
   *
   * @typeparam R - The type of the response
   * @typeparam T - The type of the request body
   * @param url - The endpoint to which the request is sent. If the URL contains "https", it will be used as is.
   * @param method - The HTTP method to use for the request (e.g., "get", "post").
   * @param data - The payload to send with the request, if applicable.
   * @returns A promise that resolves to the response data.
   */
  async apiCall<R, T = unknown>(url: string, method: Method = "get", data?: T): Promise<R> {
    await this._refreshToken();

    let callUrl = tado_url + url;
    if (url.includes("https")) {
      callUrl = url;
    }
    const request = {
      url: callUrl,
      method: method,
      data: data,
      headers: {
        Authorization: "Bearer " + this._accessToken?.token.access_token,
      },
      httpsAgent: this._httpsAgent,
    };
    if (method !== "get" && method !== "GET") {
      request.data = data;
    }
    const response = await axios(request);

    return response.data as R;
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
   * Fetches the weather information for a specified home.
   *
   * @param home_id - The unique identifier of the home for which to retrieve the weather data.
   * @returns A promise that resolves to a Weather object containing the weather information for the specified home.
   */
  getWeather(home_id: number): Promise<Weather> {
    return this.apiCall(`/api/v2/homes/${home_id}/weather`);
  }

  /**
   * Retrieves a list of devices associated with the given home ID.
   *
   * @param home_id - The unique identifier of the home.
   * @returns A promise that resolves to an array of Device objects.
   */
  getDevices(home_id: number): Promise<Device[]> {
    return this.apiCall(`/api/v2/homes/${home_id}/devices`);
  }

  /**
   * Fetches the temperature offset of a device using its serial number.
   *
   * @param serial_no - The serial number of the device.
   * @returns A promise that resolves to the temperature offset of the device.
   */
  getDeviceTemperatureOffset(serial_no: string): Promise<Temperature> {
    return this.apiCall(`/api/v2/devices/${serial_no}/temperatureOffset`);
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
   * Retrieves the states of zones for a specified home.
   *
   * @param home_id - The ID of the home for which to retrieve zone states.
   * @returns A promise that resolves to the states of the zones.
   */
  getZoneStates(home_id: number): Promise<ZoneStates> {
    return this.apiCall(`/api/v2/homes/${home_id}/zoneStates`);
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
   * Fetches the zones for a given home.
   *
   * @param home_id - The ID of the home for which to fetch the zones.
   * @returns A promise that resolves to an array of Zone objects.
   */
  getZones(home_id: number): Promise<Zone[]> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones`);
  }

  /**
   * Fetches the state of a specified zone in a home.
   *
   * @param home_id - The ID of the home.
   * @param zone_id - The ID of the zone within the home.
   * @returns  A promise that resolves to the state of the specified zone.
   */
  getZoneState(home_id: number, zone_id: number): Promise<ZoneState> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/state`);
  }

  /**
   * Fetches the control settings for a specific zone within a home.
   *
   * @param home_id - The unique identifier of the home.
   * @param zone_id - The unique identifier of the zone within the home.
   * @returns A promise that resolves to the ZoneControl object containing the zone's control settings.
   */
  getZoneControl(home_id: number, zone_id: number): Promise<ZoneControl> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/control`);
  }

  /**
   * Retrieves the capabilities of a specific zone within a home.
   *
   * @param home_id - The ID of the home containing the zone.
   * @param zone_id - The ID of the zone whose capabilities are to be retrieved.
   * @returns A promise that resolves to the capabilities of the specified zone.
   */
  getZoneCapabilities(home_id: number, zone_id: number): Promise<ZoneCapabilities> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/capabilities`);
  }

  /**
   * Retrieves the overlay information for a specific zone within a home.
   *
   * @param home_id - The unique identifier of the home.
   * @param zone_id - The unique identifier of the zone.
   * @returns A promise that resolves to the zone's overlay information, or an empty object if the zone is not found.
   */
  async getZoneOverlay(
    home_id: number,
    zone_id: number,
  ): Promise<ZoneOverlay | Record<string, never>> {
    try {
      return this.apiCall<ZoneOverlay>(`/api/v2/homes/${home_id}/zones/${zone_id}/overlay`);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return {};
      }

      throw error;
    }
  }

  /**
   * Retrieves the daily report for a specified zone in a given home on a specific date.
   *
   * @param home_id - The unique identifier of the home.
   * @param zone_id - The unique identifier of the zone within the home.
   * @param reportDate - The date for which the report is requested, in the format 'YYYY-MM-DD'.
   * @returns A promise that resolves to the ZoneDayReport object containing the daily report data.
   */
  getZoneDayReport(
    home_id: number,
    zone_id: number,
    reportDate: string,
  ): Promise<ZoneDayReport> {
    return this.apiCall(
      `/api/v2/homes/${home_id}/zones/${zone_id}/dayReport?date=${reportDate}`,
    );
  }

  /**
   * Retrieves the away configuration for a specific home and zone.
   *
   * @param home_id - The unique identifier of the home.
   * @param zone_id - The unique identifier of the zone within the home.
   * @returns A promise that resolves to the away configuration object.
   */
  getAwayConfiguration(home_id: number, zone_id: number): Promise<AwayConfiguration> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/awayConfiguration`);
  }

  /**
   * Fetches the active timetable for a specific zone in a home.
   *
   * @param home_id - The unique identifier of the home.
   * @param zone_id - The unique identifier of the zone within the home.
   * @returns A promise that resolves to the active timetable.
   */
  getTimeTables(home_id: number, zone_id: number): Promise<TimeTables> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/schedule/activeTimetable`);
  }

  /**
   * Sets the active timetable for a specific zone in a given home.
   *
   * @param home_id - The unique identifier of the home.
   * @param zone_id - The unique identifier of the zone within the home.
   * @param timetable - The timetable object to be set as active.
   * @returns  A promise that resolves to the updated timetable object.
   */
  setActiveTimeTable(
    home_id: number,
    zone_id: number,
    timetable: TimeTables,
  ): Promise<TimeTables> {
    return this.apiCall(
      `/api/v2/homes/${home_id}/zones/${zone_id}/schedule/activeTimetable`,
      "PUT",
      timetable,
    );
  }

  /**
   * Retrieves a timetable for the specified home, zone, and timetable IDs.
   *
   * @param home_id - The unique identifier for the home.
   * @param zone_id - The unique identifier for the zone.
   * @param timetable_id - The unique identifier for the timetable.
   * @returns A promise that resolves to the requested TimeTable object.
   */
  getTimeTable(home_id: number, zone_id: number, timetable_id: number): Promise<TimeTable> {
    return this.apiCall(
      `/api/v2/homes/${home_id}/zones/${zone_id}/schedule/timetables/${timetable_id}/blocks`,
    );
  }

  /**
   * Sets the time table for a specified zone in a home.
   *
   * @param home_id - The ID of the home.
   * @param zone_id - The ID of the zone within the home.
   * @param timetable_id - The ID of the timetable to be set.
   * @param timetable - The timetable data to be set.
   * @param day_type - The type of day for the timetable.
   * @returns A promise that resolves to the updated timetables.
   */
  setTimeTable(
    home_id: number,
    zone_id: number,
    timetable_id: number,
    timetable: TimeTable,
    day_type: TimeTableDayType,
  ): Promise<TimeTables> {
    return this.apiCall(
      `/api/v2/homes/${home_id}/zones/${zone_id}/schedule/timetables/${timetable_id}/blocks/${day_type}`,
      "PUT",
      timetable,
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
   * Clears the overlay for a specific zone in a home.
   *
   * @param home_id - The unique identifier of the home.
   * @param zone_id - The unique identifier of the zone within the home.
   * @returns  A promise that resolves when the operation is complete.
   * @deprecated Use {@link clearZoneOverlays} instead.
   */
  clearZoneOverlay(home_id: number, zone_id: number): Promise<void> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/overlay`, "delete");
  }

  /**
   * Sets the overlay configuration for a specific zone in a home.
   *
   * @param home_id - The identifier of the home.
   * @param zone_id - The identifier of the zone within the home.
   * @param power - The power state, either 'ON' or 'OFF'.
   * @param temperature - The desired temperature for the overlay, in celsius.
   * @param termination - The termination condition for the overlay. Options include 'MANUAL', 'AUTO', 'NEXT_TIME_BLOCK', or a number representing duration in seconds.
   * @param fan_speed - The desired fan speed or level.
   * @param ac_mode - The air conditioning mode (e.g., 'COOL', 'HEAT').
   * @param verticalSwing - The vertical swing setting for air conditioning.
   * @param horizontalSwing - The horizontal swing setting for air conditioning.
   * @returns  A promise that resolves to the created zone overlay.
   * @deprecated Use {@link setZoneOverlays} instead.
   */
  async setZoneOverlay(
    home_id: number,
    zone_id: number,
    power: Power,
    temperature?: number,
    termination?: Termination | undefined | number,
    fan_speed?: FanSpeed | FanLevel,
    ac_mode?: ACMode,
    verticalSwing?: VerticalSwing,
    horizontalSwing?: HorizontalSwing,
  ): Promise<ZoneOverlay> {
    const zone_capabilities = await this.getZoneCapabilities(home_id, zone_id);

    const config: {
      setting: DeepPartial<SetZoneOverlayArg>;
      termination?: Partial<ZoneOverlayTermination>;
      type: "MANUAL";
    } = {
      setting: {
        type: zone_capabilities.type,
      },
      type: "MANUAL",
    };

    if (power.toUpperCase() == "ON") {
      config.setting.power = "ON";

      if (
        (config.setting.type == "HEATING" || config.setting.type == "HOT_WATER") &&
        temperature
      ) {
        config.setting.temperature = { celsius: temperature };
      }

      if (zone_capabilities.type == "AIR_CONDITIONING") {
        if (ac_mode) {
          config.setting.mode = ac_mode.toUpperCase() as ACMode;
        }

        if (verticalSwing) {
          config.setting.verticalSwing = verticalSwing;
        }

        if (horizontalSwing) {
          config.setting.horizontalSwing = horizontalSwing;
        }

        if (
          config.setting.mode?.toLowerCase() == "heat" ||
          config.setting.mode?.toLowerCase() == "cool" ||
          config.setting.mode?.toLowerCase() == "auto" ||
          config.setting.mode?.toLowerCase() == "dry"
        ) {
          if (temperature) {
            config.setting.temperature = { celsius: temperature };
          }

          if (fan_speed && config.setting.mode?.toLowerCase() != "dry") {
            if ((zone_capabilities.FAN || zone_capabilities.AUTO).fanLevel !== undefined) {
              config.setting.fanLevel = fan_speed.toUpperCase() as FanLevel;
            } else {
              config.setting.fanSpeed = fan_speed.toUpperCase() as FanSpeed;
            }
          }
        }
      }
    } else {
      config.setting.power = "OFF";
    }

    if (!termination) {
      termination = "MANUAL";
    }

    if (typeof termination === "string" && !isNaN(parseInt(termination))) {
      termination = parseInt(termination);
    }

    if (typeof termination === "number") {
      config.type = "MANUAL";
      config.termination = {
        typeSkillBasedApp: "TIMER",
        durationInSeconds: termination,
      };
    } else if (termination.toLowerCase() == "manual") {
      config.type = "MANUAL";
      config.termination = {
        typeSkillBasedApp: "MANUAL",
      };
    } else if (termination.toLowerCase() == "auto") {
      config.termination = {
        type: "TADO_MODE",
      };
    } else if (termination.toLowerCase() == "next_time_block") {
      config.type = "MANUAL";
      config.termination = {
        typeSkillBasedApp: "NEXT_TIME_BLOCK",
      };
    }

    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/overlay`, "put", config);
  }

  /**
   * Clears overlays for specified zones in a home.
   *
   * @param home_id - The ID of the home.
   * @param zone_ids - An array of IDs of the zones to clear overlays for.
   * @returns A promise that resolves when the overlays are cleared.
   */
  async clearZoneOverlays(home_id: number, zone_ids: number[]): Promise<void> {
    const rooms = zone_ids.join(",");
    return this.apiCall(`/api/v2/homes/${home_id}/overlay?rooms=${rooms}`, "delete");
  }

  /**
   * Applies multiple zone overlays to a home's zones with specified termination settings.
   *
   * @example Setting an overlay for a single zone
   *
   * Each overlay item of the type {@link SetZoneOverlaysArg}.
   *
   * ```typescript
   * const zoneOverlay = {
   *     zone_id: 123,           # Required
   *     power: "ON",            # HEATING and AC
   *     temperature: {          # HEATING and AC
   *         celsius: 24,
   *         fahrenheit: 75.2
   *     },
   *     mode: "HEAT",           # AC only
   *     fanLevel: "LEVEL1",     # AC only
   *     verticalSwing: "OFF",   # AC only
   *     horizontalSwing: "OFF", # AC only
   *     light: "OFF",           # AC only
   * }
   * tado.setZoneOverlays(1907, [ overlay ], 1800);
   * ```
   *
   * It is not required to use upper case in the values, the library will convert the strings
   * for you. It is also not required to supply both celsius and fahrenheit, the Tado API is
   * able to convert for you.
   *
   * The `termination` argument should be one of the following:
   *
   * -   A positive integer - this will be interpreted as the number of seconds to set the
   *      overlay for
   * -   "AUTO" - this will put the overlay into "TADO_MODE"
   *     -   _Note: This uses the default termination type set on the zone_
   * -   "NEXT_TIME_BLOCK" - overlay until the next scheduled event
   * -   Anything else - the overlay will exist indefinitely and will need manually clearing
   *
   * See also {@link Termination}.
   *
   * @example Boost heating for all available zones
   *
   * ```typescript
   * await tado.setZoneOverlays(
   *     homeId,
   *     (await this.getZones(1907)).map((zone) => {
   *         return {
   *             isBoost: true,
   *             power: "ON",
   *             temperature: {
   *                 celsius: 25,
   *                 fahrenheit: 77,
   *             },
   *             zone_id: zone.id,
   *         };
   *     }),
   *     1800,
   * );
   * ```
   *
   * @param home_id - The unique identifier for the home.
   * @param overlays - An array of configurations for each zone overlay.
   * @param termination - Optional termination configuration which can be a string or a number,
   *  determining how the overlay should end.
   * @returns  A promise that resolves when the operation is complete.
   */
  async setZoneOverlays(
    home_id: number,
    overlays: SetZoneOverlaysArg[],
    termination: Termination | undefined | number,
  ): Promise<void> {
    let termination_config: Partial<ZoneOverlayTermination> = {};

    if (!termination) {
      termination = "MANUAL";
    }

    if (typeof termination === "string" && !isNaN(parseInt(termination))) {
      termination = parseInt(termination);
    }

    if (typeof termination === "number") {
      termination_config = {
        typeSkillBasedApp: "TIMER",
        durationInSeconds: termination,
      };
    } else if (termination.toLowerCase() == "manual") {
      termination_config = {
        typeSkillBasedApp: "MANUAL",
      };
    } else if (termination.toLowerCase() == "auto") {
      termination_config = {
        typeSkillBasedApp: "TADO_MODE",
      };
    } else if (termination.toLowerCase() == "next_time_block") {
      termination_config = {
        typeSkillBasedApp: "NEXT_TIME_BLOCK",
      };
    }

    const config: ZoneMultiOverlay[] = [];
    for (const overlay of overlays) {
      const zone_capabilities = await this.getZoneCapabilities(home_id, overlay.zone_id);

      const overlay_config: ZoneMultiOverlay = {
        overlay: {
          setting: {
            type: zone_capabilities.type,
          },
          termination: termination_config,
        },
        room: overlay.zone_id,
      };

      overlay_config.overlay.setting.isBoost = overlay.isBoost ?? false;
      overlay_config.overlay.setting.mode = overlay.mode;
      overlay_config.overlay.setting.power = overlay.power;
      overlay_config.overlay.setting.temperature = overlay.temperature;
      overlay_config.overlay.setting.verticalSwing = overlay.verticalSwing;
      overlay_config.overlay.setting.horizontalSwing = overlay.horizontalSwing;
      overlay_config.overlay.setting.light = overlay.light;

      if (overlay["fanLevel"]) {
        if (zone_capabilities.type == "AIR_CONDITIONING") {
          if ((zone_capabilities.FAN || zone_capabilities.AUTO).fanLevel !== undefined) {
            overlay_config.overlay.setting.fanLevel =
              overlay.fanLevel.toUpperCase() as FanLevel;
          } else {
            overlay_config.overlay.setting.fanSpeed =
              overlay.fanLevel.toUpperCase() as FanSpeed;
          }
        }
      }

      config.push(overlay_config);
    }

    return this.apiCall(`/api/v2/homes/${home_id}/overlay`, "post", { overlays: config });
  }

  /**
   * Fetches the default overlay for a specified zone in a specified home.
   *
   * @param home_id - The identifier of the home.
   * @param zone_id - The identifier of the zone within the home.
   * @returns A promise that resolves to the default overlay of the specified zone.
   */
  getZoneDefaultOverlay(home_id: number, zone_id: number): Promise<DefaultOverlay> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/defaultOverlay`);
  }

  /**
   * Sets the default overlay for a specified zone within a home.
   *
   * @param home_id - The unique identifier of the home.
   * @param zone_id - The unique identifier of the zone within the home.
   * @param overlay - An object representing the default overlay settings to be applied.
   * @returns A promise that resolves to the updated default overlay settings.
   */
  setZoneDefaultOverlay(
    home_id: number,
    zone_id: number,
    overlay: DefaultOverlay,
  ): Promise<DefaultOverlay> {
    return this.apiCall(
      `/api/v2/homes/${home_id}/zones/${zone_id}/defaultOverlay`,
      "PUT",
      overlay,
    );
  }

  /**
   * Sets the temperature offset for a specified device.
   *
   * @param serial_no - The serial number of the device.
   * @param temperatureOffset - The temperature offset to be set, in degrees Celsius.
   * @returns A promise that resolves to the updated temperature object.
   */
  setDeviceTemperatureOffset(
    serial_no: string,
    temperatureOffset: number,
  ): Promise<Temperature> {
    const config = {
      celsius: temperatureOffset,
    };

    return this.apiCall(`/api/v2/devices/${serial_no}/temperatureOffset`, "put", config);
  }

  /**
   * Identifies a device using its serial number.
   *
   * @param serial_no - The serial number of the device.
   * @returns A promise that resolves when the device has been successfully identified.
   */
  identifyDevice(serial_no: string): Promise<void> {
    return this.apiCall(`/api/v2/devices/${serial_no}/identify`, "post");
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
   * Configures the window detection feature for a specified zone within a home.
   *
   * @param home_id - The unique identifier of the home.
   * @param zone_id - The unique identifier of the zone within the home.
   * @param enabled - A flag indicating whether the window detection should be enabled or not.
   * @param timeout - The time period in seconds before the window detection should timeout.
   * @returns A promise that resolves when the window detection setting has been updated.
   */
  setWindowDetection(
    home_id: number,
    zone_id: number,
    enabled: true,
    timeout: number,
  ): Promise<void>;
  /**
   * Enables or disables window detection for a specified home and zone.
   *
   * @param home_id - The unique identifier for the home.
   * @param zone_id - The unique identifier for the zone within the home.
   * @param enabled - A flag indicating whether window detection should be enabled (true) or disabled (false).
   * @returns A promise that resolves when the operation is complete.
   */
  setWindowDetection(home_id: number, zone_id: number, enabled: false): Promise<void>;
  /**
   * Enables or disables the window detection feature for a specific zone within a home.
   *
   * @param home_id - The ID of the home.
   * @param zone_id - The ID of the zone within the home.
   * @param enabled - Specifies whether the window detection should be enabled or disabled.
   * @param timeout - An optional timeout duration in seconds for the window detection feature.
   * @returns A promise that resolves when the window detection configuration is successfully updated.
   */
  setWindowDetection(
    home_id: number,
    zone_id: number,
    enabled: boolean,
    timeout?: number,
  ): Promise<void> {
    const config = {
      enabled: enabled,
      timeoutInSeconds: timeout,
    };
    return this.apiCall(
      `/api/v2/homes/${home_id}/zones/${zone_id}/openWindowDetection`,
      "PUT",
      config,
    );
  }

  /**
   * Sets the open window mode for a specified home and zone.
   *
   * @param home_id - Identifier for the home.
   * @param zone_id - Identifier for the zone within the home.
   * @param activate - If true, activates the open window mode; if false, deactivates it.
   * @returns A promise that resolves when the operation is complete.
   */
  setOpenWindowMode(home_id: number, zone_id: number, activate: boolean): Promise<void> {
    if (activate) {
      return this.apiCall(
        `/api/v2/homes/${home_id}/zones/${zone_id}/state/openWindow/activate`,
        "POST",
      );
    }

    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/state/openWindow`, "DELETE");
  }

  /**
   * Sets the child lock feature for a specified device.
   *
   * @param serial_no - The serial number of the device.
   * @param child_lock - Boolean value to enable or disable the child lock.
   * @returns A promise that resolves when the child lock has been set.
   */
  setChildlock(serial_no: string, child_lock: boolean): Promise<void> {
    return this.apiCall(`/api/v2/devices/${serial_no}/childLock`, "PUT", {
      childLockEnabled: child_lock,
    });
  }

  /**
   * Retrieves the air comfort details for a given home.
   *
   * @param home_id - The ID of the home for which to get the air comfort details.
   * @returns A promise that resolves to an AirComfort object containing the air comfort details.
   */
  getAirComfort(home_id: number): Promise<AirComfort> {
    return this.apiCall(`/api/v2/homes/${home_id}/airComfort`);
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
}
