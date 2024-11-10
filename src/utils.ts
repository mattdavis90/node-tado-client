import type { Tado } from "./tado";
import type {
  ACMode,
  DeepPartial,
  FanLevel,
  FanSpeed,
  HorizontalSwing,
  Power,
  SetZoneOverlayArg,
  Termination,
  VerticalSwing,
  ZoneOverlayTermination,
} from "./types";

export async function getSingleZoneOverlayConfig(
  tado: Tado,
  home_id: number,
  zone_id: number,
  power: Power,
  temperature?: number,
  termination?: Termination | undefined | number,
  fan_speed?: FanSpeed | FanLevel,
  ac_mode?: ACMode,
  verticalSwing?: VerticalSwing,
  horizontalSwing?: HorizontalSwing,
): Promise<{
  setting: DeepPartial<SetZoneOverlayArg>;
  termination?: Partial<ZoneOverlayTermination>;
  type: "MANUAL";
}> {
  const zone_capabilities = await tado.getZoneCapabilities(home_id, zone_id);

  const config: {
    setting: DeepPartial<SetZoneOverlayArg>;
    termination?: Partial<ZoneOverlayTermination>;
    type: "MANUAL";
  } = {
    setting: {
      type: zone_capabilities.type,
    },
    type: "MANUAL",
  };

  if (power.toUpperCase() == "ON") {
    config.setting.power = "ON";

    if (
      (config.setting.type == "HEATING" || config.setting.type == "HOT_WATER") &&
      temperature
    ) {
      config.setting.temperature = { celsius: temperature };
    }

    if (zone_capabilities.type == "AIR_CONDITIONING") {
      if (ac_mode) {
        config.setting.mode = ac_mode.toUpperCase() as ACMode;
      }

      if (verticalSwing) {
        config.setting.verticalSwing = verticalSwing;
      }

      if (horizontalSwing) {
        config.setting.horizontalSwing = horizontalSwing;
      }

      if (
        config.setting.mode?.toLowerCase() == "heat" ||
        config.setting.mode?.toLowerCase() == "cool" ||
        config.setting.mode?.toLowerCase() == "auto" ||
        config.setting.mode?.toLowerCase() == "dry"
      ) {
        if (temperature) {
          config.setting.temperature = { celsius: temperature };
        }

        if (fan_speed && config.setting.mode?.toLowerCase() != "dry") {
          if ((zone_capabilities.FAN || zone_capabilities.AUTO).fanLevel !== undefined) {
            config.setting.fanLevel = fan_speed.toUpperCase() as FanLevel;
          } else {
            config.setting.fanSpeed = fan_speed.toUpperCase() as FanSpeed;
          }
        }
      }
    }
  } else {
    config.setting.power = "OFF";
  }

  if (!termination) {
    termination = "MANUAL";
  }

  if (typeof termination === "string" && !isNaN(parseInt(termination))) {
    termination = parseInt(termination);
  }

  if (typeof termination === "number") {
    config.type = "MANUAL";
    config.termination = {
      typeSkillBasedApp: "TIMER",
      durationInSeconds: termination,
    };
  } else if (termination.toLowerCase() == "manual") {
    config.type = "MANUAL";
    config.termination = {
      typeSkillBasedApp: "MANUAL",
    };
  } else if (termination.toLowerCase() == "auto") {
    config.termination = {
      type: "TADO_MODE",
    };
  } else if (termination.toLowerCase() == "next_time_block") {
    config.type = "MANUAL";
    config.termination = {
      typeSkillBasedApp: "NEXT_TIME_BLOCK",
    };
  }

  return config;
}
