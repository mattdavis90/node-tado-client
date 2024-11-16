import type {
  ACMode,
  FanLevel,
  FanSpeed,
  HorizontalSwing,
  Power,
  Termination,
  VerticalSwing,
  XRoom,
  XRoomsAndDevices,
} from "./types";

import { Method } from "axios";
import { Tado } from "./tado";
import * as utils from "./utils";

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
   * @param zone_id - The identifier of the room within the home.
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
    zone_id: number,
    power: Power,
    temperature?: number,
    termination?: Termination | undefined | number,
    fan_speed?: FanSpeed | FanLevel,
    ac_mode?: ACMode,
    verticalSwing?: VerticalSwing,
    horizontalSwing?: HorizontalSwing,
  ): Promise<unknown> {
    const config = utils.getSingleZoneOverlayConfig(
      this,
      home_id,
      zone_id,
      power,
      temperature,
      termination,
      fan_speed,
      ac_mode,
      verticalSwing,
      horizontalSwing,
      true,
    );
    return this.apiCallX(`/homes/${home_id}/rooms/${zone_id}/manualControl`, "post", config);
  }
}
