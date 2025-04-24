export class Messages {
  constructor(
    public senderId: string,
    public chatId: string,
    public content: string,
    public messageType?: string,
    public createdAt?: Date,
    public fileUrl?: string,
    public id?: string
  ) {}
}
