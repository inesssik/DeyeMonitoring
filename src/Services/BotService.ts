import TelegramBot, { KeyboardButton, Message } from 'node-telegram-bot-api';
import { StationService } from './StationService.js';
import { SubscribeService } from './SubscribeService.js';
import { SubscribeType } from '../Types/types.js';
import { DatabaseService } from './DatabaseService.js';
import { BUTTON_TEXTS, MESSAGES, SUBSCRIBE_DESCRIPTIONS } from '../Constants/constants.js';
import { singleton } from 'tsyringe';
import { ConfigService } from './ConfigService.js';

type CommandHandler = (msg: Message) => Promise<void>;

@singleton()
export class BotService {
  private readonly tgBot: TelegramBot;

  private readonly buttons = {
    START: { text: BUTTON_TEXTS.START },
    STATUS: { text: BUTTON_TEXTS.STATUS },
    SUBSCRIBE_LIGHT: { text: BUTTON_TEXTS.SUBSCRIBE_LIGHT },
    SUBSCRIBE_LOWBATTERY: { text: BUTTON_TEXTS.SUBSCRIBE_LOWBATTERY }
  } satisfies Record<string, KeyboardButton>;

  private readonly keyboard = [
    [this.buttons.STATUS],
    [this.buttons.SUBSCRIBE_LIGHT, this.buttons.SUBSCRIBE_LOWBATTERY]
  ];

  private handlers: Record<string, CommandHandler> = {};

  constructor(
    private readonly stationService: StationService,
    private readonly databaseService: DatabaseService,
    private readonly subscribeService: SubscribeService,
    private readonly configService: ConfigService
  ) {
    this.tgBot = new TelegramBot(this.configService.values.BOT_TOKEN, { polling: true });

    this.registerHandlers();
    this.initListeners();
  }

  private async sendMessageWithKeyboard(chatId: TelegramBot.ChatId, text: string, options?: TelegramBot.SendMessageOptions): Promise<TelegramBot.Message> {
    return await this.tgBot.sendMessage(chatId, text, {
      parse_mode: "HTML",
      reply_markup: {
        keyboard: this.keyboard,
        resize_keyboard: true,
      },
      ...options
    });
  }

  private registerHandlers(): void {
    this.handlers[BUTTON_TEXTS.START] = async (msg): Promise<void> => {
      await this.sendMessageWithKeyboard(msg.chat.id, this.stationService.getInfo());
    };

    this.handlers[BUTTON_TEXTS.STATUS] = async (msg): Promise<void> => {
      await this.sendMessageWithKeyboard(msg.chat.id, this.stationService.getInfo());
    };

    this.handlers[BUTTON_TEXTS.SUBSCRIBE_LIGHT] = async (msg): Promise<void> => {
      await this.handleSubscriptionToggle(msg, SubscribeType.LIGHT, BUTTON_TEXTS.SUBSCRIBE_LIGHT);
    };

    this.handlers[BUTTON_TEXTS.SUBSCRIBE_LOWBATTERY] = async (msg): Promise<void> => {
      await this.handleSubscriptionToggle(msg, SubscribeType.LOWBATTERY, BUTTON_TEXTS.SUBSCRIBE_LOWBATTERY);
    };
  }

  public async sendNotification(chatId: string | number, text: string): Promise<void> {
    try {
      await this.sendMessageWithKeyboard(chatId, text);
    } catch (error) {
      console.error(`Failed to send notification to ${chatId}:`, (error as Error).message);
    }
  }

  private async handleSubscriptionToggle(msg: Message, type: SubscribeType, title: string): Promise<void> {
    const clientId = msg.from?.id.toString();
    if (!clientId) return;

    const newStatus = await this.subscribeService.toggleSubscription(clientId, type);

    const prefix = newStatus ? MESSAGES.SUBSCRIBED : MESSAGES.UNSUBSCRIBED;

    const textToSend = `${prefix} "<b>${title}</b>"\n<i>${SUBSCRIBE_DESCRIPTIONS[type]}</i>`;

    await this.sendMessageWithKeyboard(msg.chat.id, textToSend);
  }

  private initListeners(): void {
    this.tgBot.on('message', async (msg) => {
      if (!msg.text || !msg.from) return;

      const text = msg.text;
      const clientId = msg.from.id;
      const chatId = msg.chat.id;

      try {
        await this.databaseService.insertUpdateUser(clientId, msg.from.username || '');
      } catch (e) {
        console.error('Error updating user stats:', e);
      }

      const handler = this.handlers[text];

      if (handler) {
        await handler(msg);
      } else {
        await this.sendMessageWithKeyboard(chatId, MESSAGES.UNKNOWN_COMMAND);
      }
    });

    console.log(MESSAGES.BOT_STARTED);
  }
}