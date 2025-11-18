// for use wih swagger, so i can add products to cart
import {IsInt, isInt, Min, min} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class AddCartItemDto {
    @ApiProperty({example: 1, description: 'Item Id to add to cart'})
    @IsInt()
    @Min(1)
    productId: number;

    @ApiProperty({example: 2, description: 'Quantity of Item to add to cart'})
    @IsInt()
    @Min(1)
    quantity: number;
}