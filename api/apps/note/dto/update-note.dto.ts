import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateNoteDto {
  @IsUUID()
  id: string;
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  body: string;
}
