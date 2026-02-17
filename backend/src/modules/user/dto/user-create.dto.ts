import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserCreateDto {
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
    description: 'Unique username or email for the user.',
  })
  @IsString({ message: 'email must be a string' })
  @IsNotEmpty({ message: 'email should not be empty' })
  @Length(5, 150, { message: 'email must be between 5 and 150 characters' })
  email: string;

  @ApiProperty({
    type: String,
    example: 'P@ssw0rd!',
    description: 'Password. Must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'password should not be empty' })
  @Length(8, 150, { message: 'password must be between 8 and 150 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  })
  password: string;
}
