export * from './enums';
import { Feature, AirComfortFreshnessValue, AwayConfigurationPreheatingLevel, DataPointType, DeviceBatteryState, DeviceCharacteristicsCapabilities, DeviceOrientation, DeviceType, EnergyIQConsumptionInputState, EnergySavingReportUnit, HumidityLevel, IQUnit, OutdoorPollensTypeValue, OutdoorQualityLevel, StatePresence, StripeTypeValue, TemperatureLevel, TimeTableDayType, WeatherStateValue, ZoneDeviceDuty, ZoneType, Platform, TemperatureUnit } from './enums';
export declare type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;
/** Example: `'en'`  */
export declare type Locale = string;
/** Example: `'Europe/Paris'` */
export declare type TimeZone = string;
/** Example: `'FRA'` */
export declare type Country = string;
/** Example: `'EUR'` */
export declare type Currency = string;
/** Example: `'€'` */
export declare type CurrencySign = string;
export declare type Geolocation = {
    latitude: number;
    longitude: number;
};
export declare type Interval = {
    /** JSON formated date */
    start: string;
    /** JSON formated date */
    end: string;
};
export declare type HomePartner = any;
export declare type HomeIncidentDetection = {
    supported: boolean;
    enabled: boolean;
};
export declare type HomeSkill = 'AUTO_ASSIST';
export declare type HomeContactDetail = {
    name: string;
    email: string;
    phone: string;
};
export declare type HomeAddress = {
    addressLine1: string;
    addressLine2: string;
    zipCode: string;
    city: string;
    state: string | null;
    country: Country;
};
export declare type Home = {
    id: number;
    name: string;
    dateTimeZone: TimeZone;
    dateCreated: string;
    temperatureUnit: TemperatureUnit;
    partner: HomePartner;
    simpleSmartScheduleEnabled: boolean;
    awayRadiusInMeters: number;
    installationCompleted: boolean;
    incidentDetection: HomeIncidentDetection;
    skills: HomeSkill[];
    christmasModeEnabled: boolean;
    showAutoAssistReminders: boolean;
    contactDetails: HomeContactDetail;
    address: HomeAddress;
    geolocation: Geolocation;
    consentGrantSkippable: boolean;
    enabledFeatures: Feature[];
    isAirComfortEligible: boolean;
    isBalanceAcEligible: boolean;
};
export declare type MeHome = Pick<Home, 'id' | 'name'>;
export declare type MobileDeviceSettingsPushNotification = {
    lowBatteryReminder: boolean;
    awayModeReminder: boolean;
    homeModeReminder: boolean;
    openWindowReminder: boolean;
    energySavingsReportReminder: boolean;
    incidentDetection: boolean;
};
export declare type MobileDeviceSettings = {
    geoTrackingEnabled: boolean;
    onDemandLogRetrievalEnabled: boolean;
    pushNotifications: MobileDeviceSettingsPushNotification;
};
export declare type MobileDeviceLocationBearingFromHome = {
    degrees: number;
    radians: number;
};
export declare type MobileDeviceLocation = {
    stale: boolean;
    atHome: boolean;
    bearingFromHome: MobileDeviceLocationBearingFromHome;
    relativeDistanceFromHomeFence: number;
};
export declare type MobileDeviceMetadata = {
    platform: Platform;
    osVersion: string;
    model: string;
    locale: Locale;
};
export declare type MobileDevice = {
    name: string;
    id: number;
    settings: MobileDeviceSettings;
    location: MobileDeviceLocation;
    deviceMetadata: MobileDeviceMetadata;
};
export declare type Me = {
    name: string;
    email: string;
    username: string;
    id: string;
    homes: MeHome[];
    locale: Locale;
    mobileDevices: MobileDevice[];
};
export declare type WeatherSolarIntensity = {
    type: 'PERCENTAGE';
    percentage: number;
    timestamp: string;
};
export declare type Temperature = {
    celsius: number;
    fahrenheit: number;
};
export declare type WeatherOutsideTemperature = {
    type: 'TEMPERATURE';
    celsius: number;
    fahrenheit: number;
    timestamp: string;
    precision: Temperature;
};
export declare type WeatherState = {
    type: 'WEATHER_STATE';
    value: WeatherStateValue;
    timestamp: string;
};
export declare type Weather = {
    solarIntensity: WeatherSolarIntensity;
    outsideTemperature: WeatherOutsideTemperature;
    weatherState: WeatherState;
};
export declare type DeviceConnectionState = {
    value: boolean;
    timestamp: string;
};
export declare type DeviceCharacteristics = {
    capabilities: DeviceCharacteristicsCapabilities[];
};
export declare type DeviceMountingStateValue = 'CALIBRATED';
export declare type DeviceMountingState = {
    value: DeviceMountingStateValue;
    timestamp: string;
};
export declare type Device = {
    deviceType: DeviceType;
    serialNo: string;
    shortSerialNo: string;
    currentFwVersion: string;
    connectionState: DeviceConnectionState;
    characteristics: DeviceCharacteristics;
    mountingState: DeviceMountingState;
    mountingStateWithError: DeviceMountingStateValue;
    batteryState: DeviceBatteryState;
    orientation: DeviceOrientation;
    childLockEnabled: boolean;
};
export declare type UserHome = Pick<Home, 'id' | 'name'>;
export declare type User = {
    name: string;
    email: string;
    username: string;
    id: string;
    homes: UserHome[];
    locale: Locale;
    mobileDevices: MobileDevice[];
};
export declare type State = {
    presence: StatePresence;
    presenceLocked: boolean;
};
export declare type ZoneDazzleMode = {
    supported: boolean;
    enabled: boolean;
};
export declare type ZoneOpenWindowDetection = {
    supported: boolean;
    enabled: boolean;
    timeoutInSeconds: number;
};
export declare type ZoneDevice = Zone & {
    duties: ZoneDeviceDuty[];
};
export declare type ZoneOverlayTerminationNextTimeBlock = {
    type: 'TIMER';
    typeSkillBasedApp: 'NEXT_TIME_BLOCK';
    durationInSeconds: number;
    /** `YYYY-MM-DDTHH:mm:ss` format datetime */
    expiry: string;
    remainingTimeInSeconds: number;
    /** `YYYY-MM-DDTHH:mm:ss` format datetime */
    projectedExpiry: string;
};
export declare type ZoneOverlayTerminationTimer = Omit<ZoneOverlayTerminationNextTimeBlock, 'type' | 'typeSkillBasedApp'> & {
    type: 'TIMER';
    typeSkillBasedApp: 'TIMER';
};
export declare type ZoneOverlayTerminationManual = {
    type: 'MANUAL';
    typeSkillBasedApp: 'MANUAL';
};
export declare type ZoneOverlayTermination = ZoneOverlayTerminationManual | ZoneOverlayTerminationTimer | ZoneOverlayTerminationNextTimeBlock;
export declare type ZoneOverlay = {
    type: 'MANUAL';
    setting: TimeTableSettings;
    termination: ZoneOverlayTermination;
};
export declare type Zone = {
    id: number;
    name: string;
    type: ZoneType;
    dateCreated: string;
    deviceTypes: DeviceType[];
    devices: ZoneDevice[];
    reportAvailable: boolean;
    showScheduleSetup: boolean;
    supportsDazzle: boolean;
    dazzleEnabled: boolean;
    dazzleMode: ZoneDazzleMode;
    openWindowDetection: ZoneOpenWindowDetection;
};
export declare type TadoMode = 'HOME';
export declare type Power = 'ON' | 'OFF';
export declare type TimeTableSettings = {
    type: ZoneType;
    power: Power;
    temperature: Temperature | null;
};
export declare type ZoneStateNextScheduleChange = {
    start: string;
    setting: TimeTableSettings;
};
export declare type ZoneNextTimeBlock = {
    start: string;
};
export declare type ZoneLinkState = 'ONLINE';
export declare type ZoneLink = {
    state: ZoneLinkState;
};
export declare type DataPointPercentage = {
    type: DataPointType.PERCENTAGE;
    timestamp: string;
    percentage: number;
};
export declare type DataPointTemperature = Temperature & {
    type: DataPointType.TEMPERATURE;
    timestamp: string;
    precision: Temperature;
};
export declare type DataPoint = DataPointPercentage | DataPointTemperature;
export declare type ZoneActivityDataPoints = {
    heatingPower: DataPoint;
};
export declare type ZoneStateSensorDataPoints = {
    insideTemperature: DataPointTemperature;
    humidity: DataPointPercentage;
};
export declare type ZoneState = {
    tadoMode: TadoMode;
    geolocationOverride: boolean | null;
    geolocationOverrideDisableTime: boolean | null;
    preparation: any;
    setting: TimeTableSettings;
    overlayType: any;
    overlay: any;
    openWindow: any;
    nextScheduleChange: ZoneStateNextScheduleChange;
    nextTimeBlock: ZoneNextTimeBlock;
    link: ZoneLink;
    activityDataPoints: ZoneActivityDataPoints;
    sensorDataPoints: ZoneStateSensorDataPoints;
};
export declare type StepTemperature = {
    min: number;
    max: number;
    step: number;
};
export declare type ZoneCapabilitiesTemperatures = {
    celsius: StepTemperature;
    fahrenheit: StepTemperature;
};
export declare type ZoneCapabilities = {
    type: ZoneType;
    temperatures: ZoneCapabilitiesTemperatures;
};
export declare type AwayConfiguration = {
    type: ZoneType;
    preheatingLevel: AwayConfigurationPreheatingLevel;
    minimumAwayTemperature: Temperature;
};
export declare type TimeTable = {
    dayType: TimeTableDayType;
    /** HH:mm */
    start: string;
    /** HH:mm */
    end: string;
    geolocationOverride: boolean;
    setting: TimeTableSettings;
};
export declare type TimeTables = {
    id: 0;
    type: 'ONE_DAY';
} | {
    id: 1;
    type: 'THREE_DAY';
} | {
    id: 2;
    type: 'SEVEN_DAY';
};
export declare type AirComfortFreshness = {
    value: AirComfortFreshnessValue;
    /** `YYYY-MM-DDTHH:mm:ss` format datetime */
    lastOpenWindow: string;
};
export declare type AirComfortCoordinate = {
    radial: number;
    angular: number;
};
export declare type AirComfortRoom = {
    roomId: number;
    temperatureLevel: TemperatureLevel;
    humidityLevel: HumidityLevel;
    coordinate: AirComfortCoordinate;
};
export declare type AirComfort = {
    freshness: AirComfortFreshness;
    comfort: AirComfortRoom[];
};
export declare type EnergyIQTariffInfo = {
    currencySign: CurrencySign;
    consumptionUnit: IQUnit;
    tariffInCents: number;
    customTariff: boolean;
};
export declare type EnergyIQDetailPerDay = {
    /** `YYYY-MM-DD` format date */
    date: string;
    consumption: number;
    costInCents: number;
};
export declare type EnergyIQDetail = {
    totalConsumption: 24.57;
    totalCostInCents: 2685.45;
    perDay: EnergyIQDetailPerDay[];
};
export declare type EnergyIQ = {
    currency: Currency;
    /** Example: `'0.104 €/kWh'` */
    tariff: string;
    tariffInfo: EnergyIQTariffInfo;
    customTariff: boolean;
    consumptionInputState: EnergyIQConsumptionInputState;
    unit: IQUnit;
    details: EnergyIQDetail;
};
export declare type EnergyIQMeterReading = {
    id: string;
    homeId: number;
    reading: number;
    /** `YYYY-MM-DD` format date */
    date: string;
};
export declare type EnergyIQMeterReadings = {
    readings: EnergyIQMeterReading[];
};
export declare type EnergySavingDuration = {
    value: number;
    unit: EnergySavingReportUnit;
};
export declare type EnergySavingReport = {
    coveredInterval: Interval;
    totalSavingsAvailable: boolean;
    withAutoAssist: {
        detectedAwayDuration: EnergySavingDuration;
        openWindowDetectionTimes: number;
    };
    totalSavingsInThermostaticMode: EnergySavingDuration;
    manualControlSaving: EnergySavingDuration;
    totalSavings: EnergySavingDuration;
    hideSunshineDuration: boolean;
    awayDuration: EnergySavingDuration;
    showSavingsInThermostaticMode: boolean;
    communityNews: {
        type: 'TURN_ON_HEATING_DATE';
        /** `YYYY-MM-DD` format date */
        turnOnDateForMajorityOfTadoUsers: string;
        /** `YYYY-MM-DD` format date */
        turnOnDateForMajorityOfUsersInLocalRegion: string;
    };
    sunshineDuration: EnergySavingDuration;
    hasAutoAssist: boolean;
    openWindowDetectionTimes: number;
    setbackScheduleDurationPerDay: EnergySavingDuration;
    totalSavingsInThermostaticModeAvailable: boolean;
    /** `YYYY-MM` */
    yearMonth: string;
    hideOpenWindowDetection: boolean;
    home: number;
    hideCommunityNews: boolean;
};
export declare type AirComfortDetailedRoomMessage = {
    roomId: number;
    message: string;
    visual: null;
    link: {
        text: string;
        type: 'internal';
        url: string;
    };
};
export declare type OutdoorQualityPollutant = {
    localizedName: string;
    scientificName: string;
    level: OutdoorQualityLevel;
    concentration: [Object];
};
export declare type OutdoorPollensTypeForcast = {
    localizedDay: string;
    /** `YYYY-MM-DD` format date */
    date: string;
    level: OutdoorQualityLevel;
};
export declare type OutdoorPollensType = {
    localizedName: string;
    type: OutdoorPollensTypeValue;
    localizedDescription: string;
    forecast: OutdoorPollensTypeForcast[];
};
export declare type AirComfortDetailed = {
    roomMessages: AirComfortDetailedRoomMessage[];
    outdoorQuality: {
        aqi: {
            value: number;
            level: OutdoorQualityLevel;
        };
        pollens: {
            dominant: {
                level: string;
            };
            types: OutdoorPollensType[];
        };
        pollutants: OutdoorQualityPollutant[];
    };
};
export declare type AddEnergiIQMeterReadingResponse = {
    id: string;
    homeId: number;
    /** `YYYY-MM-DD` format date */
    date: string;
    reading: number;
};
export declare type MeasureDataInterval<T> = {
    /** JSON formated date */
    from: string;
    /** JSON formated date */
    to: string;
    value: T;
};
export declare type MeasureDataPoint<T> = {
    /** JSON formated date */
    timestamp: string;
    value: T;
};
export declare type MeasureBoolean = {
    timeSeriesType: 'dataIntervals';
    valueType: 'boolean';
    dataIntervals: MeasureDataInterval<boolean>[];
};
export declare type MeasureTemperature = {
    timeSeriesType: 'dataPoints';
    valueType: 'temperature';
    min: Temperature;
    max: Temperature;
    dataPoints: MeasureDataPoint<Temperature>;
};
export declare type MeasurePercentage = {
    timeSeriesType: 'dataPoints';
    valueType: 'percentage';
    percentageUnit: 'UNIT_INTERVAL';
    min: number;
    max: number;
    dataPoints: MeasureDataPoint<number>;
};
export declare type MeasureStripeData = {
    stripeType: StripeTypeValue;
    setting: {
        type: 'HEATING';
        power: Power;
        temperature: Temperature | null;
    };
} | {
    stripeType: 'AWAY';
};
export declare type MeasureStripe = {
    timeSeriesType: 'dataIntervals';
    valueType: 'stripes';
    dataIntervals: MeasureDataInterval<MeasureStripeData>;
};
export declare type MeasureSettings = {
    timeSeriesType: 'dataIntervals';
    valueType: 'heatingSetting';
    dataIntervals: MeasureDataInterval<MeasureStripeData>;
};
export declare type MeasureCallForHeat = {
    timeSeriesType: 'dataIntervals';
    valueType: 'callForHeat';
    dataIntervals: MeasureDataInterval<'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'>;
};
export declare type MeasureWeatherConditionData = {
    state: WeatherStateValue;
    temperature: Temperature;
};
export declare type MeasureWeatherCondition = {
    timeSeriesType: 'dataIntervals';
    valueType: 'weatherCondition';
    dataIntervals: MeasureDataInterval<MeasureWeatherConditionData>;
};
export declare type MeasureWeatherSunny = {
    timeSeriesType: 'dataIntervals';
    valueType: 'boolean';
    dataIntervals: MeasureDataInterval<boolean>;
};
export declare type MeasureWeatherSlotData = {
    state: WeatherStateValue;
    temperature: Temperature;
};
export declare type MeasureWeatherSlot = {
    timeSeriesType: 'slots';
    valueType: 'weatherCondition';
    slots: {
        '04:00': MeasureWeatherSlotData | null;
        '08:00': MeasureWeatherSlotData | null;
        '12:00': MeasureWeatherSlotData | null;
        '16:00': MeasureWeatherSlotData | null;
        '20:00': MeasureWeatherSlotData | null;
    };
};
export declare type ZoneDayReport = {
    zoneType: ZoneType;
    interval: Interval;
    hoursInDay: number;
    measuredData: {
        measuringDeviceConnected: MeasureBoolean;
        insideTemperature: MeasureTemperature;
        humidity: MeasurePercentage;
    };
    stripes: MeasureStripe;
    settings: MeasureSettings;
    callForHeat: MeasureCallForHeat;
    weather: {
        condition: MeasureWeatherCondition;
        sunny: MeasureWeatherSunny;
        slots: MeasureWeatherSlot;
    };
};
