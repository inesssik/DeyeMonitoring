import TelegramBot, { KeyboardButton } from 'node-telegram-bot-api';
import Station from './Station.js';
import SubscribesManager from './SubscribesManager.js';
import { SubscribeType } from './Types/types.js';

interface BotConstructor {
  tgBot: TelegramBot;
  station: Station;
}

class Bot {
  private readonly tgBot: TelegramBot;
  private readonly station: Station;
  private readonly subscribesManager: SubscribesManager;
  private readonly buttons = {
    START: { text: `/start` },
    STATUS: { text: `🔋 Статус` },
    SUBSCRIBE_LIGHT: { text: `💡 Розсилка Світла` },
    SUBSCRIBE_STATUS: { text: `🪫 Розсилка Статусу` }
  } satisfies Record<string, KeyboardButton>;
  private readonly keyboard = [
    [this.buttons.STATUS],
    [this.buttons.SUBSCRIBE_LIGHT, this.buttons.SUBSCRIBE_STATUS]
  ];

  constructor(params: BotConstructor) {
    this.tgBot = params.tgBot;
    this.station = params.station;
    this.initHandlers();
  }

  private async sendMessageWithKeyboard(chatId: TelegramBot.ChatId, text: string, options?: TelegramBot.SendMessageOptions): Promise<TelegramBot.Message> {
    return await this.tgBot.sendMessage(chatId, text, { parse_mode: "HTML", reply_markup: { keyboard: this.keyboard, resize_keyboard: true, ...options } });
  }

  private initHandlers(): void {
    this.tgBot.on('message', async (msg) => {
      const text = msg.text;
      const clientId = msg.from.id;
      const chatId = msg.chat.id;

      switch (text) {
        case this.buttons.START.text:
          await this.sendMessageWithKeyboard(chatId, this.station.getInfo());
          break;

        case this.buttons.STATUS.text:
          await this.sendMessageWithKeyboard(chatId, this.station.getInfo());
          break;

        case this.buttons.SUBSCRIBE_LIGHT.text:
          {
            const clientSubscribes = await this.subscribesManager.getClientSubscribes(clientId.toString());
            const statusSwitchedTo = await clientSubscribes.get(SubscribeType.LIGHT).switchStatus();
            const textToSend = `Ви ${statusSwitchedTo ? 'підписались на' : 'відписались від'} ${this.buttons.SUBSCRIBE_LIGHT.text}`;
            await this.sendMessageWithKeyboard(chatId, textToSend);
            break;
          }

        case this.buttons.SUBSCRIBE_STATUS.text:
          {
            const clientSubscribes = await this.subscribesManager.getClientSubscribes(clientId.toString());
            const statusSwitchedTo = await clientSubscribes.get(SubscribeType.STATUS).switchStatus();
            const textToSend = `Ви ${statusSwitchedTo ? 'підписались на' : 'відписались від'} ${this.buttons.SUBSCRIBE_STATUS.text}`;
            await this.sendMessageWithKeyboard(chatId, textToSend);
            break;
          }

        default:
          await this.sendMessageWithKeyboard(chatId, `❌ Невідома команда!`);
          break;
      }
    });

    console.log(`Bot handlers has been started...`);
    return;
  }
}

export default Bot;