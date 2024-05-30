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
  Device,
  EnergyIQ,
  EnergyIQMeterReadings,
  EnergyIQTariff,
  EnergySavingReport,
  FanLevel,
  FanSpeed,
  HeatingCircuit,
  Home,
  HorizontalSwing,
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

  private async _login() {
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

  private async _refreshToken() {
    if (!this._accessToken) {
      await this._login();
    }

    if (!this._accessToken) {
      throw new Error(`No access token available, even after login in.`);
    }

    // If the start of the window has passed, refresh the token
    const shouldRefresh = this._accessToken.expired(EXPIRATION_WINDOW_IN_SECONDS);

    if (shouldRefresh) {
      try {
        this._accessToken = await this._accessToken.refresh();
      } catch (error) {
        this._accessToken = null;
        await this._login();
      }
    }
  }

  async login(username: string, password: string) {
    this._username = username;
    this._password = password;
    await this._login();
  }

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

  getMe(): Promise<Me> {
    return this.apiCall("/api/v2/me");
  }

  getHome(home_id: number): Promise<Home> {
    return this.apiCall(`/api/v2/homes/${home_id}`);
  }

  getWeather(home_id: number): Promise<Weather> {
    return this.apiCall(`/api/v2/homes/${home_id}/weather`);
  }

  getDevices(home_id: number): Promise<Device[]> {
    return this.apiCall(`/api/v2/homes/${home_id}/devices`);
  }

  getDeviceTemperatureOffset(serial_no: string): Promise<Temperature> {
    return this.apiCall(`/api/v2/devices/${serial_no}/temperatureOffset`);
  }

  // TODO: type
  getInstallations(home_id: number): Promise<unknown[]> {
    return this.apiCall(`/api/v2/homes/${home_id}/installations`);
  }

  getUsers(home_id: number): Promise<User> {
    return this.apiCall(`/api/v2/homes/${home_id}/users`);
  }

  getState(home_id: number): Promise<State> {
    return this.apiCall(`/api/v2/homes/${home_id}/state`);
  }

  getZoneStates(home_id: number): Promise<ZoneStates> {
    return this.apiCall(`/api/v2/homes/${home_id}/zoneStates`);
  }

  getHeatingCircuits(home_id: number): Promise<HeatingCircuit> {
    return this.apiCall(`/api/v2/homes/${home_id}/heatingCircuits`);
  }

  getMobileDevices(home_id: number): Promise<MobileDevice[]> {
    return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices`);
  }

  getMobileDevice(home_id: number, mobile_device_id: number): Promise<MobileDevice> {
    return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices/${mobile_device_id}`);
  }

  getMobileDeviceSettings(
    home_id: number,
    mobile_device_id: number,
  ): Promise<MobileDeviceSettings> {
    return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices/${mobile_device_id}/settings`);
  }

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

  getZones(home_id: number): Promise<Zone[]> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones`);
  }

  getZoneState(home_id: number, zone_id: number): Promise<ZoneState> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/state`);
  }

  getZoneControl(home_id: number, zone_id: number): Promise<ZoneControl> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/control`);
  }

  getZoneCapabilities(home_id: number, zone_id: number): Promise<ZoneCapabilities> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/capabilities`);
  }

  /**
   * @returns an empty object if overlay does not exist
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
   * @param reportDate date with YYYY-MM-DD format (ex: `2022-11-12`)
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

  getAwayConfiguration(home_id: number, zone_id: number): Promise<AwayConfiguration> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/awayConfiguration`);
  }

  getTimeTables(home_id: number, zone_id: number): Promise<TimeTables> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/schedule/activeTimetable`);
  }

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

  getTimeTable(home_id: number, zone_id: number, timetable_id: number): Promise<TimeTable> {
    return this.apiCall(
      `/api/v2/homes/${home_id}/zones/${zone_id}/schedule/timetables/${timetable_id}/blocks`,
    );
  }

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
   * @param from Start date in foramt YYYY-MM-DD
   * @param to Start date in foramt YYYY-MM-DD
   * @param aggregate Period to aggregate metrics by
   * @param summary_only Only report back a summary
   */
  getRunningTimes(
    home_id: number,
    from: string,
    to: string,
    aggregate: RunningTimeAggregation,
    summary_only: true,
  ): Promise<RunningTimesSummaryOnly>;
  getRunningTimes(
    home_id: number,
    from: string,
    to: string,
    aggregate: RunningTimeAggregation,
    summary_only: false,
  ): Promise<RunningTimes>;
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

  clearZoneOverlay(home_id: number, zone_id: number): Promise<void> {
    console.warn(
      "This method of clearing zone overlays will soon be deprecated, please use clearZoneOverlays",
    );
    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/overlay`, "delete");
  }

  /**
   * @deprecated use `setZoneOverlays` instead
   * @param temperature in celcius
   * @param termination if number then duration in seconds
   */
  async setZoneOverlay(
    home_id: number,
    zone_id: number,
    power: Power,
    temperature: number,
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
          config.setting.mode?.toLowerCase() == "cool"
        ) {
          if (temperature) {
            config.setting.temperature = { celsius: temperature };
          }

          if (fan_speed) {
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

  async clearZoneOverlays(home_id: number, zone_ids: number[]): Promise<void> {
    const rooms = zone_ids.join(",");
    return this.apiCall(`/api/v2/homes/${home_id}/overlay?rooms=${rooms}`, "delete");
  }

  /**
   * @param termination if number then duration in seconds
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
   * @param temperatureOffset in celcius
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

  identifyDevice(serial_no: string): Promise<void> {
    return this.apiCall(`/api/v2/devices/${serial_no}/identify`, "post");
  }

  setPresence(home_id: number, presence: StatePresence): Promise<void> {
    const upperCasePresence = presence.toUpperCase();

    if (!["HOME", "AWAY", "AUTO"].includes(upperCasePresence)) {
      throw new Error(
        `Invalid presence "${upperCasePresence}" must be "HOME", "AWAY", or "AUTO"`,
      );
    }

    const method = upperCasePresence == "AUTO" ? "delete" : "put";
    const config = {
      homePresence: upperCasePresence,
    };

    return this.apiCall(`/api/v2/homes/${home_id}/presenceLock`, method, config);
  }

  async isAnyoneAtHome(home_id: number): Promise<boolean> {
    const devices = await this.getMobileDevices(home_id);

    for (const device of devices) {
      if (device.settings.geoTrackingEnabled && device.location && device.location.atHome) {
        return true;
      }
    }

    return false;
  }

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

  setWindowDetection(
    home_id: number,
    zone_id: number,
    enabled: true,
    timeout: number,
  ): Promise<void>;
  setWindowDetection(home_id: number, zone_id: number, enabled: false): Promise<void>;
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

  setOpenWindowMode(home_id: number, zone_id: number, activate: boolean): Promise<void> {
    if (activate) {
      return this.apiCall(
        `/api/v2/homes/${home_id}/zones/${zone_id}/state/openWindow/activate`,
        "POST",
      );
    }

    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/state/openWindow`, "DELETE");
  }

  setChildlock(serial_no: string, child_lock: boolean): Promise<void> {
    return this.apiCall(`/api/v2/devices/${serial_no}/childLock`, "PUT", {
      childLockEnabled: child_lock,
    });
  }

  getAirComfort(home_id: number): Promise<AirComfort> {
    return this.apiCall(`/api/v2/homes/${home_id}/airComfort`);
  }

  async getAirComfortDetailed(home_id: number): Promise<AirComfortDetailed> {
    const home = await this.getHome(home_id);
    const location = `latitude=${home.geolocation.latitude}&longitude=${home.geolocation.longitude}`;
    return this.apiCall(`https://acme.tado.com/v1/homes/${home_id}/airComfort?${location}`);
  }

  async getEnergyIQ(home_id: number): Promise<EnergyIQ> {
    const home = await this.getHome(home_id);
    const country = home.address.country;
    return this.apiCall(
      `https://energy-insights.tado.com/api/homes/${home_id}/consumption?country=${country}`,
    );
  }

  getEnergyIQTariff(home_id: number): Promise<EnergyIQTariff> {
    return this.apiCall(`https://energy-insights.tado.com/api/homes/${home_id}/tariffs`);
  }

  addEnergyIQTariff(
    home_id: number,
    unit: IQUnit,
    startDate: string,
    endDate: string,
    tariffInCents: number,
  ) {
    if (!["m3", "kWh"].includes(unit)) {
      throw new Error(`Invalid unit "${unit}" must be "m3", or "kWh"`);
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

  updateEnergyIQTariff(
    home_id: number,
    tariff_id: string,
    unit: IQUnit,
    startDate: string,
    endDate: string,
    tariffInCents: number,
  ) {
    if (!["m3", "kWh"].includes(unit)) {
      throw new Error(`Invalid unit "${unit}" must be "m3", or "kWh"`);
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

  getEnergyIQMeterReadings(home_id: number): Promise<EnergyIQMeterReadings> {
    return this.apiCall(`https://energy-insights.tado.com/api/homes/${home_id}/meterReadings`);
  }

  /**
   * @param date format `YYYY-MM-DD`
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

  deleteEnergyIQMeterReading(home_id: number, reading_id: number): Promise<void> {
    return this.apiCall(
      `https://energy-insights.tado.com/api/homes/${home_id}/meterReadings/${reading_id}`,
      "delete",
      {},
    );
  }

  getEnergySavingsReport(
    home_id: number,
    year: string,
    month: string,
    countryCode: Country,
  ): Promise<EnergySavingReport> {
    return this.apiCall(
      `https://energy-bob.tado.com/${home_id}/${year}-${month}?country=${countryCode}`,
    );
  }
}
