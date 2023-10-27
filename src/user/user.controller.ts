import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpStatus,
    Res,
    ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import {emailAlreadyExistsHandler} from "../utils/validation/helpers";
import {AuthGuard} from "@nestjs/passport";

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Создание нового пользователя' })
    @ApiQuery({ name: 'full_name', required: true, description: 'ФИО' })
    @ApiQuery({ name: 'email', required: true, description: 'E-Mail' })
    @ApiQuery({ name: 'password', required: true, description: 'Пароль' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: User })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.userService.create(createUserDto).catch(emailAlreadyExistsHandler);
    }

    @Get()
    @ApiOperation({ summary: 'Список пользователей' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: [User] })
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Одиночный пользователей' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: [User] })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
    async findOne(@Param('id', ParseIntPipe) id: number, @Res() res) {
        const user = await this.userService.findOne(+id);

        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        return res.json(user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    @ApiOperation({ summary: 'Изменение пользователя' })
    @ApiParam({ name: 'id', required: true, description: 'ID' })
    @ApiQuery({ name: 'full_name', required: false, description: 'ФИО' })
    @ApiQuery({ name: 'email', required: false, description: 'E-Mail' })
    @ApiQuery({ name: 'password', required: false, description: 'Пароль' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: User })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
    async update(@Param('id', ParseIntPipe) id: string, @Body() updateUserDto: UpdateUserDto, @Res() res) {
        if (!(await this.userService.findOne(+id))) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        const user = await this.userService.update(+id, updateUserDto).catch(emailAlreadyExistsHandler)

        return res.json(user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    @ApiParam({ name: 'id', required: true, description: 'ID' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Deleted', type: User })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Success', type: User })
    async remove(@Param('id', ParseIntPipe) id: string, @Res() res) {
        if (!(await this.userService.findOne(+id))) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        await this.userService.remove(+id);
        return res.status(HttpStatus.CREATED).send();
    }
}
