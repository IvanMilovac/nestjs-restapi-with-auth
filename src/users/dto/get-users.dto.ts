import { IsOptional, IsNumberString } from 'class-validator';

export class GetUsersDto {
  /* @IsOptional()
  @IsNumberString() */
  userId?: string;
}
