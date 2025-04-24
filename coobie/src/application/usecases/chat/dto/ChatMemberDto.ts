export class ChatMemberDto {
  constructor(
    public userId: string,
    public chatRoomId: string,
    public id?: string
  ) {}
}
