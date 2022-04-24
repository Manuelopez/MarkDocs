import { IsEmail, IsUUID } from 'class-validator';

export class ShareNoteDto {
  @IsUUID()
  noteId: string;

  shareToUserEmail: string;
}
