export class ChatMessageDto {
  constructor(
    public senderId: string,
    public chatRoomId: string,
    public content: string,
    public messageType: string,
    public createdAt: Date,
    public fileUrl?: string,
    public id?: string
  ) {}
}
