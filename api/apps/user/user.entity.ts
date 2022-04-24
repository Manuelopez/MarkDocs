import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Note } from '../note/note.entity';

@Entity('User')
export class User {
  @PrimaryColumn('uuid')
  public id: string;

  @Column()
  public email: string;

  @Column()
  public firstName: string;

  @Column()
  public lastName: string;

  @Column()
  public password: string;

  @OneToMany(() => Note, (note) => note.owner)
  notes: Note[];

  @ManyToMany(() => Note, (note) => note.users)
  @JoinTable()
  sharedNotes: Note[];

  @BeforeInsert()
  public addId() {
    this.id = uuidv4();
  }
}
