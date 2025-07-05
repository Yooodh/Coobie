export class ChatMessageDto {
  senderId: string;
  chatRoomId: string;
  content: string;
  messageType: string;
  createdAt: Date;
  fileUrl: string;
  id?: string;

  constructor(
    senderId: string,
    chatRoomId: string,
    content: string,
    messageType: string,
    createdAt: Date,
    fileUrl: string = ""
  ) {
    this.senderId = senderId;
    this.chatRoomId = chatRoomId;
    this.content = content; // Ensure content is properly assigned
    this.messageType = messageType;
    this.createdAt = createdAt;
    this.fileUrl = fileUrl;
  }
}
