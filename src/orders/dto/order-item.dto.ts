import { Type } from "class-transformer";
import { IsNumber, isNumber, IsPositive } from "class-validator";


export class OrderItemDto {

    @IsNumber()
    @IsPositive()
    productId: number;

    @IsNumber()
    @IsPositive()
    quantity: number;

    @IsNumber()
    @IsPositive()
    @Type(() => Number) //validacion para que convierta string a number, no muy recomendado 
    price: number;
}