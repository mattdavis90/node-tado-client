export type Locale = 'en' | string

export type TimeZone = 'Europe/Paris' | string

export type Platform = 'iOS' | 'Android' | string

export type TemperatureUnit = 'CELSIUS' | string

export type Country = 'FRA' | string

export type Geolocation = { latitude: number; longitude: number }

export type Feature =
    | 'ELIGIBLE_FOR_ENERGY_CONSUMPTION'
    | 'ENERGY_CONSUMPTION'
    | 'HEATING_ROOM_DETAILS_AS_WEBVIEW'
    | 'HOME_SCREEN_AS_WEBVIEW_PROD_ANDROID'

// TODO:
export type HomePartner = any

export type HomeIncidentDetection = { supported: boolean; enabled: boolean }

export type HomeSkill = 'AUTO_ASSIST' | string

export type HomeContactDetail = {
    name: string
    email: string
    phone: string
}

export type HomeAddress = {
    addressLine1: string
    addressLine2: string
    zipCode: string
    city: string
    state: string | null
    country: Country
}

export type Home = {
    id: number
    name: string
    dateTimeZone: TimeZone
    dateCreated: string
    temperatureUnit: TemperatureUnit
    partner: HomePartner
    simpleSmartScheduleEnabled: boolean
    awayRadiusInMeters: number
    installationCompleted: boolean
    incidentDetection: HomeIncidentDetection
    skills: HomeSkill[]
    christmasModeEnabled: boolean
    showAutoAssistReminders: boolean
    contactDetails: HomeContactDetail
    address: HomeAddress
    geolocation: Geolocation
    consentGrantSkippable: boolean
    enabledFeatures: Feature[]
    isAirComfortEligible: boolean
    isBalanceAcEligible: boolean
}

export type MeHome = Pick<Home, 'id' | 'name'>

export type MobileDeviceSettingsPushNotification = {
    lowBatteryReminder: boolean
    awayModeReminder: boolean
    homeModeReminder: boolean
    openWindowReminder: boolean
    energySavingsReportReminder: boolean
    incidentDetection: boolean
}

export type MobileDeviceSettings = {
    geoTrackingEnabled: boolean
    onDemandLogRetrievalEnabled: boolean
    pushNotifications: MobileDeviceSettingsPushNotification
}

export type MobileDeviceLocationBearingFromHome = {
    degrees: number
    radians: number
}

export type MobileDeviceLocation = {
    stale: boolean
    atHome: boolean
    bearingFromHome: MobileDeviceLocationBearingFromHome
    relativeDistanceFromHomeFence: number
}

export type MobileDeviceMetadata = {
    platform: Platform
    osVersion: string
    model: string
    locale: Locale
}

export type MobileDevice = {
    name: string
    id: number
    settings: MobileDeviceSettings
    location: MobileDeviceLocation
    deviceMetadata: MobileDeviceMetadata
}

export type Me = {
    name: string
    email: string
    username: string
    id: string
    homes: MeHome[]
    locale: Locale
    mobileDevices: MobileDevice[]
}

export type WeatherSolarIntensityType = 'PERCENTAGE' | string

export type WeatherSolarIntensity = {
    type: WeatherSolarIntensityType
    percentage: number
    timestamp: string
}

export type WeatherOutsideTemperatureType = 'TEMPERATURE' | string

export type WeatherOutsideTemperaturePrecision = {
    celsius: number
    fahrenheit: number
}

export type WeatherOutsideTemperature = {
    celsius: number
    fahrenheit: number
    timestamp: string
    type: WeatherOutsideTemperatureType
    precision: WeatherOutsideTemperaturePrecision
}

export type WeatherStateType = 'WEATHER_STATE' | string

export type WeatherStateValue = 'CLOUDY' | string

export type WeatherState = {
    type: WeatherStateType
    value: WeatherStateValue
    timestamp: string
}

export type Weather = {
    solarIntensity: WeatherSolarIntensity
    outsideTemperature: WeatherOutsideTemperature
    weatherState: WeatherState
}

export type DeviceType = 'VA02' | string

export type DeviceConnectionState = { value: boolean; timestamp: string }

export type DeviceCharacteristicsCapabilities =
    | 'RADIO_ENCRYPTION_KEY_ACCESS'
    | 'INSIDE_TEMPERATURE_MEASUREMENT'
    | 'IDENTIFY'
    | string

export type DeviceCharacteristics = {
    capabilities: DeviceCharacteristicsCapabilities[]
}

export type DeviceMountingStateValue = 'CALIBRATED' | string

export type DeviceMountingState = {
    value: DeviceMountingStateValue
    timestamp: string
}

export type DeviceBatteryState = 'NORMAL' | string

export type DeviceOrientation = 'HORIZONTAL' | 'VERTICAL'

export type Device = {
    deviceType: DeviceType
    serialNo: string
    shortSerialNo: string
    currentFwVersion: string
    connectionState: DeviceConnectionState
    characteristics: DeviceCharacteristics
    mountingState: DeviceMountingState
    mountingStateWithError: DeviceMountingStateValue
    batteryState: DeviceBatteryState
    orientation: DeviceOrientation
    childLockEnabled: boolean
}

export type DeviceTemperatureOffset = { celsius: number; fahrenheit: number }
