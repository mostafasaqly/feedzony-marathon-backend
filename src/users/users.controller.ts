import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserResponseDto } from '../auth/dto/auth-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiOkResponse({ description: 'Returns profile of the logged-in user (password excluded)', type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer token' })
  getMe(@Request() req: any) {
    const { password, ...user } = req.user;
    return user;
  }
}
