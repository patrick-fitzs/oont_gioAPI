import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma/prisma.service"; // straight up to Prisma schema (client)

@Injectable()
export class ProductsService {
    //constructor
    constructor(private readonly prisma: PrismaService) {}
    // method to get all products (non deleted), sorted by name, includes the category
    async findAll() {
        return this.prisma.product.findMany({
            where: { deletedAt: null }, // ignore deleted products
            orderBy: { name: 'asc'},
            include: {
                category: true, // to join the Category row so the prisma client gets profuct plus the ategory together
            },
        });
    }

    // findOne, to return a single product by its id.

}
