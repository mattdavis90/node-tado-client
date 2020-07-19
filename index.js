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
    constructor() {
        this._accessToken;
    }

    async _refreshToken() {
        // If the start of the window has passed, refresh the token
        const shouldRefresh = this._accessToken.expired(EXPIRATION_WINDOW_IN_SECONDS);

        if (shouldRefresh) {
            try {
                this._accessToken = await this._accessToken.refresh();
                return this._accessToken;
            } catch (error) {
                throw error;
            }
        } else {
            return this._accessToken;
        }
    }

    async login(username, password) {
        const tokenParams = {
            username: username,
            password: password,
            scope: 'home.user',
        };

        try {
            this._accessToken = await client.getToken(tokenParams);
            return this._accessToken;
        } catch(error) {
            throw error;
        };
    }

    apiCall(url, method='get', data={}) {
        return new Promise((resolve, reject) => {
            if (this._accessToken) {
                this._refreshToken().then(() => {
                    axios({
                        url: tado_url + url,
                        method: method,
                        data: data,
                        headers: {
                            Authorization: 'Bearer ' + this._accessToken.token.access_token
                        }
                    }).then(response => {
                        resolve(response.data);
                    }).catch(error => {
                        reject(error);
                    });
                });
            } else {
                reject(new Error('Not yet logged in'));
            }
        });
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

    getDeviceTemperatureOffset(device_id) {
        return this.apiCall(`/api/v2/devices/${device_id}/temperatureOffset`);
    }

    getInstallations(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/installations`);
    }

    getUsers(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/users`);
    }

    getState(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/state`);
    }

    getMobileDevices(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices`);
    }

    getMobileDevice(home_id, device_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices/${device_id}`);
    }

    getMobileDeviceSettings(home_id, device_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices/${device_id}/settings`);
    }

    async setGeoTracking(home_id, device_id, geoTrackingEnabled) {
        var settings = await this.getMobileDeviceSettings(home_id, device_id);
        settings['geoTrackingEnabled'] = geoTrackingEnabled;
        return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices/${device_id}/settings`, 'put', settings);
    }

    getZones(home_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones`);
    }

    getZoneState(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/state`);
    }

    getZoneCapabilities(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/capabilities`);
    }

    getZoneOverlay(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/overlay`);
    }

    getZoneDayReport(home_id, zone_id, reportDate) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/dayReport?date=${reportDate}`);
    }

    getTimeTables(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/schedule/activeTimetable`);
    }

    getAwayConfiguration(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/awayConfiguration`);
    }

    getTimeTable(home_id, zone_id, timetable_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/schedule/timetables/${timetable_id}/blocks`);
    }

    clearZoneOverlay(home_id, zone_id) {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/overlay`, 'delete');
    }

    async setZoneOverlay(home_id, zone_id, power, temperature, termination) {
        var zone_state = await this.getZoneState(home_id, zone_id);

        var config = {
            setting: zone_state.setting,
            termination: {
            }
        }

        if (power.toLowerCase() == 'on') {
            config.setting.power = 'ON';

            if (config.setting.type == 'HEATING' && temperature) {
                config.setting.temperature = {celsius: temperature};
            }
        } else {
            config.setting.power = 'OFF';
        }

        if (!isNaN(parseInt(termination))) {
            config.termination.type = 'TIMER';
            config.termination.durationInSeconds = termination;
        } else if(termination && termination.toLowerCase() == 'auto') {
            config.termination.type = 'TADO_MODE';
        } else if(termination && termination.toLowerCase() == 'next_time_block') {
            config.type = 'MANUAL';
            config.termination.typeSkillBasedApp = 'NEXT_TIME_BLOCK';
        } else {
            config.termination.type = 'MANUAL';
        }

        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/overlay`, 'put', config);
    }

    setDeviceTemperatureOffset(device_id, temperatureOffset) {
        var config = {
            celsius: temperatureOffset,
        }

        return this.apiCall(`/api/v2/devices/${device_id}/temperatureOffset`, 'put', config);
    }

    identifyDevice(device_id) {
        return this.apiCall(`/api/v2/devices/${device_id}/identify`, 'post');
    }

    setPresence(home_id, presence) {
        presence = presence.toUpperCase();

        if(!['HOME', 'AWAY', 'AUTO'].includes(presence)) {
            return Promise.reject(new Error(`Invalid presence "${presence}" must be "HOME", "AWAY", or "AUTO"`));
        }

        var method = presence == 'AUTO' ? 'delete' : 'put';
        var config = {
            homePresence: presence
        }

        return this.apiCall(`/api/v2/homes/${home_id}/presenceLock`, method, config);
    }

    async updatePresence(home_id) {
        const state = await this.getState(home_id);
        const devices = await this.getMobileDevices(home_id);

        const presenceHome = state.presence === 'HOME';
        let anyoneHome = false;

        for(const device of devices) {
            if(device.settings.geoTrackingEnabled && device.location.atHome) {
                anyoneHome = true;
                break;
            }
        }

        if(anyoneHome !== presenceHome) {
            return this.setPresence(home_id, anyoneHome ? 'HOME' : 'AWAY');
        } 
        else {
            return "already up to date";
        }
    }

    setWindowDetection(home_id, zone_id, enabled, timeout) {
        var config = {
            'enabled': enabled,
            'timeoutInSeconds': timeout,
        }
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/openWindowDetection`, 'PUT', config);
    }

    setOpenWindowMode(home_id, zone_id, activate) {
        if (activate) {
            return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/state/openWindow/activate`, 'POST');
        } else {
            return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/state/openWindow`, 'DELETE');
        }
    }
}

module.exports = Tado;
