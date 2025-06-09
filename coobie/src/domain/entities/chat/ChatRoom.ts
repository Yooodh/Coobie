export class ChatRoom {
  constructor(
    public userId: string,
    public id?: string,
    public name?: string,
    public createdAt?: Date,
    public isGroup: boolean = false
  ) {}
}
