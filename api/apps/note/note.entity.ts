import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Note {
  @PrimaryColumn()
  public id: string;

  @Column({ default: '' })
  public title: string;

  @Column({ default: '' })
  public body: string;

  @ManyToOne(() => User, (user) => user.notes)
  public owner: User;

  @ManyToMany(() => User, (user) => user.sharedNotes)
  users: User[];

  @BeforeInsert()
  addId() {
    this.id = uuidv4();
  }
}
