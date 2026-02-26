// DevFlags.ts
import { isDevMode } from "../../native/BuildConfigBridge";

type DevFlagsType = {
  useDevStorage: boolean;
  bypassVideoValidation: boolean;
  altOriginalArea: boolean;
  allowResetEntries: boolean;
};

const flags: DevFlagsType = {
  useDevStorage: false,
  bypassVideoValidation: false,
  altOriginalArea: false,
  allowResetEntries: false,
};

export const DevFlags = {
  get: (): DevFlagsType => flags,

  getKeys: (): (keyof DevFlagsType)[] => {
    return Object.keys(flags) as (keyof DevFlagsType)[];
  },

  isEnabled: (key: keyof DevFlagsType): boolean => {
    return flags[key];
  },

  set: (key: keyof DevFlagsType, value: boolean) => {
    flags[key] = value;
  },
};

export const canUseDevFlags = isDevMode;
