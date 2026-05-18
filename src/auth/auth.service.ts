import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser(dto.name, dto.email, hashedPassword);

    try {
      const freePlan = await this.prisma.plan.findUnique({ where: { name: 'Free' } });
      if (freePlan) {
        await this.prisma.subscription.create({
          data: { userId: user.id, planId: freePlan.id, status: 'active' },
        });
      }
    } catch {}

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    const { password, ...safeUser } = user;
    return { access_token: token, user: safeUser };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    const { password, ...safeUser } = user;
    return { access_token: token, user: safeUser };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }
}
