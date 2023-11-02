import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpStatus,
    UseGuards,
    ParseIntPipe,
    NotFoundException, Res,
} from '@nestjs/common';
import {ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger";

import {CategoryService} from './category.service';
import {CreateCategoryDto} from './dto/create-category.dto';
import {UpdateCategoryDto} from './dto/update-category.dto';
import {Category} from "./entities/category.entity";
import {AuthGuard} from "@nestjs/passport";

@ApiTags('Category')
@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {  }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({summary: 'Создание новой категории'})
    @ApiQuery({name: 'title', required: true, description: 'Название категории'})
    @ApiResponse({status: HttpStatus.OK, description: 'Success', type: Category})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'Bad Request'})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized'})
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.create(createCategoryDto);
    }

    @Get()
    @ApiOperation({summary: 'Список категорий'})
    @ApiResponse({status: HttpStatus.OK, description: 'Success', type: [Category], isArray: true,})
    findAll() {
        return this.categoryService.findAll();
    }

    @Get(':id')
    @ApiOperation({summary: 'Одиночная категория'})
    @ApiParam({name: 'id', required: true, description: 'ID категории'})
    @ApiResponse({status: HttpStatus.OK, description: 'Success', type: Category})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'Bad Request'})
    async findOne(@Param('id', ParseIntPipe) id: string) {
        const category = await this.categoryService.findOne(+id);
        if (!category) {
            throw new NotFoundException;
        }

        return category;
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    @ApiOperation({summary: 'Изменение категории'})
    @ApiParam({name: 'id', required: true, description: 'ID категории'})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'Bad Request'})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized'})
    async update(@Param('id', ParseIntPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        const category = await this.categoryService.findOne(+id);
        if (!category) {
            throw new NotFoundException;
        }

        return await this.categoryService.update(+id, updateCategoryDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    @ApiOperation({summary: 'Удаление категории'})
    @ApiParam({name: 'id', required: true, description: 'ID категории'})
    @ApiResponse({status: HttpStatus.OK, description: 'Success'})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'Bad Request'})
    @ApiResponse({status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized'})
    async remove(@Param('id', ParseIntPipe) id: string, @Res() res) {
        const category = await this.categoryService.findOne(+id);
        if (!category) {
            throw new NotFoundException;
        }

        await this.categoryService.remove(+id);
        return res.status(HttpStatus.CREATED).send();
    }
}
