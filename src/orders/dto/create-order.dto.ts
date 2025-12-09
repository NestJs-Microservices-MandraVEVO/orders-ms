import { IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive } from "class-validator";
import { OrderStatus } from "generated/prisma";
import { OrderStatusList } from "../enums/order.enums";

export class CreateOrderDto {

@IsNumber()
@IsPositive()
totalAmount: number;

@IsNumber()
@IsPositive()
totalItems: number;


@IsEnum(OrderStatusList,{
    message: `possible status values are ${OrderStatusList}`
})
status: OrderStatus = OrderStatus.PENDING;

@IsBoolean()
@IsOptional()
paid: boolean = false;

}
