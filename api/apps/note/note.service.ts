import { Inject, Injectable } from '@nestjs/common';
import { User } from 'apps/user/user.entity';
import { UserService } from 'apps/user/user.service';
import { Repository } from 'typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './note.entity';

@Injectable()
export class NoteService {
  constructor(
    @Inject('NOTE_REPOSITORY')
    private readonly noteRepository: Repository<Note>,
  ) {}

  public async existById(id: string) {
    return (await this.noteRepository.findOne({ id })) ? true : false;
  }

  public async findById(id: string) {
    return await this.noteRepository.findOne({
      where: { id: id },
      relations: [],
    });
  }

  public async findAll(userId: string) {
    return await this.noteRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner'],
    });
  }

  async shared(userId: string) {
    return await this.noteRepository.find({
      relations: ['users'],
      where: (qb) => {
        qb.where('users.id = :userId', { userId });
      },
    });
  }

  async findByIdLoadOwnerUsers(id: string) {
    return await this.noteRepository.findOne({
      where: { id: id },
      relations: ['owner', 'users'],
    });
  }

  async findByIdLodaOwner(id) {
    return await this.noteRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
  }
  async create(user: User, noteData: CreateNoteDto) {
    const note = new Note();
    note.title = noteData.title;
    note.body = noteData.body;
    note.owner = user;

    return await this.noteRepository.save(note);
  }

  async update(note: Note, updateNote: UpdateNoteDto) {
    note.title = updateNote.title;
    note.body = updateNote.body;
    await this.noteRepository.save(note);
  }

  async share(note: Note, user: User) {
    note.users.push(user);
    await this.noteRepository.save(note);
  }
}
