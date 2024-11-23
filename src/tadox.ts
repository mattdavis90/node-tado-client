import type {
  ACMode,
  DeepPartial,
  FanLevel,
  FanSpeed,
  HorizontalSwing,
  Power,
  Termination,
  VerticalSwing,
  XRoom,
  XRoomsAndDevices,
  XRoomSetting,
  ZoneOverlayTermination,
} from "./types";

import { Method } from "axios";
import { Tado } from "./tado";

const tado_x_url = "https://hops.tado.com";

export class TadoX extends Tado {
  /**
   * Makes an API call to the provided TadoX URL with the specified method and data.
   *
   * @typeParam R - The type of the response
   * @typeParam T - The type of the request body
   * @param url - The endpoint to which the request is sent. If the URL contains "https", it will be used as is.
   * @param method - The HTTP method to use for the request (e.g., "get", "post").
   * @param data - The payload to send with the request, if applicable.
   * @returns A promise that resolves to the response data.
   */
  async apiCallX<R, T = unknown>(url: string, method: Method = "get", data?: T): Promise<R> {
    const callUrl = tado_x_url + url;
    return this.apiCall(callUrl, method, data);
  }

  /**
   * Retrieves a list of rooms and devices associated with the given home ID.
   *
   * @param home_id - The unique identifier of the home.
   * @returns A promise that resolves to an object containing rooms and devices.
   */
  async getRoomsAndDevices(home_id: number): Promise<XRoomsAndDevices[]> {
    return this.apiCallX(`/homes/${home_id}/roomsAndDevices`);
  }

  /**
   * Fetches the rooms for a given home.
   *
   * @param home_id - The ID of the home for which to fetch the zones.
   * @returns A promise that resolves to _something_.
   */
  async getRooms(home_id: number): Promise<XRoom[]> {
    return this.apiCallX(`/homes/${home_id}/rooms`);
  }

  /**
   * Fetches the state of a specified room in a home.
   *
   * @param home_id - The ID of the home.
   * @param room_id - The ID of the room within the home.
   * @returns  A promise that resolves to _something_.
   */
  async getRoomState(home_id: number, room_id: number): Promise<XRoom> {
    return this.apiCallX(`/homes/${home_id}/rooms/${room_id}`);
  }

  /**
   * Resumes the schedule for a specific room in a home.
   *
   * @param home_id - The unique identifier of the home.
   * @param room_id - The unique identifier of the room within the home.
   * @returns  A promise that resolves when the operation is complete.
   */
  async resumeSchedule(home_id: number, room_id: number): Promise<string> {
    return this.apiCallX(`/homes/${home_id}/rooms/${room_id}/resumeSchedule`, "post", {});
  }

  /**
   * Sets manual control for a specific room in a home.
   *
   * @param home_id - The identifier of the home.
   * @param room_id - The identifier of the room within the home.
   * @param power - The power state, either 'ON' or 'OFF'.
   * @param temperature - The desired temperature for the overlay, in celsius.
   * @param termination - The termination condition for the overlay. Options include 'MANUAL', 'AUTO', 'NEXT_TIME_BLOCK', or a number representing duration in seconds.
   * @param fan_speed - The desired fan speed or level.
   * @param ac_mode - The air conditioning mode (e.g., 'COOL', 'HEAT').
   * @param verticalSwing - The vertical swing setting for air conditioning.
   * @param horizontalSwing - The horizontal swing setting for air conditioning.
   * @returns  A promise that resolves to the created zone overlay.
   */
  async manualControl(
    home_id: number,
    room_id: number,
    power: Power,
    temperature?: number,
    termination?: Termination | undefined | number,
    fan_speed?: FanSpeed | FanLevel,
    ac_mode?: ACMode,
    verticalSwing?: VerticalSwing,
    horizontalSwing?: HorizontalSwing,
  ): Promise<unknown> {
    // NOTE: If you update this code please also update `setZoneOverlay` in `tado.js`
    const room_state = await this.getRoomState(home_id, room_id);

    const config: {
      setting: DeepPartial<XRoomSetting>;
      termination?: Partial<ZoneOverlayTermination>;
      type: "MANUAL";
    } = {
      setting: {
        type: room_state.setting.type,
      },
      type: "MANUAL",
    };

    if (power.toUpperCase() == "ON") {
      config.setting.power = "ON";

      if (
        (config.setting.type == "HEATING" || config.setting.type == "HOT_WATER") &&
        temperature
      ) {
        config.setting.temperature = { value: temperature };
      }

      if (room_state.setting.type == "AIR_CONDITIONING") {
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
            config.setting.temperature = { value: temperature };
          }

          if (fan_speed && config.setting.mode?.toLowerCase() != "dry") {
            if (room_state.setting.fanLevel !== undefined) {
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

    return this.apiCallX(`/homes/${home_id}/rooms/${room_id}/manualControl`, "post", config);
  }
}
