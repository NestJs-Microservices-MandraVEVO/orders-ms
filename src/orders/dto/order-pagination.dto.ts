import { IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "src/common";
import { OrderStatusList } from "../enums/order.enums";
import { OrderStatus } from "generated/prisma";


export class OrderPaginationDto extends PaginationDto {

    @IsOptional()
    @IsEnum(OrderStatus,{
        message: `valid status are ${OrderStatusList}`
    } )
    status: OrderStatus;

}