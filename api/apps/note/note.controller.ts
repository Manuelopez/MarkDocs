import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'apps/guard/auth.guard';
import { UserService } from 'apps/user/user.service';
import { Request } from 'express';
import { CreateNoteDto } from './dto/create-note.dto';
import { ShareNoteDto } from './dto/share-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteService } from './note.service';

@Controller('api/note')
export class NoteController {
  constructor(
    private readonly noteService: NoteService,
    private readonly userService: UserService,
  ) {}

  @Get()
  public async getMyNotes(@Req() req) {
    try {
      return await this.noteService.findAll(req.user.id);
    } catch (error) {
      console.log(error);
      return new HttpException('Server Error', 500);
    }
  }

  @Get('sharedNotes')
  async getSharedNotes(@Req() req) {
    try {
      const user = await this.userService.sharedNotes(req.user.id);
      return user.sharedNotes;
    } catch (error) {
      console.log(error);
      return new HttpException('Server Error', 500);
    }
  }

  @Post()
  async createNote(@Req() req, @Body() createNoteDto: CreateNoteDto) {
    try {
      await this.noteService.create(req.user, createNoteDto);

      return { valid: true };
    } catch (error) {
      console.log(error);
      return new HttpException('Server Error', 500);
    }
  }

  @Put()
  async updateNote(@Req() req, @Body() updateNoteDto: UpdateNoteDto) {
    try {
      if (!(await this.noteService.existById(updateNoteDto.id))) {
        return new HttpException('Note Not Found', 404);
      }
      const note = await this.noteService.findByIdLoadOwnerUsers(
        updateNoteDto.id,
      );
      if (note.owner.id !== req.user.id) {
        let isShared = false;
        for (let user of note.users) {
          if (user.id === req.user.id) {
            isShared = true;
          }
        }
        if (!isShared) {
          return new HttpException(
            'You are not owner of the note and is note shared to you',
            403,
          );
        }
      }
      await this.noteService.update(note, updateNoteDto);
      return { valid: true };
    } catch (error) {
      console.log(error);
      return new HttpException('Server Error', 500);
    }
  }

  @Post('share')
  async shareNote(@Req() req, @Body() shareNoteDto: ShareNoteDto) {
    try {
      if (!(await this.noteService.existById(shareNoteDto.noteId))) {
        return new HttpException('Note Not Found', 404);
      }

      const note = await this.noteService.findByIdLoadOwnerUsers(
        shareNoteDto.noteId,
      );
      if (note.owner.id !== req.user.id) {
        let isShared = false;
        for (let user of note.users) {
          if (user.id === req.user.id) {
            isShared = true;
          }
        }
        if (!isShared) {
          return new HttpException(
            'You are not owner of the note and is note shared to you',
            403,
          );
        }
      }

      if (
        !(await this.userService.existByEmail(shareNoteDto.shareToUserEmail))
      ) {
        return new HttpException('User Not Found', 404);
      }
      const user = await this.userService.findByEmail(
        shareNoteDto.shareToUserEmail,
      );

      await this.noteService.share(note, user);

      return { valid: true };
    } catch (error) {
      console.log(error);
      return new HttpException('Server Error', 500);
    }
  }
}
