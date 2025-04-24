export class Messages {
  constructor(
    public id: string,
    public chatId: string,
    public senderId: string,
    public content: string,
    public messageType: string,
    public createdAt: Date
  ) {}
}
