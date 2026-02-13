import { StationService } from "./StationService.js";
import { BotService } from "./BotService.js";
import { SubscribeService } from "./SubscribeService.js";
import { StationStatus, SubscribeType } from "../Types/types.js";
import { singleton } from "tsyringe";


@singleton()
export class NotificationService {
  constructor(
    private readonly stationService: StationService,
    private readonly botService: BotService,
    private readonly subscribeService: SubscribeService
  ) {
    this.initListeners();
  }

  private initListeners(): void {
    this.stationService.on('statusChange', async (newStatus: StationStatus) => {
      await this.handleStatusChange(newStatus);
    });

    this.stationService.on('lowBattery', async (batteryLevel: number) => {
      await this.handleLowBattery(batteryLevel);
    });

    console.log('Notification Service initialized.');
  }

  private async handleStatusChange(newStatus: StationStatus): Promise<void> {
    const message = newStatus === StationStatus.withGrid
      ? `🟢 <b>З'явилося світло!</b>\nЖивлення від мережі.`
      : `🔴 <b>Зникло світло!</b>\nЖивлення від батареї.`;

    await this.broadcast(SubscribeType.LIGHT, message);
  }

  private async handleLowBattery(level: number): Promise<void> {
    const message = `🪫 <b>Увага! Низький заряд батареї: ${level}%</b>\nПора економити енергію.`;
    await this.broadcast(SubscribeType.LOWBATTERY, message);
  }

  private async broadcast(type: SubscribeType, message: string): Promise<void> {
    console.log(`Broadcasting message for type ${type}...`);
    const subscribers = await this.subscribeService.getSubscribers(type);

    const promises = subscribers.map(clientId => this.botService.sendNotification(clientId, message));
    await Promise.all(promises);

    console.log(`Sent notifications to ${subscribers.length} users.`);
  }
}