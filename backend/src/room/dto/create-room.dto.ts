import { IsString , IsEmpty, IsEnum} from "class-validator";
export class CreateRoomDto {
    @IsString() @IsEmpty()
    "name": string;
    
   "maxUsers": number;
    @IsEnum(["PRIVATE" , "PUBLIC"], 
    {
        message: "Valid role required"
    })
    "type": "PRIVATE" | "PUBLIC";
}
