"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tado = void 0;
const simple_oauth2_1 = require("simple-oauth2");
const axios_1 = __importDefault(require("axios"));
const https_1 = require("https");
__exportStar(require("./types"), exports);
const EXPIRATION_WINDOW_IN_SECONDS = 300;
const tado_auth_url = 'https://auth.tado.com';
const tado_url = 'https://my.tado.com';
const tado_config = {
    client: {
        id: 'tado-web-app',
        secret: 'wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc',
    },
    auth: {
        tokenHost: tado_auth_url,
    },
};
const client = new simple_oauth2_1.ResourceOwnerPassword(tado_config);
class Tado {
    constructor(username, password) {
        this._username = username;
        this._password = password;
        this._httpsAgent = new https_1.Agent({ keepAlive: true });
    }
    async _login() {
        if (!this._username || !this._password) {
            throw new Error('Please login before using Tado!');
        }
        const tokenParams = {
            username: this._username,
            password: this._password,
            scope: 'home.user',
        };
        try {
            this._accessToken = await client.getToken(tokenParams);
        }
        catch (error) {
            throw error;
        }
    }
    async _refreshToken() {
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
            }
            catch (error) {
                this._accessToken = null;
                await this._login();
            }
        }
    }
    async login(username, password) {
        this._username = username;
        this._password = password;
        await this._login();
    }
    async apiCall(url, method = 'get', data) {
        var _a;
        await this._refreshToken();
        let callUrl = tado_url + url;
        if (url.includes('https')) {
            callUrl = url;
        }
        const request = {
            url: callUrl,
            method: method,
            data: data,
            headers: {
                Authorization: 'Bearer ' + ((_a = this._accessToken) === null || _a === void 0 ? void 0 : _a.token.access_token),
            },
            httpsAgent: this._httpsAgent,
        };
        if (method !== 'get' && method !== 'GET') {
            request.data = data;
        }
        const response = await (0, axios_1.default)(request);
        return response.data;
    }
    getMe() {
        return this.apiCall('/api/v2/me');
    }
    getHome(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}`);
    }
    getWeather(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/weather`);
    }
    getDevices(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/devices`);
    }
    getDeviceTemperatureOffset(serial_no) {
        return this.apiCall(`/api/v2/devices/${serial_no}/temperatureOffset`);
    }
    // TODO: type
    getInstallations(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/installations`);
    }
    getUsers(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/users`);
    }
    getState(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/state`);
    }
    getZoneStates(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zoneStates`);
    }
    getHeatingCircuits(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/heatingCircuits`);
    }
    getMobileDevices(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices`);
    }
    getMobileDevice(home_id, mobile_device_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices/${mobile_device_id}`);
    }
    getMobileDeviceSettings(home_id, mobile_device_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices/${mobile_device_id}/settings`);
    }
    setGeoTracking(home_id, mobile_device_id, geoTrackingEnabled) {
        return this.getMobileDeviceSettings(home_id, mobile_device_id).then((settings) => this.apiCall(`/api/v2/homes/${home_id}/mobileDevices/${mobile_device_id}/settings`, 'put', {
            ...settings,
            geoTrackingEnabled: geoTrackingEnabled,
        }));
    }
    getZones(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones`);
    }
    getZoneState(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/state`);
    }
    getZoneControl(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/control`);
    }
    getZoneCapabilities(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/capabilities`);
    }
    /**
     * @returns an empty object if overlay does not exist
     */
    getZoneOverlay(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/overlay`).catch((error) => {
            if (error.response.status === 404) {
                return {};
            }
            throw error;
        });
    }
    /**
     * @param reportDate date with YYYY-MM-DD format (ex: `2022-11-12`)
     */
    getZoneDayReport(home_id, zone_id, reportDate) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/dayReport?date=${reportDate}`);
    }
    getAwayConfiguration(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/awayConfiguration`);
    }
    getTimeTables(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/schedule/activeTimetable`);
    }
    setActiveTimeTable(home_id, zone_id, timetable) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/schedule/activeTimetable`, 'PUT', timetable);
    }
    getTimeTable(home_id, zone_id, timetable_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/schedule/timetables/${timetable_id}/blocks`);
    }
    setTimeTable(home_id, zone_id, timetable_id, timetable, day_type) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/schedule/timetables/${timetable_id}/blocks/${day_type}`, 'PUT', timetable);
    }
    getRunningTimes(home_id, from, to, aggregate, summary_only) {
        return this.apiCall(`https://minder.tado.com/v1/homes/${home_id}/runningTimes?from=${from}&to=${to}&aggregate=${aggregate}&summary_only=${summary_only}`);
    }
    clearZoneOverlay(home_id, zone_id) {
        console.warn('This method of clearing zone overlays will soon be deprecated, please use clearZoneOverlays');
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/overlay`, 'delete');
    }
    /**
     * @param temperature in celcius
     * @param termination if number then duration in seconds
     */
    async setZoneOverlay(home_id, zone_id, power, temperature, termination, fan_speed, ac_mode) {
        console.warn('This method of setting zone overlays will soon be deprecated, please use setZoneOverlays');
        const zone_capabilities = await this.getZoneCapabilities(home_id, zone_id);
        const config = {
            setting: {
                type: zone_capabilities.type,
            },
            termination: {},
        };
        if (power.toUpperCase() == 'ON') {
            config.setting.power = 'ON';
            if ((config.setting.type == 'HEATING' ||
                config.setting.type == 'HOT_WATER') &&
                temperature) {
                config.setting.temperature = { celsius: temperature };
            }
            if (zone_capabilities.type == 'AIR_CONDITIONING') {
                if (ac_mode) {
                    config.setting.mode = ac_mode.toUpperCase();
                }
                if (config.setting.mode.toLowerCase() == 'heat' ||
                    config.setting.mode.toLowerCase() == 'cool') {
                    if (temperature) {
                        config.setting.temperature = { celsius: temperature };
                    }
                    if (fan_speed) {
                        if (zone_capabilities.FAN.fanLevel !== undefined) {
                            config.setting.fanLevel = fan_speed.toUpperCase();
                        }
                        else {
                            config.setting.fanSpeed = fan_speed.toUpperCase();
                        }
                    }
                }
            }
        }
        else {
            config.setting.power = 'OFF';
        }
        if (!termination) {
            termination = 'MANUAL';
        }
        if (typeof termination === 'string' && !isNaN(parseInt(termination))) {
            termination = parseInt(termination);
        }
        if (typeof termination === 'number') {
            config.type = 'MANUAL';
            config.termination.typeSkillBasedApp = 'TIMER';
            config.termination.durationInSeconds = termination;
        }
        else if (termination.toLowerCase() == 'manual') {
            config.type = 'MANUAL';
            config.termination.typeSkillBasedApp = 'MANUAL';
        }
        else if (termination.toLowerCase() == 'auto') {
            config.termination.type = 'TADO_MODE';
        }
        else if (termination.toLowerCase() == 'next_time_block') {
            config.type = 'MANUAL';
            config.termination.typeSkillBasedApp = 'NEXT_TIME_BLOCK';
        }
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/overlay`, 'put', config);
    }
    async clearZoneOverlays(home_id, zone_ids) {
        const rooms = zone_ids.join(',');
        return this.apiCall(`/api/v2/homes/${home_id}/overlay?rooms=${rooms}`, 'delete');
    }
    /**
     * @param termination if number then duration in seconds
     */
    async setZoneOverlays(home_id, overlays, termination) {
        let termination_config = {};
        if (!termination) {
            termination = 'MANUAL';
        }
        if (typeof termination === 'string' && !isNaN(parseInt(termination))) {
            termination = parseInt(termination);
        }
        if (typeof termination === 'number') {
            termination_config.typeSkillBasedApp = 'TIMER';
            termination_config.durationInSeconds = termination;
        }
        else if (termination.toLowerCase() == 'manual') {
            termination_config.typeSkillBasedApp = 'MANUAL';
        }
        else if (termination.toLowerCase() == 'auto') {
            termination_config.typeSkillBasedApp = 'TADO_MODE';
        }
        else if (termination.toLowerCase() == 'next_time_block') {
            termination_config.typeSkillBasedApp = 'NEXT_TIME_BLOCK';
        }
        let config = {
            overlays: [],
        };
        for (let overlay of overlays) {
            const zone_capabilities = await this.getZoneCapabilities(home_id, overlay.zone_id);
            const overlay_config = {
                overlay: {
                    setting: {
                        type: zone_capabilities.type,
                    },
                    termination: termination_config,
                },
                room: overlay.zone_id,
            };
            [
                'power',
                'mode',
                'temperature',
                'verticalSwing',
                'horizontalSwing',
                'light',
            ].forEach((prop) => {
                if (overlay.hasOwnProperty(prop)) {
                    if (typeof overlay[prop] === 'string' ||
                        overlay[prop] instanceof String) {
                        overlay_config.overlay.setting[prop] = overlay[prop].toUpperCase();
                    }
                    else {
                        overlay_config.overlay.setting[prop] = overlay[prop];
                    }
                }
            });
            if (overlay['fanLevel']) {
                if (zone_capabilities.type == 'AIR_CONDITIONING') {
                    if (zone_capabilities.FAN.fanLevel !== undefined) {
                        overlay_config.overlay.setting.fanLevel =
                            overlay.fanLevel.toUpperCase();
                    }
                    else {
                        overlay_config.overlay.setting.fanSpeed =
                            overlay.fanLevel.toUpperCase();
                    }
                }
            }
            config.overlays.push(overlay_config);
        }
        return this.apiCall(`/api/v2/homes/${home_id}/overlay`, 'post', config);
    }
    /**
     * @param temperatureOffset in celcius
     */
    setDeviceTemperatureOffset(serial_no, temperatureOffset) {
        const config = {
            celsius: temperatureOffset,
        };
        return this.apiCall(`/api/v2/devices/${serial_no}/temperatureOffset`, 'put', config);
    }
    identifyDevice(serial_no) {
        return this.apiCall(`/api/v2/devices/${serial_no}/identify`, 'post');
    }
    setPresence(home_id, presence) {
        const upperCasePresence = presence.toUpperCase();
        if (!['HOME', 'AWAY', 'AUTO'].includes(upperCasePresence)) {
            throw new Error(`Invalid presence "${upperCasePresence}" must be "HOME", "AWAY", or "AUTO"`);
        }
        const method = upperCasePresence == 'AUTO' ? 'delete' : 'put';
        const config = {
            homePresence: upperCasePresence,
        };
        return this.apiCall(`/api/v2/homes/${home_id}/presenceLock`, method, config);
    }
    async isAnyoneAtHome(home_id) {
        const devices = await this.getMobileDevices(home_id);
        for (const device of devices) {
            if (device.settings.geoTrackingEnabled &&
                device.location &&
                device.location.atHome) {
                return true;
            }
        }
        return false;
    }
    async updatePresence(home_id) {
        const [isAnyoneAtHome, presenceState] = await Promise.all([
            this.isAnyoneAtHome(home_id),
            this.getState(home_id),
        ]);
        const isPresenceAtHome = presenceState.presence === 'HOME';
        if (isAnyoneAtHome !== isPresenceAtHome) {
            return this.setPresence(home_id, isAnyoneAtHome ? 'HOME' : 'AWAY');
        }
        else {
            return 'already up to date';
        }
    }
    setWindowDetection(home_id, zone_id, enabled, timeout) {
        const config = {
            enabled: enabled,
            timeoutInSeconds: timeout,
        };
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/openWindowDetection`, 'PUT', config);
    }
    setOpenWindowMode(home_id, zone_id, activate) {
        if (activate) {
            return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/state/openWindow/activate`, 'POST');
        }
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/state/openWindow`, 'DELETE');
    }
    setChildlock(serial_no, child_lock) {
        return this.apiCall(`/api/v2/devices/${serial_no}/childLock`, 'PUT', {
            childLockEnabled: child_lock,
        });
    }
    getAirComfort(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/airComfort`);
    }
    async getAirComfortDetailed(home_id) {
        const home = await this.getHome(home_id);
        const location = `latitude=${home.geolocation.latitude}&longitude=${home.geolocation.longitude}`;
        return this.apiCall(`https://acme.tado.com/v1/homes/${home_id}/airComfort?${location}`);
    }
    async getEnergyIQ(home_id) {
        const home = await this.getHome(home_id);
        const country = home.address.country;
        return this.apiCall(`https://energy-insights.tado.com/api/homes/${home_id}/consumption?country=${country}`);
    }
    getEnergyIQTariff(home_id) {
        return this.apiCall(`https://energy-insights.tado.com/api/homes/${home_id}/tariffs`);
    }
    addEnergyIQTariff(home_id, unit, startDate, endDate, tariffInCents) {
        if (!['m3', 'kWh'].includes(unit)) {
            throw new Error(`Invalid unit "${unit}" must be "m3", or "kWh"`);
        }
        return this.apiCall(`https://energy-insights.tado.com/api/homes/${home_id}/tariffs`, 'post', {
            unit: unit,
            startDate: startDate,
            endDate: endDate,
            tariffInCents: tariffInCents,
        });
    }
    updateEnergyIQTariff(home_id, tariff_id, unit, startDate, endDate, tariffInCents) {
        if (!['m3', 'kWh'].includes(unit)) {
            throw new Error(`Invalid unit "${unit}" must be "m3", or "kWh"`);
        }
        return this.apiCall(`https://energy-insights.tado.com/api/homes/${home_id}/tariffs/${tariff_id}`, 'put', {
            unit: unit,
            startDate: startDate,
            endDate: endDate,
            tariffInCents: tariffInCents,
        });
    }
    getEnergyIQMeterReadings(home_id) {
        return this.apiCall(`https://energy-insights.tado.com/api/homes/${home_id}/meterReadings`);
    }
    /**
     * @param date format `YYYY-MM-DD`
     */
    addEnergyIQMeterReading(home_id, date, reading) {
        return this.apiCall(`https://energy-insights.tado.com/api/homes/${home_id}/meterReadings`, 'post', { date: date, reading: reading });
    }
    deleteEnergyIQMeterReading(home_id, reading_id) {
        return this.apiCall(`https://energy-insights.tado.com/api/homes/${home_id}/meterReadings/${reading_id}`, 'delete', {});
    }
    getEnergySavingsReport(home_id, year, month, countryCode) {
        return this.apiCall(`https://energy-bob.tado.com/${home_id}/${year}-${month}?country=${countryCode}`);
    }
}
exports.Tado = Tado;
