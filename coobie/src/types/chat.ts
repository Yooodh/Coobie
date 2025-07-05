// Define a type for dummy messages
export type DummyMessage = {
  id: string;
  chatRoomId: string;
  content: string;
  createdAt: string; // ISO string format
  fileUrl: string | null;
  messageType: "text" | "file";
  senderId: string;
};
