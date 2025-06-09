export class ChatRoomDto {
  constructor(
    public userId: string,
    public name: string,
    public isGroup: boolean = false,
    public createdAt?: string,
    public id?: string
  ) {}
}
