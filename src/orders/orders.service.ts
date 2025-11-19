import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {PrismaService} from "../prisma/prisma/prisma.service";
import {Prisma} from "@prisma/client";


@Injectable()
// this class contains logic for creating and reading orders
export class OrdersService {
    constructor(private readonly prisma: PrismaService) {}

    // list all orders for a user
    async getOrdersForUser(userId: string) {
        return this.prisma.order.findMany({
            where: {userId},
            orderBy: { createdAt: 'desc'},
            include:{
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }
    // these steps:
        // create order from users cart
        // load users cart, items, and products info,
        //check cart is not empty
        //check product stock is sufficient
        // decrememtn eact product stock
        // create order +order item rows + capture price at purchase
        // clear the cart items


    // if not enough stock, roll back transaction,
    async checkout(userId: string) {
        const cleanedUserId = userId.trim();
        if (!cleanedUserId) {
            throw new BadRequestException('User not found');
        }
        // wrap whole checkout in single transaction, we use transaction for atomicity, all succeed or fail together. tx is the helper to spesak to the db.
        const order = await this.prisma.$transaction(async (tx) => {
            // now load cart with items + prod details, wait until async function finishes
            const cart = await tx.cart.findUnique({
                // nest to include item + details, item+details and so on
                where: {userId: cleanedUserId},
                include: {
                    items: {
                        include: {
                            product: true,
                        }
                    }
                }
            });
            //validations for not valid cart or empty cart
            if (!cart) {
                throw new NotFoundException('This users cart not found');
            }
            if (cart.items.length === 0){
                throw new BadRequestException('Cart is empty');
            }

            //grab product ids for lock
            const productIds = cart.items.map((item)=> item.productId);
            if (productIds.length === 0){
                throw new NotFoundException('Cart has no products');
            }

            await tx.$queryRaw`
            SELECT "id"
            FROM "Product"
            WHERE "id" IN (${Prisma.join(productIds)})
            FOR UPDATE`;

            //check stock after row lock
            for (const item of cart.items) {
                if (!item.product) {
                    throw new NotFoundException(`Product: ${item.productId} not found`);
                }
                if (item.product.stock < item.quantity){
                    throw new BadRequestException(`Not enough stock of product ${item.product.name} exists. available: ${item.product.stock}`);
                }
            }

            // now decrement strock for each product
            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.productId},
                    data: {
                        stock: {
                            decrement: item.quantity,
                        }
                    }
                });
            }




            // nopw create an order with the related order items, copy cart items into orderItems. make sure to capture price
            const createdOrder = await tx.order.create({
                data: {
                    userId: cleanedUserId,
                    status: 'PENDING',
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            priceAtPurchase: item.product.price,
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        }
                    }
                }
            });
            //clear the cart after
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
                });

            return createdOrder;
        },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable, //This sets the isolation level of the transactions
            }
        );
        return order;
    }
}
