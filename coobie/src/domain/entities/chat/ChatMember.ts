export class ChatMember {
  constructor(
    public userId: string,
    public chatRoomId: string,
    public id?: string
  ) {}
}
