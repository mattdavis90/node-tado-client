export declare type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;
export declare type Locale = 'en' | string;
export declare type TimeZone = 'Europe/Paris' | string;
export declare type Platform = 'iOS' | 'Android' | string;
export declare type TemperatureUnit = 'CELSIUS' | string;
export declare type Country = 'FRA' | string;
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
export declare type HomeSkill = 'AUTO_ASSIST' | string;
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
export declare type WeatherSolarIntensityType = 'PERCENTAGE' | string;
export declare type WeatherSolarIntensity = {
    type: WeatherSolarIntensityType;
    percentage: number;
    timestamp: string;
};
export declare type WeatherOutsideTemperatureType = 'TEMPERATURE' | string;
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
export declare type WeatherStateType = 'WEATHER_STATE' | string;
export declare type WeatherStateValue = 'CLOUDY' | string;
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
export declare type DeviceType = 'VA02' | 'SU02' | string;
export declare type DeviceConnectionState = {
    value: boolean;
    timestamp: string;
};
export declare type DeviceCharacteristicsCapabilities = 'RADIO_ENCRYPTION_KEY_ACCESS' | 'INSIDE_TEMPERATURE_MEASUREMENT' | 'IDENTIFY' | string;
export declare type DeviceCharacteristics = {
    capabilities: DeviceCharacteristicsCapabilities[];
};
export declare type DeviceMountingStateValue = 'CALIBRATED' | string;
export declare type DeviceMountingState = {
    value: DeviceMountingStateValue;
    timestamp: string;
};
export declare type DeviceBatteryState = 'NORMAL' | string;
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
