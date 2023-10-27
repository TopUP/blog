import {extname} from 'path';
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpStatus,
    UseInterceptors,
    UploadedFile,
    ParseFilePipeBuilder,
    // HttpException,
} from '@nestjs/common';
import {ApiOperation, ApiQuery, ApiResponse, ApiTags} from "@nestjs/swagger";

import {CategoryService} from './category.service';
import {CreateCategoryDto} from './dto/create-category.dto';
import {UpdateCategoryDto} from './dto/update-category.dto';
import {Category} from "./entities/category.entity";
import {FileInterceptor} from "@nestjs/platform-express";

// import {diskStorage}         from "multer";

@ApiTags('Category')
@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {
    }

    @Post()
    @ApiOperation({summary: 'Создание новой категории'})
    @ApiQuery({name: 'title', required: true, description: 'Название категории'})
    @ApiResponse({status: HttpStatus.OK, description: 'Success', type: Category})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'Bad Request'})
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.create(createCategoryDto);
    }

    @Get()
    @ApiOperation({summary: 'Возвращает все категории'})
    @ApiResponse({status: HttpStatus.OK, description: 'Success', type: [Category], isArray: true,})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'Bad Request'})
    findAll() {
        return this.categoryService.findAll();
    }

    @Get(':id')
    @ApiOperation({summary: 'Возвращает одну категорию'})
    @ApiQuery({name: 'id', required: true, description: 'ID категории'})
    @ApiResponse({status: HttpStatus.OK, description: 'Success', type: Category, isArray: true,})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'Bad Request'})
    findOne(@Param('id') id: string) {
        return this.categoryService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoryService.update(+id, updateCategoryDto);
    }

    @Delete(':id')
    @ApiOperation({summary: 'Удаляет категорию'})
    @ApiQuery({name: 'id', required: true, description: 'ID категории'})
    @ApiResponse({status: HttpStatus.OK, description: 'Success'})
    @ApiResponse({status: HttpStatus.BAD_REQUEST, description: 'Bad Request'})
    remove(@Param('id') id: string) {
        return this.categoryService.remove(+id);
    }


    @Post(':id/upload-image')
    @UseInterceptors(FileInterceptor(
        'image',
        // {
        //     storage: diskStorage({
        //         destination: './uploads',
        //         filename: (req, file, callback) => {
        //             const name = file.originalname.split('.')[0];
        //             const fileExtName = extname(file.originalname);
        //             const randomName = Array(4)
        //                 .fill(null)
        //                 .map(() => Math.round(Math.random() * 10).toString(10))
        //                 .join('');
        //             callback(null, `${name}${randomName}${fileExtName}`);
        //         },
        //     }),
        //     fileFilter: (req, file, callback) => {
        //         if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        //             return callback(
        //                 new HttpException(
        //                     'Only image files are allowed!',
        //                     HttpStatus.BAD_REQUEST,
        //                 ),
        //                 false,
        //             );
        //         }
        //         callback(null, true);
        //     },
        // }
    ))
    uploadImage(
        @Param('id') id: string,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: 'jpeg|gif',
                })
                .addMaxSizeValidator({
                    maxSize: 1000000
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
                }),
        ) image: Express.Multer.File
    ) {
        const updateDto = new UpdateCategoryDto();
        updateDto.image = image.filename
        this.categoryService.update(+id, updateDto);

        return {image, updateDto};
    }

}
