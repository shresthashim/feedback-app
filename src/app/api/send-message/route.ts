import dbConnect from "@/lib/db";
import UserModel from "@/model/users.model";
import { Message } from "@/model/users.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();

  const { username, content } = await req.json();

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    if (!user.isAcceptingMsg) {
      return NextResponse.json(
        {
          success: false,
          message: "User is not accepting messages",
        },
        {
          status: 403,
        }
      );
    }

    const newMsg = { content, createdAt: new Date() };

    user.messages.push(newMsg as Message);
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
        newMsg,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message",
      },
      {
        status: 500,
      }
    );
  }
}
