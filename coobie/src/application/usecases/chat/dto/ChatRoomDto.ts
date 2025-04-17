export class ChatRoomDto {
  constructor(
    public isGroup: boolean = false,
    public name: string,
    public createdAt: string,
    public id?: string
  ) {}
}
