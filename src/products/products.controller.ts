import {Controller, Get, Param, BadRequestException, Query} from '@nestjs/common';
import { ProductsService } from './products.service';


// for '/products/' routes
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    // GET /products, call service and return what it gets back
    @Get()
    async findAll(
        @Query('page') page?:string,
        @Query('limit') limit?:string,
        ) {
        //convert query strings to nums with defaults.
        // if a page exists, assign to pageNumber, otherwise convert to number and assign otherwise use 1
        const pageNumber = page ? Number(page) : 1;
        const limitNumber = limit ? Number(limit) : 10;

        //validate numbers, they must be positive, so if not a num, page less than 1 or limit less than 1 throw exception
        if (
            Number.isNaN(pageNumber) || Number.isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1
        ){
            throw new BadRequestException('Limit and page number must be positive.');
        }

        // return valid pos nums, pass to service to do skip/take maths
        return this.productsService.findAll(pageNumber, limitNumber);
    }

    // @Param('id') pulls string so convert to number
    // id route parameter, convert to a num when passing it to the DB
    @Get(':id')
    async findOne(@Param('id')id:string) {
        const productId = Number(id);

        return this.productsService.findOne(productId);
    }

}
