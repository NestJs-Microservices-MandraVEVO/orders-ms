import { IsEnum, IsUUID } from "class-validator";
import { OrderStatus } from "generated/prisma";
import { OrderStatusList } from "../enums/order.enums";


export class ChangeOrderStatusDto {
    @IsUUID(4)
    id: string;

    @IsEnum(OrderStatusList,{
        message: `Solo hay estos papu: ${OrderStatusList}`
    })
    status: OrderStatus
}