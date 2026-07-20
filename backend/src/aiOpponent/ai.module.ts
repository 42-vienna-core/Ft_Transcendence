import { Module } from "@nestjs/common";
import { AiBotService } from "./ai.service";

@Module({
	providers: [AiBotService],
	exports: [AiBotService],
})
export class AiModule {}