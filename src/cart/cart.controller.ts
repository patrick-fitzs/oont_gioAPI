import { Controller, BadRequestException, Get, Param, Body, Delete, Post } from '@nestjs/common';
import {CartService} from "./cart.service";


// routes that start with /cart
@Controller('cart')
export class CartController {
    // nest instance of cartService and inject here then call this.cartService inside our routes
    constructor(private readonly cartService: CartService) {}

    //get cart/:userId - returns cart for a user
    @Get(':userId')
    async getCart(@Param('userId') userId: string) {
        // just removes whitespaces before and after userid
        const cleanedUserId = userId.trim();
        if (!cleanedUserId) {
            throw new BadRequestException('UserId must be provided.');
        }
        //return this users cart
        return this.cartService.getCartForUser(cleanedUserId);
    }

    // POST , add or update item, can update quantity for that product in the cart with a new given value

    @Post(':userId/items')
    async addOrUpdateItem(
        @Param('userId') userId: string,
        @Body('productId') productIdRaw: any, // reads from json body, productid
        @Body('quantity') quantityRaw: any// reads from json body, quantity
    ){
        const cleanedUserId = userId.trim();
        if (!cleanedUserId) {
            throw new BadRequestException('UserId must be provided.');
        }

        //convert string to numbers
        const productId = Number(productIdRaw);
        const quantity = Number(quantityRaw);

        // validate nums are positive
        if (
            Number.isNaN(productId) || productId < 1 || quantity <1
        ) {
        throw new BadRequestException('Product Id and quantity must be positive numbers.');
        }
        // give logic to service
        return this.cartService.addOrUpdateItem(cleanedUserId, productId, quantity);
    }


    //delete item from cart, one specific item, ig not in cart, nothing changes
    @Delete(':userId/items/:productId')
    async removeItem(@Param('userId') userId: string, @Param('productId') productIdParam: string)
    {
        const cleanedUserId = userId.trim();
        if (!cleanedUserId) {
            throw new BadRequestException('UserId must be provided.');
        }
        // change productid path to a number
        const productId = Number(productIdParam);
        if (Number.isNaN(productId) || productId < 1) {
            throw new BadRequestException('Product Id must be a positive number.');
        }
        // return the service, productid to delete
        return this.cartService.removeItem(cleanedUserId, productId);

    }
    // delete all items from users cart
    @Delete(':userId')
    async clearCart(@Param('userId') userId: string) {
        const cleanedUserId = userId.trim();
        if (!cleanedUserId) {
            throw new BadRequestException('UserId must be provided.');
        }
        // return to service which deleted all cartItem rows for the user
        return this.cartService.clearCart(cleanedUserId);
    }
}
