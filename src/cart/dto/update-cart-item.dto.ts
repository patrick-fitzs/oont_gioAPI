// src/cart/dto/update-cart-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    example: 3,
    description: 'New quantity for this product in the cart',
  })
  //decorators
  @IsInt()
  @Min(1)
  quantity: number;
}
