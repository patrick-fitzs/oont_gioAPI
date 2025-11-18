import {Controller, Get} from '@nestjs/common';
import { ProductsService } from './products.service';


// for '/products/' routes
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    // GET /products, call service and return what it gets back
    @Get()
    async findAll() {
        return this.productsService.findAll();
    }

    // id route parameter, convert to a num when passing it to the DB
    @Get(':id')
    async findOne(id:string) {
        const productId = Number(id);

        return this.productsService.findOne(productId);
    }

}
