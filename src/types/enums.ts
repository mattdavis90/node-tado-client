export type Platform = 'iOS' | 'Android'

export type TemperatureUnit = 'CELSIUS'

export type Feature =
    | 'ELIGIBLE_FOR_ENERGY_CONSUMPTION'
    | 'ENERGY_CONSUMPTION'
    | 'HEATING_ROOM_DETAILS_AS_WEBVIEW'
    | 'HOME_SCREEN_AS_WEBVIEW_PROD_ANDROID'

export type FanLevel = 'LEVEL1' | 'LEVEL2' | 'LEVEL3' | 'AUTO'

export type FanSpeed = 'HIGH' | 'MIDDLE' | 'LOW' | 'AUTO'

export type ACMode = 'COOL' | 'HEAT' | 'DRY' | 'FAN' | 'AUTO'

export type Termination = 'AUTO' | 'NEXT_TIME_BLOCK' | 'MANUAL'

export type OutdoorQualityLevel = 'EXCELLENT' | 'NONE'

export type WeatherStateValue =
    | 'CLOUDY'
    | 'CLOUDY_PARTLY'
    | 'CLOUDY_MOSTLY'
    | 'NIGHT_CLOUDY'
    | 'NIGHT_CLEAR'
    | 'SUN'
    | 'SCATTERED_RAIN'

export type DeviceType = 'VA02' | 'SU02'

export type DeviceCharacteristicsCapabilities =
    | 'RADIO_ENCRYPTION_KEY_ACCESS'
    | 'INSIDE_TEMPERATURE_MEASUREMENT'
    | 'IDENTIFY'

export type DeviceBatteryState = 'NORMAL' | 'LOW'

export type DeviceOrientation = 'HORIZONTAL' | 'VERTICAL'

export type IQUnit = 'm3' | 'kWh'

export type RunningTimeAggregation = 'day' | 'month'

export type StatePresence = 'HOME' | 'AWAY' | 'AUTO'

export type ZoneType = 'HEATING' | 'HOT_WATER' | 'AIR_CONDITIONING'

export type ZoneDeviceDuty = 'ZONE_UI' | 'ZONE_LEADER' | 'ZONE_DRIVER'

export type ZoneOverlayTerminationType = 'MANUAL' | 'TIMER'
export type ZoneOverlayTerminationTypeSkillBasedApp =
    | 'MANUAL'
    | 'NEXT_TIME_BLOCK'
    | 'TIMER'

export enum DataPointType {
    PERCENTAGE = 'PERCENTAGE',
    TEMPERATURE = 'TEMPERATURE',
}

export type TimeTableDayType =
    | 'MONDAY_TO_SUNDAY'
    | 'MONDAY_TO_FRIDAY'
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY'

export type AwayConfigurationPreheatingLevel = 'MEDIUM'

export type AirComfortFreshnessValue = 'FAIR'

export type TemperatureLevel = 'COLD' | 'COMFY' | 'HOT'

export type HumidityLevel = 'HUMID' | 'COMFY' | 'DRY'

export type EnergyIQConsumptionInputState = 'partial'

export type EnergySavingReportUnit = 'HOURS' | 'PERCENTAGE'

export type OutdoorPollensTypeValue = 'GRASS' | 'WEED' | 'TREE'

export type StripeTypeValue = 'HOME' | 'OPEN_WINDOW_DETECTED' | 'OVERLAY_ACTIVE'
