export declare type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;
/** Example: `'en'`  */
export declare type Locale = string;
/** Example: `'Europe/Paris'` */
export declare type TimeZone = string;
export declare type Platform = 'iOS' | 'Android';
export declare type TemperatureUnit = 'CELSIUS';
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
export declare type Feature = 'ELIGIBLE_FOR_ENERGY_CONSUMPTION' | 'ENERGY_CONSUMPTION' | 'HEATING_ROOM_DETAILS_AS_WEBVIEW' | 'HOME_SCREEN_AS_WEBVIEW_PROD_ANDROID';
export declare type Termination = 'AUTO' | 'NEXT_TIME_BLOCK' | 'MANUAL';
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
export declare type WeatherSolarIntensityType = 'PERCENTAGE';
export declare type WeatherSolarIntensity = {
    type: WeatherSolarIntensityType;
    percentage: number;
    timestamp: string;
};
export declare type WeatherOutsideTemperatureType = 'TEMPERATURE';
export declare type Temperature = {
    celsius: number;
    fahrenheit: number;
};
export declare type WeatherOutsideTemperature = {
    celsius: number;
    fahrenheit: number;
    timestamp: string;
    type: WeatherOutsideTemperatureType;
    precision: Temperature;
};
export declare type WeatherStateType = 'WEATHER_STATE';
export declare type WeatherStateValue = 'CLOUDY' | 'NIGHT_CLOUDY';
export declare type WeatherState = {
    type: WeatherStateType;
    value: WeatherStateValue;
    timestamp: string;
};
export declare type Weather = {
    solarIntensity: WeatherSolarIntensity;
    outsideTemperature: WeatherOutsideTemperature;
    weatherState: WeatherState;
};
export declare type DeviceType = 'VA02' | 'SU02';
export declare type DeviceConnectionState = {
    value: boolean;
    timestamp: string;
};
export declare type DeviceCharacteristicsCapabilities = 'RADIO_ENCRYPTION_KEY_ACCESS' | 'INSIDE_TEMPERATURE_MEASUREMENT' | 'IDENTIFY';
export declare type DeviceCharacteristics = {
    capabilities: DeviceCharacteristicsCapabilities[];
};
export declare type DeviceMountingStateValue = 'CALIBRATED';
export declare type DeviceMountingState = {
    value: DeviceMountingStateValue;
    timestamp: string;
};
export declare type DeviceBatteryState = 'NORMAL' | 'LOW';
export declare type DeviceOrientation = 'HORIZONTAL' | 'VERTICAL';
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
export declare type IQUnit = 'm3' | 'kWh';
export declare type StatePresence = 'HOME' | 'AWAY' | 'AUTO';
export declare type State = {
    presence: StatePresence;
    presenceLocked: boolean;
};
export declare type ZoneType = 'HEATING' | 'AIR_CONDITIONING';
export declare type ZoneDazzleMode = {
    supported: boolean;
    enabled: boolean;
};
export declare type ZoneOpenWindowDetection = {
    supported: boolean;
    enabled: boolean;
    timeoutInSeconds: number;
};
export declare type ZoneDeviceDuty = 'ZONE_UI' | 'ZONE_LEADER' | 'ZONE_DRIVER';
export declare type ZoneDevice = Zone & {
    duties: ZoneDeviceDuty[];
};
export declare type ZoneOverlayTerminationType = 'MANUAL' | 'TIMER';
export declare type ZoneOverlayTerminationTypeSkillBasedApp = 'MANUAL' | 'NEXT_TIME_BLOCK' | 'TIMER';
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
export declare enum DataPointType {
    PERCENTAGE = "PERCENTAGE",
    TEMPERATURE = "TEMPERATURE"
}
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
export declare type AwayConfigurationPreheatingLevel = 'MEDIUM';
export declare type AwayConfiguration = {
    type: ZoneType;
    preheatingLevel: AwayConfigurationPreheatingLevel;
    minimumAwayTemperature: Temperature;
};
export declare type TimeTableDayType = 'MONDAY_TO_SUNDAY' | 'SATURDAY' | 'SUNDAY' | 'MONDAY_TO_FRIDAY';
export declare type TimeTable = {
    dayType: TimeTableDayType;
    /** HH:mm */
    start: string;
    /** HH:mm */
    end: string;
    geolocationOverride: boolean;
    setting: TimeTableSettings;
};
export declare type TimeTableType = 'ONE_DAY';
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
export declare type AirComfortFreshnessValue = 'FAIR';
export declare type AirComfortFreshness = {
    value: AirComfortFreshnessValue;
    /** `YYYY-MM-DDTHH:mm:ss` format datetime */
    lastOpenWindow: string;
};
export declare type TemperatureLevel = 'COLD' | 'COMFY' | 'HOT';
export declare type HumidityLevel = 'HUMID' | 'COMFY' | 'DRY';
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
export declare type EnergyIQConsumptionInputState = 'partial';
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
export declare type EnergySavingReportUnit = 'HOURS' | 'PERCENTAGE';
export declare type EnergySavingDuration = {
    value: number;
    unit: EnergySavingReportUnit;
};
export declare type EnergySavingReport = {
    coveredInterval: {
        /** JSON formated date */
        start: string;
        /** JSON formated date */
        end: string;
    };
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
