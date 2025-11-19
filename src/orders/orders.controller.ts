import {Controller, BadRequestException, Get, Param, Post, ParseIntPipe} from '@nestjs/common';
import {OrdersService} from './orders.service';

// these are the //orders routes
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    //return all orders placed by a given user
    @Get(':userId')
    async getOrders(@Param('userId')userId: string) {
        const cleanedUserId = userId.trim()
        if(!cleanedUserId) {
            throw new BadRequestException('User not found/please enter user')
        }
        return this.ordersService.getOrdersForUser(cleanedUserId)
    }

    // - /orders/:userId/checkout
    // convert a users cart into an order, must validate stock, decrement, create order + order items, then clear cart, all in one db transaction
    @Post('/:userId/checkout')
    async checkout(@Param('userId') userId: string) {
        const cleanedUserId = userId.trim()
        if(!cleanedUserId) {
            throw new BadRequestException('User not found/please enter user')
        }
        return this.ordersService.checkout(cleanedUserId)
    }

    @Post('/:id/cancel')
    async cancel(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.cancelOrder(id)
    }
}
