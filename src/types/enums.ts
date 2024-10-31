export type Platform = "iOS" | "Android";

export type TemperatureUnit = "CELSIUS";

export type Feature =
  | "EIQ_SETTINGS_AS_WEBVIEW"
  | "ELIGIBLE_FOR_ENERGY_CONSUMPTION"
  | "ENERGY_CONSUMPTION"
  | "HEATING_ROOM_DETAILS_AS_WEBVIEW"
  | "HIDE_BOILER_REPAIR_SERVICE"
  | "HOME_SCREEN_AS_WEBVIEW_PROD"
  | "HOME_SCREEN_AS_WEBVIEW_PROD_ANDROID"
  | "OWD_SETTINGS_AS_WEBVIEW"
  | "ROOMS_AND_DEVICES_SETTING_AS_WEBVIEW"
  | "SMART_SCHEDULE_AS_WEBVIEW";

export type FanLevel = "LEVEL1" | "LEVEL2" | "LEVEL3" | "LEVEL4" | "AUTO" | "SILENT";

export type FanSpeed = "HIGH" | "MIDDLE" | "LOW" | "AUTO";

export type ACMode = "COOL" | "HEAT" | "DRY" | "FAN" | "AUTO";

export type ACVerticalSwing = "ON" | "MID" | "AUTO" | "UP" | "DOWN" | "MID_UP" | "MID_DOWN";

export type ACHorizontalSwing = "RIGHT" | "MID" | "LEFT" | "ON" | "MID_RIGHT" | "MID_LEFT";

export type Termination = "AUTO" | "NEXT_TIME_BLOCK" | "MANUAL";

export type OutdoorQualityLevel = "EXCELLENT" | "NONE";

export type WeatherStateValue =
  | "CLOUDY"
  | "CLOUDY_MOSTLY"
  | "CLOUDY_PARTLY"
  | "DRIZZLE"
  | "FOGGY"
  | "NIGHT_CLEAR"
  | "NIGHT_CLOUDY"
  | "RAIN"
  | "SCATTERED_RAIN"
  | "SNOW"
  | "SUN"
  | "THUNDERSTORMS"
  | "WINDY";

export type DeviceType = "VA02" | "SU02";

export type DeviceCharacteristicsCapabilities =
  | "RADIO_ENCRYPTION_KEY_ACCESS"
  | "INSIDE_TEMPERATURE_MEASUREMENT"
  | "IDENTIFY";

export type DeviceBatteryState = "NORMAL" | "LOW";

export type DeviceOrientation = "HORIZONTAL" | "VERTICAL";

export type IQUnit = "m3" | "kWh";

export type RunningTimeAggregation = "day" | "month";

export type TadoMode = "HOME" | "AWAY";

export type StatePresence = TadoMode | "AUTO";

export type ZoneType = "HEATING" | "HOT_WATER" | "AIR_CONDITIONING";

export type ZoneDeviceDuty = "ZONE_UI" | "ZONE_LEADER" | "ZONE_DRIVER";

export type ZoneOverlayTerminationType = "MANUAL" | "TIMER";
export type ZoneOverlayTerminationTypeSkillBasedApp = "MANUAL" | "NEXT_TIME_BLOCK" | "TIMER";

export enum DataPointType {
  PERCENTAGE = "PERCENTAGE",
  TEMPERATURE = "TEMPERATURE",
  POWER = "POWER",
}

export type TimeTableDayType =
  | "MONDAY_TO_SUNDAY"
  | "MONDAY_TO_FRIDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type AwayConfigurationPreheatingLevel = "COMFORT" | "ECO" | "MEDIUM" | "OFF";

export type AirComfortFreshnessValue = "FAIR";

export type TemperatureLevel = "COLD" | "COMFY" | "HOT";

export type HumidityLevel = "HUMID" | "COMFY" | "DRY";

export type EnergySavingReportUnit = "HOURS" | "PERCENTAGE";

export type OutdoorPollensTypeValue = "GRASS" | "WEED" | "TREE";

export type StripeTypeValue = "HOME" | "OPEN_WINDOW_DETECTED" | "OVERLAY_ACTIVE";

export type HorizontalSwing =
  | "ON"
  | "OFF"
  | "RIGHT"
  | "MID_RIGHT"
  | "MID"
  | "MID_LEFT"
  | "LEFT";

export type VerticalSwing = "ON" | "OFF" | "DOWN" | "MID_DOWN" | "MID" | "MID_UP" | "UP";

export type ACInstallationState =
  | "AC_SPECS"
  | "COMPLETED"
  | "CONNECT_WIFI"
  | "NOT_COMPATIBLE"
  | "NO_COMMAND_SET"
  | "POSITION_DEVICE"
  | "REGISTER_WR"
  | "SETUP_AC_CLC_RECORDING"
  | "SETUP_AC_COMMAND_MATCHING"
  | "SETUP_AC_CREATE_AC_SETTING_RECORDING"
  | "SETUP_AC_ON_OFF_REDUCTION"
  | "SETUP_AC_RECORD_AC_SETTING_COMMANDS"
  | "SETUP_AC_SELECT_COMMAND_SET"
  | "SETUP_AC_SELECT_MANUFACTURER"
  | "UPDATE_FW"
  | "UPDATE_LEGACY_FW"
  | "UPLOAD_COMMAND_TABLE";

export type HeatingInstallationState =
  | "COMPLETED"
  | "CONNECT_GATEWAY"
  | "INSTALLER_INSTALLATION_PENDING"
  | "INSTALL_HW"
  | "REGISTER_DEVICES"
  | "SCHEDULE_INSTALLER_APPOINTMENT"
  | "SETUP_COMPATIBILITY_UNKNOWN"
  | "SETUP_INCOMPATIBLE"
  | "SETUP_SELECTION"
  | "SWISS_SUBSIDY_PROGRAM"
  | "WEB_USER_SUBSTITUTE";

export type InstallationType = "INSTALL_AC_G1" | "SALE_FITTING_ST_G1" | "REPLACE_BRIDGE";
