import type {
  ACMode,
  AirComfort,
  AwayConfiguration,
  DeepPartial,
  DefaultOverlay,
  Device,
  FanLevel,
  FanSpeed,
  HorizontalSwing,
  Power,
  SetZoneOverlayArg,
  SetZoneOverlaysArg,
  Temperature,
  Termination,
  TimeTable,
  TimeTableDayType,
  TimeTables,
  VerticalSwing,
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

import { AxiosError } from "axios";
import { BaseTado } from "./base";

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
 * // Set a cllabck to catch token changes
 * tado.setTokenCallback(console.log);
 *
 * // Authenticate with the Tado API
 *  const [verify, futureToken] = await tado.authenticate("refresh_token");
 *
 *  if (verify) {
 *    console.log("------------------------------------------------");
 *    console.log("Device authentication required.");
 *    console.log("Please visit the following website in a browser.");
 *    console.log("");
 *    console.log(`  ${verify.verification_uri_complete}`);
 *    console.log("");
 *    console.log(
 *      `Checks will occur every ${verify.interval}s up to a maximum of ${verify.expires_in}s`,
 *    );
 *    console.log("------------------------------------------------");
 *  }
 *  await futureToken;
 *
 *  const me = await tado.getMe();
 *  console.log(me);
 * ```
 */
export class Tado extends BaseTado {
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
    return this.apiCall<ZoneOverlay>(`/api/v2/homes/${home_id}/zones/${zone_id}/overlay`).catch(
      (error) => {
        if (error instanceof AxiosError && error.response?.status === 404) return {};
        throw error;
      },
    );
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
   * Sets the away configuration for a specified zone in the home.
   *
   * @param home_id - The unique identifier of the home.
   * @param zone_id - The unique identifier of the zone within the home.
   * @param config - The configuration settings for away mode.
   * @returns A promise that resolves when the configuration has been successfully set.
   */
  setAwayConfiguration(
    home_id: number,
    zone_id: number,
    config: AwayConfiguration,
  ): Promise<void> {
    return this.apiCall(
      `/api/v2/homes/${home_id}/zones/${zone_id}/awayConfiguration`,
      "PUT",
      config,
    );
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
   * Checks if the early start feature is enabled for a given zone.
   *
   * @param home_id - The unique identifier of the home.
   * @param zone_id - The ID of the zone whose early start feature status is to be checked.
   * @returns A promise that resolves to a boolean indicating whether the early start feature is enabled.
   */
  async isZoneEarlyStartEnabled(home_id: number, zone_id: number): Promise<boolean> {
    const { enabled } = await this.apiCall<{ enabled: boolean }>(
      `/api/v2/homes/${home_id}/zones/${zone_id}/earlyStart`,
    );
    return enabled;
  }

  /**
   * Sets the early start feature for a specified zone.
   *
   * @param home_id - The unique identifier of the home.
   * @param zone_id - The ID of the zone whose early start feature status is to be set.
   * @param enabled - A boolean indicating whether the early start feature should be enabled or disabled.
   * @returns A promise that resolves when the early start setting has been successfully updated.
   */
  setZoneEarlyStart(home_id: number, zone_id: number, enabled: boolean): Promise<void> {
    return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/earlyStart`, "PUT", {
      enabled: enabled,
    });
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
    // NOTE: If you update this code please also update `manualControl` in `tadox.js`

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
        const ac_capability = zone_capabilities.FAN || zone_capabilities.AUTO;

        if (ac_mode) {
          config.setting.mode = ac_mode.toUpperCase() as ACMode;
        }

        if (verticalSwing && ac_capability.verticalSwing) {
          config.setting.verticalSwing = verticalSwing;
        }

        if (horizontalSwing && ac_capability.horizontalSwing) {
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
            if (ac_capability.fanLevel !== undefined) {
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
}
