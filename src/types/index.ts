export * from './enums'
import {
    AirComfortFreshnessValue,
    AwayConfigurationPreheatingLevel,
    DataPointType,
    DeviceBatteryState,
    DeviceCharacteristicsCapabilities,
    DeviceOrientation,
    DeviceType,
    EnergyIQConsumptionInputState,
    EnergySavingReportUnit,
    FanLevel,
    FanSpeed,
    Feature,
    HumidityLevel,
    IQUnit,
    OutdoorPollensTypeValue,
    OutdoorQualityLevel,
    Platform,
    StatePresence,
    StripeTypeValue,
    TemperatureLevel,
    TemperatureUnit,
    TimeTableDayType,
    WeatherStateValue,
    ZoneDeviceDuty,
    ZoneType,
} from './enums'

// utils
export type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>
      }
    : T

// tado
/** Example: `'en'`  */
export type Locale = string

/** Example: `'Europe/Paris'` */
export type TimeZone = string

/** Example: `'FRA'` */
export type Country = string

/** Example: `'EUR'` */
export type Currency = string

/** Example: `'€'` */
export type CurrencySign = string

export type Geolocation = {
    latitude: number
    longitude: number
}

export type Interval = {
    /** JSON formated date */
    start: string
    /** JSON formated date */
    end: string
}

export type HomeIncidentDetection = { supported: boolean; enabled: boolean }

export type HomeSkill = 'AUTO_ASSIST'

export type HomeContactDetail = {
    name: string
    email: string
    phone: string
}

export type HomeAddress = {
    addressLine1: string
    addressLine2: string | null
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
    /** Partner organisation where Tado was purchased */
    partner: string
    simpleSmartScheduleEnabled: boolean
    awayRadiusInMeters: number
    installationCompleted: boolean
    incidentDetection: HomeIncidentDetection
    zonesCount: number
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
    isBalanceHpEligible: boolean
    isEnergyIqEligible: boolean
    isHeatSourceInstalled: boolean
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

export type WeatherSolarIntensity = {
    type: 'PERCENTAGE'
    percentage: number
    timestamp: string
}

export type Temperature = {
    celsius: number
    fahrenheit: number
}

export type WeatherOutsideTemperature = {
    type: 'TEMPERATURE'
    celsius: number
    fahrenheit: number
    timestamp: string
    precision: Temperature
}

export type WeatherState = {
    type: 'WEATHER_STATE'
    value: WeatherStateValue
    timestamp: string
}

export type Weather = {
    solarIntensity: WeatherSolarIntensity
    outsideTemperature: WeatherOutsideTemperature
    weatherState: WeatherState
}

export type DeviceConnectionState = { value: boolean; timestamp: string }

export type DeviceCharacteristics = {
    capabilities: DeviceCharacteristicsCapabilities[]
}

export type DeviceMountingStateValue = 'CALIBRATED'

export type DeviceMountingState = {
    value: DeviceMountingStateValue
    timestamp: string
}

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

export type UserHome = Pick<Home, 'id' | 'name'>

export type User = {
    name: string
    email: string
    username: string
    id: string
    homes: UserHome[]
    locale: Locale
    mobileDevices: MobileDevice[]
}

export type State = { presence: StatePresence; presenceLocked: boolean }

export type ZoneDazzleMode = { supported: boolean; enabled: boolean }

export type ZoneOpenWindowDetection = {
    supported: boolean
    enabled: boolean
    timeoutInSeconds: number
}

export type ZoneDevice = Zone & {
    duties: ZoneDeviceDuty[]
}

export type ZoneOverlayTerminationNextTimeBlock = {
    type: 'TIMER'
    typeSkillBasedApp: 'NEXT_TIME_BLOCK'
    durationInSeconds: number
    /** `YYYY-MM-DDTHH:mm:ss` format datetime */
    expiry: string
    remainingTimeInSeconds: number
    /** `YYYY-MM-DDTHH:mm:ss` format datetime */
    projectedExpiry: string
}

export type ZoneOverlayTerminationTimer = Omit<
    ZoneOverlayTerminationNextTimeBlock,
    'type' | 'typeSkillBasedApp'
> & {
    type: 'TIMER'
    typeSkillBasedApp: 'TIMER'
}

export type ZoneOverlayTerminationManual = {
    type: 'MANUAL'
    typeSkillBasedApp: 'MANUAL'
}

export type ZoneOverlayTermination =
    | ZoneOverlayTerminationManual
    | ZoneOverlayTerminationTimer
    | ZoneOverlayTerminationNextTimeBlock

export type ZoneOverlay = {
    type: 'MANUAL'
    setting: TimeTableSettings
    termination: ZoneOverlayTermination
}

export type ZoneOpenWindow = {
    /** `RFC3339 formatted datetime */
    detectedTime: string
    durationInSeconds: number
    /** `RFC3339 formatted datetime */
    expiry: string
    remainingTimeInSeconds: number
}

export type Zone = {
    id: number
    name: string
    type: ZoneType
    dateCreated: string
    deviceTypes: DeviceType[]
    devices: ZoneDevice[]
    reportAvailable: boolean
    showScheduleSetup: boolean
    supportsDazzle: boolean
    dazzleEnabled: boolean
    dazzleMode: ZoneDazzleMode
    openWindowDetection: ZoneOpenWindowDetection
}

export type TadoMode = 'HOME'

export type Power = 'ON' | 'OFF'

export type TimeTableSettings = {
    type: ZoneType
    power: Power
    temperature: Temperature | null
    fanSpeed?: FanSpeed
    fanLevel?: FanLevel
    verticalSwing?: any
    horizontalSwing?: any
    light?: any
}

export type ZoneStateNextScheduleChange = {
    start: string
    setting: TimeTableSettings
}

export type ZoneNextTimeBlock = { start: string }

export type ZoneLinkState = 'ONLINE'

export type ZoneLink = { state: ZoneLinkState }

export type DataPointPercentage = {
    type: DataPointType.PERCENTAGE
    timestamp: string
    percentage: number
}

export type DataPointTemperature = Temperature & {
    type: DataPointType.TEMPERATURE
    timestamp: string
    precision: Temperature
}

export type DataPoint = DataPointPercentage | DataPointTemperature

export type ZoneActivityDataPoints = {
    heatingPower: DataPoint
}

export type ZoneStateSensorDataPoints = {
    insideTemperature: DataPointTemperature
    humidity: DataPointPercentage
}

export type ZoneState = {
    tadoMode: TadoMode
    geolocationOverride: boolean | null
    geolocationOverrideDisableTime: boolean | null
    preparation: any // TODO:
    setting: TimeTableSettings
    overlayType: 'MANUAL'
    overlay: ZoneOverlay
    openWindow: ZoneOpenWindow
    nextScheduleChange: ZoneStateNextScheduleChange
    nextTimeBlock: ZoneNextTimeBlock
    link: ZoneLink
    activityDataPoints: ZoneActivityDataPoints
    sensorDataPoints: ZoneStateSensorDataPoints
}

export type ZoneControl = {
    type: ZoneType
    heatingCircuit?: number
    earlyStartEnabled: boolean
    duties: {
        type: ZoneType
        leader: Device
        drivers: Device[]
        uis: Device[]
    }
}

export type ZoneStates = {
    zoneStates: ZoneState[]
}

export type HeatingCircuit = {
    number: number
    driverSerialNo: string
    driverShortSerialNo: string
}

export type RunningTimeZone = {
    id: number
    runningTimeInSeconds: number
}

export type RunningTime = {
    /** `YYYY-MM-DDTHH:mm:ss` format datetime */
    startTime: string
    /** `YYYY-MM-DDTHH:mm:ss` format datetime */
    endTime: string
    runningTimeInSeconds: number
    zones: RunningTimeZone[]
}

export type RunningTimeSummary = {
    /** `YYYY-MM-DDTHH:mm:ss` format datetime */
    start: string
    /** `YYYY-MM-DDTHH:mm:ss` format datetime */
    end: string
    meanInSecondsPerDay: number
    totalRunningTimeInSeconds: number
}

export type RunningTimes = {
    /** `YYYY-MM-DDTHH:mm:ss` format datetime */
    lastUpdated: string
    runningTimes: RunningTime[]
    summary: RunningTimeSummary
}

export type RunningTimesSummaryOnly = {
    summary: RunningTimeSummary
}

export type StepTemperature = {
    min: number
    max: number
    step: number
}

export type ZoneCapabilitiesTemperatures = {
    celsius: StepTemperature
    fahrenheit: StepTemperature
}

export type ZoneCapabilities = {
    type: ZoneType
    temperatures: ZoneCapabilitiesTemperatures
}

export type AwayConfiguration = {
    type: ZoneType
    preheatingLevel: AwayConfigurationPreheatingLevel
    minimumAwayTemperature: Temperature
}

export type TimeTableBlock = {
    dayType: TimeTableDayType
    /** HH:mm */
    start: string
    /** HH:mm */
    end: string
    geolocationOverride: boolean
    setting: TimeTableSettings
}

export type TimeTable = TimeTableBlock[]

export type TimeTables =
    | { id: 0; type: 'ONE_DAY' }
    | { id: 1; type: 'THREE_DAY' }
    | { id: 2; type: 'SEVEN_DAY' }

export type AirComfortFreshness = {
    value: AirComfortFreshnessValue
    /** `YYYY-MM-DDTHH:mm:ss` format datetime */
    lastOpenWindow: string
}

export type AirComfortCoordinate = { radial: number; angular: number }

export type AirComfortRoom = {
    roomId: number
    temperatureLevel: TemperatureLevel
    humidityLevel: HumidityLevel
    coordinate: AirComfortCoordinate
}

export type AirComfort = {
    freshness: AirComfortFreshness
    comfort: AirComfortRoom[]
}

export type EnergyIQTariffInfo = {
    currencySign: CurrencySign
    consumptionUnit: IQUnit
    tariffInCents: number
    customTariff: boolean
}

// FIXME: Need to find a type for this
export type EnergyIQTariff = unknown

export type EnergyIQDetailPerDay = {
    /** `YYYY-MM-DD` format date */
    date: string
    consumption: number
    costInCents: number
}

export type EnergyIQDetail = {
    totalConsumption: 24.57
    totalCostInCents: 2685.45
    perDay: EnergyIQDetailPerDay[]
}

export type EnergyIQ = {
    currency: Currency
    /** Example: `'0.104 €/kWh'` */
    tariff: string
    tariffInfo: EnergyIQTariffInfo
    customTariff: boolean
    consumptionInputState: EnergyIQConsumptionInputState
    unit: IQUnit
    details: EnergyIQDetail
}

export type EnergyIQMeterReading = {
    id: string
    homeId: number
    reading: number
    /** `YYYY-MM-DD` format date */
    date: string
}

export type EnergyIQMeterReadings = {
    readings: EnergyIQMeterReading[]
}

export type EnergySavingDuration = {
    value: number
    unit: EnergySavingReportUnit
}

export type EnergySavingReport = {
    coveredInterval: Interval
    totalSavingsAvailable: boolean
    withAutoAssist: {
        detectedAwayDuration: EnergySavingDuration
        openWindowDetectionTimes: number
    }
    totalSavingsInThermostaticMode: EnergySavingDuration
    manualControlSaving: EnergySavingDuration
    totalSavings: EnergySavingDuration
    hideSunshineDuration: boolean
    awayDuration: EnergySavingDuration
    showSavingsInThermostaticMode: boolean
    communityNews: {
        type: 'TURN_ON_HEATING_DATE'
        /** `YYYY-MM-DD` format date */
        turnOnDateForMajorityOfTadoUsers: string
        /** `YYYY-MM-DD` format date */
        turnOnDateForMajorityOfUsersInLocalRegion: string
    }
    sunshineDuration: EnergySavingDuration
    hasAutoAssist: boolean
    openWindowDetectionTimes: number
    setbackScheduleDurationPerDay: EnergySavingDuration
    totalSavingsInThermostaticModeAvailable: boolean
    /** `YYYY-MM` */
    yearMonth: string
    hideOpenWindowDetection: boolean
    home: number
    hideCommunityNews: boolean
}

export type AirComfortDetailedRoomMessage = {
    roomId: number
    message: string
    visual: null
    link: { text: string; type: 'internal'; url: string }
}

export type OutdoorQualityPollutant = {
    localizedName: string
    scientificName: string
    level: OutdoorQualityLevel
    concentration: [Object]
}

export type OutdoorPollensTypeForcast = {
    localizedDay: string
    /** `YYYY-MM-DD` format date */
    date: string
    level: OutdoorQualityLevel
}

export type OutdoorPollensType = {
    localizedName: string
    type: OutdoorPollensTypeValue
    localizedDescription: string
    forecast: OutdoorPollensTypeForcast[]
}

export type AirComfortDetailed = {
    roomMessages: AirComfortDetailedRoomMessage[]
    outdoorQuality: {
        aqi: { value: number; level: OutdoorQualityLevel }
        pollens: {
            dominant: { level: string }
            types: OutdoorPollensType[]
        }
        pollutants: OutdoorQualityPollutant[]
    }
}

export type AddEnergiIQMeterReadingResponse = {
    id: string
    homeId: number
    /** `YYYY-MM-DD` format date */
    date: string
    reading: number
}

export type MeasureDataInterval<T> = {
    /** JSON formated date */
    from: string
    /** JSON formated date */
    to: string
    value: T
}

export type MeasureDataPoint<T> = {
    /** JSON formated date */
    timestamp: string
    value: T
}

export type MeasureBoolean = {
    timeSeriesType: 'dataIntervals'
    valueType: 'boolean'
    dataIntervals: MeasureDataInterval<boolean>[]
}

export type MeasureTemperature = {
    timeSeriesType: 'dataPoints'
    valueType: 'temperature'
    min: Temperature
    max: Temperature
    dataPoints: MeasureDataPoint<Temperature>[]
}

export type MeasurePercentage = {
    timeSeriesType: 'dataPoints'
    valueType: 'percentage'
    percentageUnit: 'UNIT_INTERVAL'
    min: number
    max: number
    dataPoints: MeasureDataPoint<number>[]
}

export type MeasureStripeData =
    | {
          stripeType: StripeTypeValue
          setting: {
              type: 'HEATING'
              power: Power
              temperature: Temperature | null
          }
      }
    | {
          stripeType: 'AWAY'
      }

export type MeasureStripe = {
    timeSeriesType: 'dataIntervals'
    valueType: 'stripes'
    dataIntervals: MeasureDataInterval<MeasureStripeData>[]
}

export type MeasureSettings = {
    timeSeriesType: 'dataIntervals'
    valueType: 'heatingSetting'
    dataIntervals: MeasureDataInterval<MeasureStripeData>[]
}

export type MeasureCallForHeat = {
    timeSeriesType: 'dataIntervals'
    valueType: 'callForHeat'
    dataIntervals: MeasureDataInterval<'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'>[]
}

export type MeasureWeatherConditionData = {
    state: WeatherStateValue
    temperature: Temperature
}

export type MeasureWeatherCondition = {
    timeSeriesType: 'dataIntervals'
    valueType: 'weatherCondition'
    dataIntervals: MeasureDataInterval<MeasureWeatherConditionData>[]
}

export type MeasureWeatherSunny = {
    timeSeriesType: 'dataIntervals'
    valueType: 'boolean'
    dataIntervals: MeasureDataInterval<boolean>[]
}

export type MeasureWeatherSlotData = {
    state: WeatherStateValue
    temperature: Temperature
}

export type MeasureWeatherSlot = {
    timeSeriesType: 'slots'
    valueType: 'weatherCondition'
    slots: {
        '04:00': MeasureWeatherSlotData | null
        '08:00': MeasureWeatherSlotData | null
        '12:00': MeasureWeatherSlotData | null
        '16:00': MeasureWeatherSlotData | null
        '20:00': MeasureWeatherSlotData | null
    }
}

export type ZoneDayReport = {
    zoneType: ZoneType
    interval: Interval
    hoursInDay: number
    measuredData: {
        measuringDeviceConnected: MeasureBoolean
        insideTemperature: MeasureTemperature
        humidity: MeasurePercentage
    }
    stripes: MeasureStripe
    settings: MeasureSettings
    callForHeat: MeasureCallForHeat
    weather: {
        condition: MeasureWeatherCondition
        sunny: MeasureWeatherSunny
        slots: MeasureWeatherSlot
    }
}
