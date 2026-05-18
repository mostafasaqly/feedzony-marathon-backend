import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'My Web Shop', description: 'Service name', minLength: 2 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ example: 'Feedback board for my web shop', description: 'Optional description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'my-web-shop',
    description: 'Unique slug — lowercase letters, numbers and hyphens only',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers and hyphens',
  })
  slug: string;
}
