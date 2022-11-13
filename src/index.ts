import { AccessToken, ResourceOwnerPassword } from 'simple-oauth2'
import axios, { Method } from 'axios'
import { Agent } from 'https'
import {
    Device,
    Temperature,
    Home,
    Me,
    MobileDevice,
    MobileDeviceSettings,
    State,
    User,
    Weather,
    Zone,
    ZoneState,
    ZoneCapabilities,
} from './types'

const EXPIRATION_WINDOW_IN_SECONDS = 300

const tado_auth_url = 'https://auth.tado.com'
const tado_url = 'https://my.tado.com'
const oauth_path = '/oauth/token'
const tado_config = {
    client: {
        id: 'tado-web-app',
        secret: 'wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc',
    },
    auth: {
        tokenHost: tado_auth_url,
    },
}

const client = new ResourceOwnerPassword(tado_config)

export class Tado {
    private _httpsAgent: Agent
    private _accessToken: AccessToken | null
    private _username: string
    private _password: string

    constructor(username: string, password: string) {
        this._username = username
        this._password = password
        this._httpsAgent = new Agent({ keepAlive: true })
    }

    async _login() {
        const tokenParams = {
            username: this._username,
            password: this._password,
            scope: 'home.user',
        }

        try {
            this._accessToken = await client.getToken(tokenParams)
        } catch (error) {
            throw error
        }
    }

    async _refreshToken() {
        if (!this._accessToken) {
            await this._login()
        }

        if (!this._accessToken) {
            throw new Error(`No access token available, even after login in.`)
        }

        // If the start of the window has passed, refresh the token
        const shouldRefresh = this._accessToken.expired(
            EXPIRATION_WINDOW_IN_SECONDS
        )

        if (shouldRefresh) {
            try {
                this._accessToken = await this._accessToken.refresh()
            } catch (error) {
                this._accessToken = null
                await this._login()
            }
        }
    }

    async login(username: string, password: string) {
        this._username = username
        this._password = password
        await this._login()
    }

    async apiCall<R, T = any>(
        url: string,
        method: Method = 'get',
        data?: T
    ): Promise<R> {
        await this._refreshToken()

        let callUrl = tado_url + url
        if (url.includes('https')) {
            callUrl = url
        }
        const request = {
            url: callUrl,
            method: method,
            data: data,
            headers: {
                Authorization:
                    'Bearer ' + this._accessToken?.token.access_token,
            },
            httpsAgent: this._httpsAgent,
        }
        if (method !== 'get' && method !== 'GET') {
            request.data = data
        }
        const response = await axios(request)

        return response.data as R
    }

    getMe(): Promise<Me> {
        return this.apiCall('/api/v2/me')
    }

    getHome(home_id: number): Promise<Home> {
        return this.apiCall(`/api/v2/homes/${home_id}`)
    }

    getWeather(home_id: number): Promise<Weather> {
        return this.apiCall(`/api/v2/homes/${home_id}/weather`)
    }

    getDevices(home_id: number): Promise<Device[]> {
        return this.apiCall(`/api/v2/homes/${home_id}/devices`)
    }

    getDeviceTemperatureOffset(serial_no: string): Promise<Temperature> {
        return this.apiCall(`/api/v2/devices/${serial_no}/temperatureOffset`)
    }

    // TODO: type
    getInstallations(home_id: number) {
        return this.apiCall(`/api/v2/homes/${home_id}/installations`)
    }

    getUsers(home_id: number): Promise<User> {
        return this.apiCall(`/api/v2/homes/${home_id}/users`)
    }

    getState(home_id: number): Promise<State> {
        return this.apiCall(`/api/v2/homes/${home_id}/state`)
    }

    getMobileDevices(home_id: number): Promise<MobileDevice[]> {
        return this.apiCall(`/api/v2/homes/${home_id}/mobileDevices`)
    }

    getMobileDevice(
        home_id: number,
        mobile_device_id: number
    ): Promise<MobileDevice> {
        return this.apiCall(
            `/api/v2/homes/${home_id}/mobileDevices/${mobile_device_id}`
        )
    }

    getMobileDeviceSettings(
        home_id: number,
        mobile_device_id: number
    ): Promise<MobileDeviceSettings> {
        return this.apiCall(
            `/api/v2/homes/${home_id}/mobileDevices/${mobile_device_id}/settings`
        )
    }

    setGeoTracking(
        home_id: number,
        mobile_device_id: number,
        geoTrackingEnabled: boolean
    ): Promise<MobileDeviceSettings> {
        return this.getMobileDeviceSettings(home_id, mobile_device_id).then(
            (settings) =>
                this.apiCall(
                    `/api/v2/homes/${home_id}/mobileDevices/${mobile_device_id}/settings`,
                    'put',
                    {
                        ...settings,
                        geoTrackingEnabled: geoTrackingEnabled,
                    }
                )
        )
    }

    getZones(home_id: number): Promise<Zone> {
        return this.apiCall(`/api/v2/homes/${home_id}/zones`)
    }

    getZoneState(home_id: number, zone_id: number): Promise<ZoneState> {
        return this.apiCall(`/api/v2/homes/${home_id}/zones/${zone_id}/state`)
    }

    getZoneCapabilities(
        home_id: number,
        zone_id: number
    ): Promise<ZoneCapabilities> {
        return this.apiCall(
            `/api/v2/homes/${home_id}/zones/${zone_id}/capabilities`
        )
    }

    // FIXME: type form here
    async getZoneOverlay(home_id: number, zone_id: number) {
        return this.apiCall(
            `/api/v2/homes/${home_id}/zones/${zone_id}/overlay`
        ).catch((error) => {
            if (error.response.status === 404) {
                return {}
            }

            throw error
        })
    }

    /**
     * @param reportDate date with json format (ex: `new Date().toJSON()`)
     */
    async getZoneDayReport(
        home_id: number,
        zone_id: number,
        reportDate: string
    ) {
        return this.apiCall(
            `/api/v2/homes/${home_id}/zones/${zone_id}/dayReport?date=${reportDate}`
        )
    }

    async getTimeTables(home_id: number, zone_id: number) {
        return this.apiCall(
            `/api/v2/homes/${home_id}/zones/${zone_id}/schedule/activeTimetable`
        )
    }

    async getAwayConfiguration(home_id: number, zone_id: number) {
        return this.apiCall(
            `/api/v2/homes/${home_id}/zones/${zone_id}/awayConfiguration`
        )
    }

    async getTimeTable(home_id: number, zone_id: number, timetable_id: string) {
        return this.apiCall(
            `/api/v2/homes/${home_id}/zones/${zone_id}/schedule/timetables/${timetable_id}/blocks`
        )
    }

    async clearZoneOverlay(home_id: number, zone_id: number) {
        console.warn(
            'This method of clearing zone overlays will soon be deprecated, please use clearZoneOverlays'
        )
        return this.apiCall(
            `/api/v2/homes/${home_id}/zones/${zone_id}/overlay`,
            'delete'
        )
    }

    async setZoneOverlay(
        home_id: number,
        zone_id: number,
        power,
        temperature,
        termination,
        fan_speed,
        ac_mode
    ) {
        console.warn(
            'This method of setting zone overlays will soon be deprecated, please use setZoneOverlays'
        )
        const zone_state = await this.getZoneState(home_id, zone_id)

        const config = {
            setting: zone_state.setting,
            termination: {},
        }

        if (power.toLowerCase() == 'on') {
            config.setting.power = 'ON'

            if (config.setting.type == 'HEATING' && temperature) {
                config.setting.temperature = { celsius: temperature }
            }

            if (config.setting.type == 'AIR_CONDITIONING') {
                if (ac_mode) {
                    config.setting.mode = ac_mode.toUpperCase()
                }

                if (
                    config.setting.mode.toLowerCase() == 'heat' ||
                    config.setting.mode.toLowerCase() == 'cool'
                ) {
                    if (temperature) {
                        config.setting.temperature = { celsius: temperature }
                    }

                    if (fan_speed) {
                        config.setting.fanLevel = fan_speed.toUpperCase()
                    }
                }
            }
        } else {
            config.setting.power = 'OFF'
        }

        if (!isNaN(parseInt(termination))) {
            config.type = 'MANUAL'
            config.termination.typeSkillBasedApp = 'TIMER'
            config.termination.durationInSeconds = termination
        } else if (termination && termination.toLowerCase() == 'auto') {
            // Not sure how to test this is the web app
            // But seems to by a combo of 'next_time_block' and geo
            config.termination.type = 'TADO_MODE'
        } else if (
            termination &&
            termination.toLowerCase() == 'next_time_block'
        ) {
            config.type = 'MANUAL'
            config.termination.typeSkillBasedApp = 'NEXT_TIME_BLOCK'
        } else {
            config.type = 'MANUAL'
            config.termination.typeSkillBasedApp = 'MANUAL'
        }

        return this.apiCall(
            `/api/v2/homes/${home_id}/zones/${zone_id}/overlay`,
            'put',
            config
        )
    }

    async clearZoneOverlays(home_id: number, zone_ids) {
        const rooms = zone_ids.join(',')
        return this.apiCall(
            `/api/v2/homes/${home_id}/overlay?rooms=${rooms}`,
            'delete'
        )
    }

    async setZoneOverlays(home_id: number, overlays, termination) {
        let termination_config = {}

        if (!isNaN(parseInt(termination))) {
            termination_config.typeSkillBasedApp = 'TIMER'
            termination_config.durationInSeconds = termination
        } else if (termination && termination.toLowerCase() == 'auto') {
            termination_config.typeSkillBasedApp = 'TADO_MODE'
        } else if (
            termination &&
            termination.toLowerCase() == 'next_time_block'
        ) {
            termination_config.typeSkillBasedApp = 'NEXT_TIME_BLOCK'
        } else {
            termination_config.typeSkillBasedApp = 'MANUAL'
        }

        let config = {
            overlays: [],
        }

        for (let overlay of overlays) {
            const zone_state = await this.getZoneState(home_id, overlay.zone_id)

            const overlay_config = {
                overlay: {
                    setting: zone_state.setting,
                    termination: termination_config,
                },
                room: overlay.zone_id,
            }

            ;[
                'power',
                'mode',
                'temperature',
                'fanLevel',
                'verticalSwing',
                'horizontalSwing',
                'light',
            ].forEach((prop) => {
                if (overlay.hasOwnProperty(prop)) {
                    if (
                        typeof overlay[prop] === 'string' ||
                        overlay[prop] instanceof String
                    ) {
                        overlay_config.overlay.setting[prop] =
                            overlay[prop].toUpperCase()
                    } else {
                        overlay_config.overlay.setting[prop] = overlay[prop]
                    }
                }
            })

            config.overlays.push(overlay_config)
        }

        return this.apiCall(`/api/v2/homes/${home_id}/overlay`, 'post', config)
    }

    async setDeviceTemperatureOffset(device_id: number, temperatureOffset) {
        const config = {
            celsius: temperatureOffset,
        }

        return this.apiCall(
            `/api/v2/devices/${device_id}/temperatureOffset`,
            'put',
            config
        )
    }

    async identifyDevice(device_id: number) {
        return this.apiCall(`/api/v2/devices/${device_id}/identify`, 'post')
    }

    async setPresence(home_id: number, presence) {
        presence = presence.toUpperCase()

        if (!['HOME', 'AWAY', 'AUTO'].includes(presence)) {
            throw new Error(
                `Invalid presence "${presence}" must be "HOME", "AWAY", or "AUTO"`
            )
        }

        const method = presence == 'AUTO' ? 'delete' : 'put'
        const config = {
            homePresence: presence,
        }

        return this.apiCall(
            `/api/v2/homes/${home_id}/presenceLock`,
            method,
            config
        )
    }

    async isAnyoneAtHome(home_id: number) {
        const devices = await this.getMobileDevices(home_id)

        for (const device of devices) {
            if (
                device.settings.geoTrackingEnabled &&
                device.location &&
                device.location.atHome
            ) {
                return true
            }
        }

        return false
    }

    async updatePresence(home_id: number) {
        const isAnyoneAtHome = await this.isAnyoneAtHome(home_id)
        let isPresenceAtHome = await this.getState(home_id)
        isPresenceAtHome = isPresenceAtHome.presence === 'HOME'

        if (isAnyoneAtHome !== isPresenceAtHome) {
            return this.setPresence(home_id, isAnyoneAtHome ? 'HOME' : 'AWAY')
        } else {
            return 'already up to date'
        }
    }

    async setWindowDetection(home_id: number, zone_id, enabled, timeout) {
        const config = {
            enabled: enabled,
            timeoutInSeconds: timeout,
        }
        return this.apiCall(
            `/api/v2/homes/${home_id}/zones/${zone_id}/openWindowDetection`,
            'PUT',
            config
        )
    }

    async setOpenWindowMode(home_id: number, zone_id, activate) {
        if (activate) {
            return this.apiCall(
                `/api/v2/homes/${home_id}/zones/${zone_id}/state/openWindow/activate`,
                'POST'
            )
        } else {
            return this.apiCall(
                `/api/v2/homes/${home_id}/zones/${zone_id}/state/openWindow`,
                'DELETE'
            )
        }
    }

    async getAirComfort(home_id: number) {
        return this.apiCall(`/api/v2/homes/${home_id}/airComfort`)
    }

    async getAirComfortDetailed(home_id: number) {
        const home = await this.getHome(home_id)
        const location = `latitude=${home.geolocation.latitude}&longitude=${home.geolocation.longitude}`
        const login = `username=${this._username}&password=${this._password}`
        const resp = await axios(
            `https://acme.tado.com/v1/homes/${home_id}/airComfort?${location}&${login}`
        )
        return resp.data
    }

    async getEnergyIQ(home_id: number) {
        return this.apiCall(
            `https://energy-insights.tado.com/api/homes/${home_id}/consumption`
        )
    }
    async getEnergyIQTariff(home_id: number) {
        return this.apiCall(
            `https://energy-insights.tado.com/api/homes/${home_id}/tariff`
        )
    }

    async updateEnergyIQTariff(home_id: number, unit, tariffInCents) {
        if (!['m3', 'kWh'].includes(unit)) {
            throw new Error(`Invalid unit "${unit}" must be "m3", or "kWh"`)
        }
        return this.apiCall(
            `https://energy-insights.tado.com/api/homes/${home_id}/tariff`,
            'put',
            { unit: unit, tariffInCents: tariffInCents }
        )
    }

    async getEnergyIQMeterReadings(home_id: number) {
        return this.apiCall(
            `https://energy-insights.tado.com/api/homes/${home_id}/meterReadings`
        )
    }

    async addEnergyIQMeterReading(home_id: number, date, reading) {
        return this.apiCall(
            `https://energy-insights.tado.com/api/homes/${home_id}/meterReadings`,
            'post',
            { date: date, reading: reading }
        )
    }

    async deleteEnergyIQMeterReading(home_id: number, reading_id) {
        return this.apiCall(
            `https://energy-insights.tado.com/api/homes/${home_id}/meterReadings/${reading_id}`,
            'delete',
            {}
        )
    }

    // const home = await this.getHome(home_id);
    // const country = home.address.country;

    async getEnergySavingsReport(home_id: number, year, month, countryCode) {
        return this.apiCall(
            `https://energy-bob.tado.com/${home_id}/${year}-${month}?country=${countryCode}`
        )
    }
}
