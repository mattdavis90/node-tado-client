import { Method } from 'axios';
import { Device, Temperature, Home, Me, MobileDevice, MobileDeviceSettings, State, User, Weather, Zone, ZoneState, ZoneCapabilities, AwayConfiguration, TimeTable, Country, Power } from './types';
export declare class Tado {
    private _httpsAgent;
    private _accessToken;
    private _username;
    private _password;
    constructor(username: string, password: string);
    _login(): Promise<void>;
    _refreshToken(): Promise<void>;
    login(username: string, password: string): Promise<void>;
    apiCall<R, T = any>(url: string, method?: Method, data?: T): Promise<R>;
    getMe(): Promise<Me>;
    getHome(home_id: number): Promise<Home>;
    getWeather(home_id: number): Promise<Weather>;
    getDevices(home_id: number): Promise<Device[]>;
    getDeviceTemperatureOffset(serial_no: string): Promise<Temperature>;
    getInstallations(home_id: number): Promise<unknown>;
    getUsers(home_id: number): Promise<User>;
    getState(home_id: number): Promise<State>;
    getMobileDevices(home_id: number): Promise<MobileDevice[]>;
    getMobileDevice(home_id: number, mobile_device_id: number): Promise<MobileDevice>;
    getMobileDeviceSettings(home_id: number, mobile_device_id: number): Promise<MobileDeviceSettings>;
    setGeoTracking(home_id: number, mobile_device_id: number, geoTrackingEnabled: boolean): Promise<MobileDeviceSettings>;
    getZones(home_id: number): Promise<Zone>;
    getZoneState(home_id: number, zone_id: number): Promise<ZoneState>;
    getZoneCapabilities(home_id: number, zone_id: number): Promise<ZoneCapabilities>;
    getZoneOverlay(home_id: number, zone_id: number): Promise<unknown>;
    /**
     * @param reportDate date with YYYY-MM-DD format (ex: `2022-11-12`)
     */
    getZoneDayReport(home_id: number, zone_id: number, reportDate: string): Promise<unknown>;
    getTimeTables(home_id: number, zone_id: number): Promise<unknown>;
    getAwayConfiguration(home_id: number, zone_id: number): Promise<AwayConfiguration>;
    getTimeTable(home_id: number, zone_id: number, timetable_id: string): Promise<TimeTable>;
    clearZoneOverlay(home_id: number, zone_id: number): Promise<unknown>;
    /**
     * @param temperature in celcius (FIXME: should accept Temperature type to let people use F)
     */
    setZoneOverlay(home_id: number, zone_id: number, power: Power, temperature: number, termination: any, fan_speed: any, ac_mode: any): Promise<unknown>;
    clearZoneOverlays(home_id: number, zone_ids: number[]): Promise<unknown>;
    setZoneOverlays(home_id: number, overlays: any, termination: any): Promise<unknown>;
    setDeviceTemperatureOffset(device_id: number, temperatureOffset: number): Promise<unknown>;
    identifyDevice(device_id: number): Promise<unknown>;
    setPresence(home_id: number, presence: any): Promise<unknown>;
    isAnyoneAtHome(home_id: number): Promise<boolean>;
    updatePresence(home_id: number): Promise<unknown>;
    setWindowDetection(home_id: number, zone_id: number, enabled: boolean, timeout: number): Promise<unknown>;
    setOpenWindowMode(home_id: number, zone_id: number, activate: boolean): Promise<unknown>;
    getAirComfort(home_id: number): Promise<unknown>;
    getAirComfortDetailed(home_id: number): Promise<any>;
    getEnergyIQ(home_id: number): Promise<unknown>;
    getEnergyIQTariff(home_id: number): Promise<unknown>;
    updateEnergyIQTariff(home_id: number, unit: any, tariffInCents: any): Promise<unknown>;
    getEnergyIQMeterReadings(home_id: number): Promise<unknown>;
    addEnergyIQMeterReading(home_id: number, date: any, reading: any): Promise<unknown>;
    deleteEnergyIQMeterReading(home_id: number, reading_id: any): Promise<unknown>;
    getEnergySavingsReport(home_id: number, year: string, month: string, countryCode: Country): Promise<unknown>;
}
