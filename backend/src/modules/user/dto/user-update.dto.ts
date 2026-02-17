import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UserUpdateDto {
  @ApiProperty({
    type: String,
    example: 'Ali',
    description: 'Full name of the user.',
  })
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name should not be empty' })
  @Length(3, 150, { message: 'name must be between 3 and 150 characters' })
  name: string;

  @ApiProperty({
    type: String,
    example: 'ali@mail.com',
    description: 'Unique email for the user.',
  })
  @IsString({ message: 'email must be a string' })
  @IsNotEmpty({ message: 'email should not be empty' })
  @Length(5, 150, { message: 'email must be between 5 and 150 characters' })
  email: string;
}
