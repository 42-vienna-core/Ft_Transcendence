import { Controller , Get} from '@nestjs/common';

@Controller('redis')
export class RedisController {
    @Get('ping')
    async ping () {
        return 'pong';
    }
}
