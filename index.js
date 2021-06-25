"use strict";

const EXPIRATION_WINDOW_IN_SECONDS = 300;

const tado_auth_url = 'https://auth.tado.com';
const tado_url = 'https://my.tado.com';
const oauth_path = '/oauth/token';
const tado_config = {
    client: {
        id: 'tado-web-app',
        secret: 'wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc',
    },
    auth: {
        tokenHost: tado_auth_url,
    }
}

const { ResourceOwnerPassword } = require('simple-oauth2');
const client = new ResourceOwnerPassword(tado_config);

const axios = require('axios');


class Tado {
    constructor(username, password) {
        this._username = username;
        this._password = password;
        this._accessToken;
    }

    async _login() {
        const tokenParams = {
            username: this._username,
            password: this._password,
            scope: 'home.user',
        };

        try {
            this._accessToken = await client.getToken(tokenParams);
        } catch(error) {
            throw error;
        }
    }

    async _refreshToken() {
        if (!this._accessToken) {
            await this._login();
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

    async login(username, password) {
        this._username = username;
        this._password = password;
        await this._login();
    }

    async apiCall(url, method = 'get', data = {}) {
        await this._refreshToken();

        const response = await axios({
            url: tado_url + url,
            method: method,
            data: data,
            headers: {
                Authorization: 'Bearer ' + this._accessToken.token.access_token
            }
        });

        return response.data;
    }

    async getMe() {
        return this.apiCall('/api/v2/me');
    }

    async getHome(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}`);
    }

    async getWeather(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/weather`);
    }

    async getDevices(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/devices`);
    }

    async getDeviceTemperatureOffset(device_id) {
        return this.apiCall(`/api/v2/devices/${device_id}/temperatureOffset`);
    }

    async getInstallations(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/installations`);
    }

    async getUsers(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/users`);
    }

    async getState(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/state`);
    }

    async getMobileDevices(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices`);
    }

    async getMobileDevice(home_id, device_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices/${device_id}`);
    }

    async getMobileDeviceSettings(home_id, device_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices/${device_id}/settings`);
    }

    async setGeoTracking(home_id, device_id, geoTrackingEnabled) {
        const settings = await this.getMobileDeviceSettings(home_id, device_id);
        settings['geoTrackingEnabled'] = geoTrackingEnabled;
        return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices/${device_id}/settings`, 'put', settings);
    }

    async getZones(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones`);
    }

    async getZoneState(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/state`);
    }

    async getZoneCapabilities(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/capabilities`);
    }

    async getZoneOverlay(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/overlay`).catch(error => {
            if (error.response.status === 404) {
                return {};
            }

            throw error;
        });
    }

    async getZoneDayReport(home_id, zone_id, reportDate) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/dayReport?date=${reportDate}`);
    }

    async getTimeTables(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/schedule/activeTimetable`);
    }

    async getAwayConfiguration(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/awayConfiguration`);
    }

    async getTimeTable(home_id, zone_id, timetable_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/schedule/timetables/${timetable_id}/blocks`);
    }

    async clearZoneOverlay(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/overlay`, 'delete');
    }

    async setZoneOverlay(home_id, zone_id, power, temperature, termination, fan_speed) {
        const zone_state = await this.getZoneState(home_id, zone_id);

        const config = {
            setting: zone_state.setting,
            termination: {},
        };

        if (power.toLowerCase() == 'on') {
            config.setting.power = 'ON';

            if ((config.setting.type == 'HEATING' || config.setting.type == 'AIR_CONDITIONING') && temperature) {
                config.setting.temperature = { celsius: temperature };
            }
            if (config.setting.type == 'AIR_CONDITIONING' && fan_speed) {
                config.setting.fanSpeed = fan_speed;
            }
        } else {
            config.setting.power = 'OFF';
        }

        if (!isNaN(parseInt(termination))) {
            config.type = 'MANUAL';
            config.termination.typeSkillBasedApp = 'TIMER';
            config.termination.durationInSeconds = termination;
        } else if (termination && termination.toLowerCase() == 'auto') {
            // Not sure how to test this is the web app
            // But seems to by a combo of 'next_time_block' and geo
            config.termination.type = 'TADO_MODE';
        } else if (termination && termination.toLowerCase() == 'next_time_block') {
            config.type = 'MANUAL';
            config.termination.typeSkillBasedApp = 'NEXT_TIME_BLOCK';
        } else {
            config.type = 'MANUAL';
            config.termination.typeSkillBasedApp = 'MANUAL';
        }

        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/overlay`, 'put', config);
    }

    async setDeviceTemperatureOffset(device_id, temperatureOffset) {
        const config = {
            celsius: temperatureOffset,
        }

        return this.apiCall(`/api/v2/devices/${device_id}/temperatureOffset`, 'put', config);
    }

    async identifyDevice(device_id) {
        return this.apiCall(`/api/v2/devices/${device_id}/identify`, 'post');
    }

    async setPresence(home_id, presence) {
        presence = presence.toUpperCase();

        if (!['HOME', 'AWAY', 'AUTO'].includes(presence)) {
            throw new Error(`Invalid presence "${presence}" must be "HOME", "AWAY", or "AUTO"`);
        }

        const method = presence == 'AUTO' ? 'delete' : 'put';
        const config = {
            homePresence: presence
        };

        return this.apiCall(`/api/v2/homes/${home_id}/presenceLock`, method, config);
    }

    async isAnyoneAtHome(home_id) {
        const devices = await this.getMobileDevices(home_id);

        for (const device of devices) {
            if (device.settings.geoTrackingEnabled && device.location && device.location.atHome) {
                return true;
            }
        }

        return false;
    }

    async updatePresence(home_id) {
        const isAnyoneAtHome = await this.isAnyoneAtHome(home_id);
        let isPresenceAtHome = await this.getState(home_id);
        isPresenceAtHome = isPresenceAtHome.presence === 'HOME';

        if (isAnyoneAtHome !== isPresenceAtHome) {
            return this.setPresence(home_id, isAnyoneAtHome ? 'HOME' : 'AWAY');
        }
        else {
            return "already up to date";
        }
    }

    async setWindowDetection(home_id, zone_id, enabled, timeout) {
        const config = {
            'enabled': enabled,
            'timeoutInSeconds': timeout,
        }
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/openWindowDetection`, 'PUT', config);
    }

    async setOpenWindowMode(home_id, zone_id, activate) {
        if (activate) {
            return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/state/openWindow/activate`, 'POST');
        } else {
            return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/state/openWindow`, 'DELETE');
        }
    }

    async getAirComfort(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/airComfort`);
    }

    async getAirComfortDetailed(home_id) {
        const home = await this.getHome(home_id);
        const location = `latitude=${home.geolocation.latitude}&longitude=${home.geolocation.longitude}`;
        const login = `username=${this._username}&password=${this._password}`;
        const resp = await axios(`https://acme.tado.com/v1/homes/${home_id}/airComfort?${location}&${login}`);
        return resp.data;
    }
}

module.exports = Tado;
