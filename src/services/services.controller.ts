import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@ApiTags('Services')
@Controller()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('services')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new service' })
  @ApiCreatedResponse({ description: 'Service created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' })
  @ApiConflictResponse({ description: 'Slug is already taken' })
  create(@Request() req: any, @Body() dto: CreateServiceDto) {
    return this.servicesService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('services')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "List the authenticated user's services" })
  @ApiOkResponse({ description: 'Returns services ordered by newest first' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' })
  findAll(@Request() req: any) {
    return this.servicesService.findAllByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('services/:id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get a single service by id' })
  @ApiOkResponse({ description: 'Returns the service' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' })
  @ApiForbiddenResponse({ description: 'Service belongs to another user' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.servicesService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('services/:id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a service' })
  @ApiOkResponse({ description: 'Returns the updated service' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' })
  @ApiForbiddenResponse({ description: 'Service belongs to another user' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  @ApiConflictResponse({ description: 'Slug is already taken' })
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.servicesService.update(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('services/:id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a service' })
  @ApiOkResponse({ description: 'Service deleted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' })
  @ApiForbiddenResponse({ description: 'Service belongs to another user' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  remove(@Request() req: any, @Param('id') id: string) {
    return this.servicesService.remove(id, req.user.id);
  }

  @Get('public/services/:slug')
  @ApiOperation({ summary: 'Publicly view a service by its slug' })
  @ApiOkResponse({ description: 'Returns public service info (name, description, slug)' })
  @ApiNotFoundResponse({ description: 'Service not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.servicesService.findBySlug(slug);
  }
}
