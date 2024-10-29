import { Message } from "@/model/users.model";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMsg?: boolean;
  messages?: Array<Message>;
  result?: string;
}
