import { IsUUID } from 'class-validator';

export class FindByUuidDto {
  @IsUUID()
  id: string;
}
