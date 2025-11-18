import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {PrismaService} from "../prisma/prisma/prisma.service";


//logic for working with carts
@Injectable()
export class CartService {
    constructor(private readonly prisma: PrismaService) {}

    //get or create
    private async getOrCreateCartRecord(userId:string){
        return this.prisma.cart.upsert({
            where: {userId},
            update: {},
            create: {userId},
        });
    }
    //get cart for user item with items and product details, if no cart, create cart
    async getCartForUser(userId: string) {
        await this.getOrCreateCartRecord(userId);
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        return cart;
    }

    //add or update the item in cart
    // if already exists, we replace quantity.
    async addOrUpdateItem(userId: string, productId: number, quantity: number) {
        if (quantity < 1){
            throw new BadRequestException("quantity must be at least 1");
        }
        const product = await this.prisma.product.findUnique({
            where: {
                id: productId,
            }
        });
        if (!product) {
            throw new NotFoundException(`product ${productId} not found`);
        }

        const cart = await this.getOrCreateCartRecord(userId);

        await this.prisma.cartItem.upsert({
            where:{
                cartId_productId: { // links back to our unique cartid, product id
                    cartId: cart.id,
                    productId,
                },
            },
            update:{
                quantity,
            },
            create:{
                cartId: cart.id,
                productId,
                quantity,
            }
        });
        return this.getCartForUser(userId);
    }

    // remopve single item from cart, if no cart, or no item, return cart state
    async removeItem(userId: string, productId: number) {
        const cart = await this.prisma.cart.findUnique({
            where: {userId}
        });

        if (!cart) {
            return this.getCartForUser(userId);
        }
        try {
            await this.prisma.cartItem.delete({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId,
                    }
                }
            });
        } catch {
        }
        return this.getCartForUser(userId);
    }

    //remove all items from users cart
    async clearCart(userId: string) {
        const cart = await this.prisma.cart.findUnique({
            where: {userId}
        });
        if (!cart) {
            // no cart so nothing to clear , return empty cart
            return this.getCartForUser(userId);
        }
        await this.prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });
        return this.getCartForUser(userId);
    }




}
