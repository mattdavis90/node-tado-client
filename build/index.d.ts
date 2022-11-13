import { Method } from 'axios';
import { Device, Temperature, Home, Me, MobileDevice, MobileDeviceSettings, State, User, Weather, Zone, ZoneState, ZoneCapabilities, AwayConfiguration, TimeTable, Country, Power, Termination, StatePresence, IQUnit, ZoneOverlay, TimeTables, AirComfort, EnergyIQ, EnergyIQMeterReadings, EnergySavingReport, AirComfortDetailed } from './types';
export declare class Tado {
    private _httpsAgent;
    private _accessToken?;
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
    /**
     * @returns an empty object if overlay does not exist
     */
    getZoneOverlay(home_id: number, zone_id: number): Promise<ZoneOverlay | {}>;
    /**
     * @param reportDate date with YYYY-MM-DD format (ex: `2022-11-12`)
     */
    getZoneDayReport(home_id: number, zone_id: number, reportDate: string): Promise<unknown>;
    getTimeTables(home_id: number, zone_id: number): Promise<TimeTables>;
    getAwayConfiguration(home_id: number, zone_id: number): Promise<AwayConfiguration>;
    getTimeTable(home_id: number, zone_id: number, timetable_id: string): Promise<TimeTable>;
    clearZoneOverlay(home_id: number, zone_id: number): Promise<void>;
    /**
     * @param temperature in celcius
     * @param termination if number then duration in seconds
     */
    setZoneOverlay(home_id: number, zone_id: number, power: Power, temperature: number, termination?: Termination | undefined | number, fan_speed?: any, // TODO: any here
    ac_mode?: any): Promise<ZoneOverlay>;
    clearZoneOverlays(home_id: number, zone_ids: number[]): Promise<void>;
    /**
     * @param termination if number then duration in seconds
     */
    setZoneOverlays(home_id: number, overlays: {
        zone_id: number;
        power?: Power;
        mode?: any;
        temperature?: Temperature;
        fanLevel?: any;
        verticalSwing?: any;
        horizontalSwing?: any;
        light?: any;
    }[], termination: Termination | undefined | number): Promise<void>;
    /**
     * @param temperatureOffset in celcius
     */
    setDeviceTemperatureOffset(serial_no: number, temperatureOffset: number): Promise<Temperature>;
    identifyDevice(serial_no: string): Promise<void>;
    setPresence(home_id: number, presence: StatePresence): Promise<void>;
    isAnyoneAtHome(home_id: number): Promise<boolean>;
    updatePresence(home_id: number): Promise<void | 'already up to date'>;
    setWindowDetection(home_id: number, zone_id: number, enabled: true, timeout: number): Promise<void>;
    setWindowDetection(home_id: number, zone_id: number, enabled: false): Promise<void>;
    setOpenWindowMode(home_id: number, zone_id: number, activate: boolean): Promise<void>;
    getAirComfort(home_id: number): Promise<AirComfort>;
    getAirComfortDetailed(home_id: number): Promise<AirComfortDetailed>;
    getEnergyIQ(home_id: number): Promise<EnergyIQ>;
    getEnergyIQTariff(home_id: number): Promise<unknown>;
    updateEnergyIQTariff(home_id: number, unit: IQUnit, tariffInCents: number): Promise<unknown>;
    getEnergyIQMeterReadings(home_id: number): Promise<EnergyIQMeterReadings>;
    /**
     * @param date format `YYYY-MM-DD`
     */
    addEnergyIQMeterReading(home_id: number, date: string, reading: number): Promise<unknown>;
    deleteEnergyIQMeterReading(home_id: number, reading_id: number): Promise<unknown>;
    getEnergySavingsReport(home_id: number, year: string, month: string, countryCode: Country): Promise<EnergySavingReport>;
}
