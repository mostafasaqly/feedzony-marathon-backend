import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateServiceDto) {
    const existing = await this.prisma.service.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug is already taken');

    return this.prisma.service.create({
      data: {
        name: dto.name,
        description: dto.description,
        slug: dto.slug,
        userId,
      },
    });
  }

  findAllByUser(userId: string) {
    return this.prisma.service.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    if (service.userId !== userId) {
      throw new ForbiddenException('You do not have access to this service');
    }
    return service;
  }

  async update(id: string, userId: string, dto: UpdateServiceDto) {
    await this.findOne(id, userId);

    if (dto.slug) {
      const slugOwner = await this.prisma.service.findUnique({
        where: { slug: dto.slug },
      });
      if (slugOwner && slugOwner.id !== id) {
        throw new ConflictException('Slug is already taken');
      }
    }

    return this.prisma.service.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        slug: dto.slug,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.service.delete({ where: { id } });
    return { message: 'Service deleted successfully' };
  }

  async findBySlug(slug: string) {
    const service = await this.prisma.service.findUnique({
      where: { slug },
      select: { name: true, description: true, slug: true },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }
}
