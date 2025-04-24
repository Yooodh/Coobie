export class ChatRoom {
  constructor(
    public id?: string,
    public name?: string,
    public createdAt?: Date,
    public isGroup: boolean = false
  ) {}
}
