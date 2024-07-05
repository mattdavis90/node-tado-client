import { Method } from "axios";
import {
  ACMode,
  AddEnergiIQMeterReadingResponse,
  AirComfort,
  AirComfortDetailed,
  AwayConfiguration,
  Country,
  DefaultOverlay,
  Device,
  EnergyIQMeterReadings,
  EnergyIQOverview,
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
  ZoneOverlay,
  ZoneState,
  ZoneStates,
} from "./types";

export * from "./types";
export declare class Tado {
  private _httpsAgent;
  private _accessToken?;
  private _username?;
  private _password?;
  constructor(username?: string, password?: string);
  private _login;
  private _refreshToken;
  login(username: string, password: string): Promise<void>;
  apiCall<R, T = unknown>(url: string, method?: Method, data?: T): Promise<R>;
  getMe(): Promise<Me>;
  getHome(home_id: number): Promise<Home>;
  getWeather(home_id: number): Promise<Weather>;
  getDevices(home_id: number): Promise<Device[]>;
  getDeviceTemperatureOffset(serial_no: string): Promise<Temperature>;
  getInstallations(home_id: number): Promise<unknown[]>;
  getUsers(home_id: number): Promise<User>;
  getState(home_id: number): Promise<State>;
  getZoneStates(home_id: number): Promise<ZoneStates>;
  getHeatingCircuits(home_id: number): Promise<HeatingCircuit>;
  getMobileDevices(home_id: number): Promise<MobileDevice[]>;
  getMobileDevice(home_id: number, mobile_device_id: number): Promise<MobileDevice>;
  getMobileDeviceSettings(
    home_id: number,
    mobile_device_id: number,
  ): Promise<MobileDeviceSettings>;
  setGeoTracking(
    home_id: number,
    mobile_device_id: number,
    geoTrackingEnabled: boolean,
  ): Promise<MobileDeviceSettings>;
  getZones(home_id: number): Promise<Zone[]>;
  getZoneState(home_id: number, zone_id: number): Promise<ZoneState>;
  getZoneControl(home_id: number, zone_id: number): Promise<ZoneControl>;
  getZoneCapabilities(home_id: number, zone_id: number): Promise<ZoneCapabilities>;
  /**
   * @returns an empty object if overlay does not exist
   */
  getZoneOverlay(
    home_id: number,
    zone_id: number,
  ): Promise<ZoneOverlay | Record<string, never>>;
  /**
   * @param reportDate date with YYYY-MM-DD format (ex: `2022-11-12`)
   */
  getZoneDayReport(
    home_id: number,
    zone_id: number,
    reportDate: string,
  ): Promise<ZoneDayReport>;
  getAwayConfiguration(home_id: number, zone_id: number): Promise<AwayConfiguration>;
  getTimeTables(home_id: number, zone_id: number): Promise<TimeTables>;
  setActiveTimeTable(
    home_id: number,
    zone_id: number,
    timetable: TimeTables,
  ): Promise<TimeTables>;
  getTimeTable(home_id: number, zone_id: number, timetable_id: number): Promise<TimeTable>;
  setTimeTable(
    home_id: number,
    zone_id: number,
    timetable_id: number,
    timetable: TimeTable,
    day_type: TimeTableDayType,
  ): Promise<TimeTables>;
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
  /**
   * @deprecated use `clearZoneOverlays` instead
   */
  clearZoneOverlay(home_id: number, zone_id: number): Promise<void>;
  /**
   * @deprecated use `setZoneOverlays` instead
   * @param temperature in celcius
   * @param termination if number then duration in seconds
   */
  setZoneOverlay(
    home_id: number,
    zone_id: number,
    power: Power,
    temperature: number,
    termination?: Termination | undefined | number,
    fan_speed?: FanSpeed | FanLevel,
    ac_mode?: ACMode,
    verticalSwing?: VerticalSwing,
    horizontalSwing?: HorizontalSwing,
  ): Promise<ZoneOverlay>;
  clearZoneOverlays(home_id: number, zone_ids: number[]): Promise<void>;
  /**
   * @param termination if number then duration in seconds
   */
  setZoneOverlays(
    home_id: number,
    overlays: SetZoneOverlaysArg[],
    termination: Termination | undefined | number,
  ): Promise<void>;
  getZoneDefaultOverlay(home_id: number, zone_id: number): Promise<DefaultOverlay>;
  setZoneDefaultOverlay(
    home_id: number,
    zone_id: number,
    overlay: DefaultOverlay,
  ): Promise<DefaultOverlay>;
  /**
   * @param temperatureOffset in celcius
   */
  setDeviceTemperatureOffset(
    serial_no: string,
    temperatureOffset: number,
  ): Promise<Temperature>;
  identifyDevice(serial_no: string): Promise<void>;
  setPresence(home_id: number, presence: StatePresence): Promise<void>;
  isAnyoneAtHome(home_id: number): Promise<boolean>;
  updatePresence(home_id: number): Promise<void | "already up to date">;
  setWindowDetection(
    home_id: number,
    zone_id: number,
    enabled: true,
    timeout: number,
  ): Promise<void>;
  setWindowDetection(home_id: number, zone_id: number, enabled: false): Promise<void>;
  setOpenWindowMode(home_id: number, zone_id: number, activate: boolean): Promise<void>;
  setChildlock(serial_no: string, child_lock: boolean): Promise<void>;
  getAirComfort(home_id: number): Promise<AirComfort>;
  getAirComfortDetailed(home_id: number): Promise<AirComfortDetailed>;
  getEnergyIQOverview(home_id: number, month: number, year: number): Promise<EnergyIQOverview>;
  getEnergyIQTariff(home_id: number): Promise<EnergyIQTariff>;
  addEnergyIQTariff(
    home_id: number,
    unit: IQUnit,
    startDate: string,
    endDate: string,
    tariffInCents: number,
  ): Promise<unknown>;
  updateEnergyIQTariff(
    home_id: number,
    tariff_id: string,
    unit: IQUnit,
    startDate: string,
    endDate: string,
    tariffInCents: number,
  ): Promise<unknown>;
  getEnergyIQMeterReadings(home_id: number): Promise<EnergyIQMeterReadings>;
  /**
   * @param date format `YYYY-MM-DD`
   */
  addEnergyIQMeterReading(
    home_id: number,
    date: string,
    reading: number,
  ): Promise<AddEnergiIQMeterReadingResponse>;
  deleteEnergyIQMeterReading(home_id: number, reading_id: number): Promise<void>;
  getEnergySavingsReport(
    home_id: number,
    year: string,
    month: string,
    countryCode: Country,
  ): Promise<EnergySavingReport>;
}
