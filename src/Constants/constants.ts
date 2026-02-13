import { SubscribeType } from "../Types/types.js";

export const SUBSCRIBE_BUTTON_TEXTS: Record<SubscribeType, string> = {
  [SubscribeType.LIGHT]: '💡 Розсилка Світла',
  [SubscribeType.LOWBATTERY]: '🪫 Розсилка Батареї'
} as const;

export const BUTTON_TEXTS = {
  START: '/start',
  STATUS: '🔋 Статус',
  SUBSCRIBE_LIGHT: SUBSCRIBE_BUTTON_TEXTS[SubscribeType.LIGHT],
  SUBSCRIBE_LOWBATTERY: SUBSCRIBE_BUTTON_TEXTS[SubscribeType.LOWBATTERY]
} as const;

export const MESSAGES = {
  UNKNOWN_COMMAND: '❌ Невідома команда!',
  SUBSCRIBED: '🟩 Ви підписались на',
  UNSUBSCRIBED: '🟥 Ви відписались від',
  BOT_STARTED: 'Bot handlers have been started...'
} as const;

export const SUBSCRIBE_DESCRIPTIONS: Record<SubscribeType, string> = {
  [SubscribeType.LIGHT]: "Сповіщає про увімкнення/вимкнення світла",
  [SubscribeType.LOWBATTERY]: "Сповіщає про відключення ліфта найближчим часом"
} as const;