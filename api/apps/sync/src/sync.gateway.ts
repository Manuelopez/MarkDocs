import {
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { NoteService } from 'apps/note/note.service';
import { Server, Socket } from 'socket.io';
import { Group } from './group/group';
import { User } from './group/user';
import { DiffMatchPatch } from 'diff-match-patch-typescript';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SyncGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly synchronization: DiffMatchPatch;
  constructor(private readonly noteService: NoteService) {
    this.synchronization = new DiffMatchPatch();
  }

  private groups: Group[];
  @WebSocketServer() server: Server;

  afterInit(server: any) {
    console.log('init');
  }

  handleConnection(socket: Socket, ...args: any[]): void {
    console.log(`New Connection: ${socket.id}`);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, @MessageBody() payload: any) {
    const group = this.groups.find(
      (currentGroup) => currentGroup.roomId === payload.roomId,
    );
    const user = new User();
    user.socketId = client.id;

    if (!group) {
      if (!(await this.noteService.existById(payload.roomId))) {
        this.server
          .to(client.id)
          .emit('noteNotFound', { text: 'Note Not Found' });

        return false;
      }

      const note = await this.noteService.findById(payload.roomId);

      const newGroup = new Group();
      newGroup.roomId = payload.roomId;
      user.serverShadow = note.body;
      newGroup.title = note.title;
      newGroup.serverText = note.body;
      newGroup.users.push(user);

      this.groups.push(newGroup);
      client.join(payload.roomId);

      this.server
        .to(client.id)
        .emit('createdRoom', { text: note.body, title: note.title });

      return true;
    }

    user.serverShadow = group.serverText;
    group.users.push(user);
    client.join(payload.roomId);
    this.server
      .to(client.id)
      .emit('joined', { text: user.serverShadow, title: group.title });
    return true;
  }

  // @SubscribeMessage('loadSeverShadow')
  // loadServerShadow(client: Socket, @MessageBody() payload: any) {
  //   for (let group of this.groups) {
  //     for (let user of group.users) {
  //       if (user.socketId === client.id) {
  //         group.serverText = payload.text;
  //         user.serverShadow = payload.text;
  //         return true;
  //       }
  //     }
  //   }
  // }

  @SubscribeMessage('syncServer')
  sync(client: Socket, @MessageBody() payload: any) {
    const group = this.groups.find(
      (currentGroup) => currentGroup.roomId === payload.roomId,
    );
    if (!group) {
      return false;
    }

    const userSyncing = group.users.find((user) => user.socketId == client.id);

    if (!userSyncing) {
      return false;
    }

    const patchesServer = this.synchronization.patch_make(
      group.serverText,
      payload.diffs,
    );
    const patchesUserSyncing = this.synchronization.patch_make(
      userSyncing.serverShadow,
      payload.diffs,
    );

    const [serverPatchedNote, validServer] = this.synchronization.patch_apply(
      patchesServer,
      group.serverText,
    );
    const [userPatchedNote, validNote] = this.synchronization.patch_apply(
      patchesUserSyncing,
      userSyncing.serverShadow,
    );

    group.serverText = serverPatchedNote;
    userSyncing.serverShadow = userPatchedNote;
    const diff = this.synchronization.diff_main(
      group.serverText,
      userSyncing.serverShadow,
    );
    this.server.to(client.id).emit('syncClient', { diffs: diff });
    userSyncing.serverShadow = group.serverText;

    for (let user of group.users) {
      if (user.socketId === userSyncing.socketId) {
        continue;
      }

      let userDiffs = this.synchronization.diff_main(
        group.serverText,
        user.serverShadow,
      );
      this.server.to(user.socketId).emit('syncClient', { diffs: userDiffs });
      user.serverShadow = group.serverText;
    }

    return true;
  }

  handleDisconnect(client: Socket) {
    this.groups.forEach((group) => {
      const user = group.users.filter((user) => user.socketId !== client.id);
    });
  }
}
