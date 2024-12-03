import { Method } from "axios";
import { Tado } from "./tado";
import {
  ActionableDevice,
  Power,
  XFeatures,
  XOverlay,
  XQuickAction,
  XRoom,
  XRoomAwayConfiguration,
  XRoomsAndDevices,
  XTermination,
} from "./types";

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
   * Fetches the features supported by the home.
   *
   * @param home_id - The ID of the home for which to fetch the zones.
   * @returns A promise that resolves to a list of features.
   */
  async getFeatures(home_id: number): Promise<XFeatures> {
    return this.apiCallX(`/homes/${home_id}/features`);
  }

  /**
   * Retrieve actionable devices.
   *
   * @param home_id - The ID of the home for which to fetch the zones.
   * @returns A promise that resolves to a list of actionable devices.
   */
  async getActionableDevices(home_id: number): Promise<ActionableDevice[]> {
    return this.apiCallX(`/homes/${home_id}/actionableDevices`);
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
   * @returns A promise that resolves to a list of room states.
   */
  async getRooms(home_id: number): Promise<XRoom[]> {
    return this.apiCallX(`/homes/${home_id}/rooms`);
  }

  /**
   * Fetches the state of a specified room in a home.
   *
   * @param home_id - The ID of the home.
   * @param room_id - The ID of the room within the home.
   * @returns  A promise that resolves to a room's state.
   */
  async getRoomState(home_id: number, room_id: number): Promise<XRoom> {
    return this.apiCallX(`/homes/${home_id}/rooms/${room_id}`);
  }

  /**
   * Perform a predefined quick action on all rooms.
   *
   * @param home_id - The ID of the home.
   * @param action - The action to perform.
   * @returns  A promise that resolves on completion.
   */
  async performQuickAction(home_id: number, action: XQuickAction): Promise<string> {
    return this.apiCallX(`/homes/${home_id}/quickActions/${action}`, "POST", {});
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
   * @param termination - The termination condition for the overlay. Options include 'MANUAL', 'NEXT_TIME_BLOCK', or a number representing duration in seconds.
   * @param temperature - The desired temperature for the overlay, in celsius.
   * @returns  A promise that resolves to the created zone overlay.
   */
  async manualControl(
    home_id: number,
    room_id: number,
    power: Power,
    termination: XTermination | number,
    temperature?: number,
  ): Promise<unknown> {
    const overlay: XOverlay = {
      setting: {
        power,
        temperature: null,
      },
      termination: {
        type: "MANUAL",
      },
    };

    if (power == "ON" && temperature) {
      overlay.setting.temperature = {
        value: temperature,
        precision: 0.1,
      };
    }

    if (typeof termination === "string" && !isNaN(parseInt(termination))) {
      termination = parseInt(termination);
    }

    if (typeof termination === "number") {
      overlay.termination = {
        type: "TIMER",
        durationInSeconds: termination,
      };
    } else if (termination.toLowerCase() == "next_time_block") {
      overlay.termination = {
        type: "NEXT_TIME_BLOCK",
      };
    }

    return this.apiCallX(`/homes/${home_id}/rooms/${room_id}/manualControl`, "post", overlay);
  }

  /**
   * Set device child lock status.
   *
   * @param home_id - The ID of the home for which to fetch the zones.
   * @param serial_no - The serial number of the device.
   * @param child_lock - Boolean value to enable or disable the child lock.
   * @returns A promise that resolves when the operation is complete.
   */
  // @ts-expect-error TS2416
  async setChildlock(home_id: number, serial_no: string, child_lock: boolean): Promise<void> {
    return this.apiCallX(`/homes/${home_id}/roomsAndDevices/devices/${serial_no}`, "patch", {
      childLockEnabled: child_lock,
    });
  }

  /**
   * Set device child lock status.
   *
   * @param home_id - The ID of the home for which to fetch the zones.
   * @param serial_no - The serial number of the device.
   * @param temperatureOffset - The temperature offset to be set, in degrees Celsius.
   * @returns A promise that resolves when the operation is complete.
   */
  // @ts-expect-error TS2416
  async setDeviceTemperatureOffset(
    home_id: number,
    serial_no: string,
    temperatureOffset: number,
  ): Promise<void> {
    return this.apiCallX(`/homes/${home_id}/roomsAndDevices/devices/${serial_no}`, "patch", {
      temperatureOffset: temperatureOffset,
    });
  }

  /**
   * Retrieves the away configuration for a specific home and zone.
   *
   * @param home_id - The unique identifier of the home.
   * @param room_id - The unique identifier of the zone within the home.
   * @returns A promise that resolves to the away configuration object.
   */
  // @ts-expect-error TS2416
  async getAwayConfiguration(
    home_id: number,
    room_id: number,
  ): Promise<XRoomAwayConfiguration> {
    return this.apiCallX(`/homes/${home_id}/settings/away/rooms/${room_id}`);
  }

  /**
   * Sets the away configuration for a specified zone in the home.
   *
   * @param home_id - The unique identifier of the home.
   * @param room_id - The unique identifier of the zone within the home.
   * @param config - The configuration settings for away mode.
   * @returns A promise that resolves when the configuration has been successfully set.
   */
  // @ts-expect-error TS2416
  async setAwayConfiguration(
    home_id: number,
    room_id: number,
    config: Omit<XRoomAwayConfiguration, "roomId">,
  ): Promise<XRoomAwayConfiguration> {
    return this.apiCallX(`/homes/${home_id}/settings/away/rooms/${room_id}`, "put", config);
  }

  /**
   * Check if home is hot water capable.
   *
   * @param home_id - The unique identifier of the home.
   * @returns True if the home is hot water capable, false otherwise.
   */
  async isDomesticHotWaterCapable(home_id: number): Promise<boolean> {
    const response: { isDomesticHotWaterCapable: boolean } = await this.apiCallX(
      `/homes/${home_id}/programmer/domesticHotWater`,
    );
    return response.isDomesticHotWaterCapable;
  }
}
