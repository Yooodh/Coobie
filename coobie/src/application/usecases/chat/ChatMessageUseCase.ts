import { ChatMessagesRepository } from "@/domain/repositories/chat/ChatMessagesRepository";

import { Messages } from "@/domain/entities/chat/Messages";
import { ChatMessageDto } from "./dto/ChatMessageDto";

export class ChatMessageUseCase {
  constructor(private chatMessagesRepository: ChatMessagesRepository) {
    this.chatMessagesRepository = chatMessagesRepository;
  }

  async sendMessage(chatMessages: ChatMessageDto): Promise<Messages> {
    console.log("디버깅3");
    let chatMessage: Messages;

    // if (chatMessages.messageType === "file") {
    chatMessage = new Messages(
      chatMessages.senderId, // senderId
      chatMessages.chatRoomId, // chatId
      chatMessages.content,
      chatMessages.messageType,
      chatMessages.createdAt,
      chatMessages.fileUrl,
      chatMessages.id
    );
    // } else if (chatMessages.messageType === "text") {
    // chatMessage = new Messages(
    //   chatMessages.senderId,
    //   chatMessages.chatRoomId,
    //   chatMessages.content
    // );
    // } else {
    //   throw new Error("Unsupported message type");
    // }
    console.log("디버깅4");
    console.log("chat : ", chatMessage);
    const savedMessage = await this.chatMessagesRepository.save(chatMessage);
    console.log("디버깅5");
    return savedMessage;
  }
  listenForNewMessages(callback: (message: Messages) => void): void {
    this.chatMessagesRepository.listenForNewMessages(callback);
  }
}
