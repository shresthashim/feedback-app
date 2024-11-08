import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel from "@/model/users.model";
import dbConnect from "@/lib/db";
import { User } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const msgId = url.pathname.split("/").pop(); 

  await dbConnect();

  const session = await getServerSession(authOptions);
  const sessionUser: User = session?.user;

  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const updatedMsgs = await UserModel.updateOne(
      {
        _id: sessionUser._id,
      },
      {
        $pull: {
          messages: {
            _id: msgId,
          },
        },
      }
    );

    if (updatedMsgs.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Message not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete message",
      },
      {
        status: 500,
      }
    );
  }
}
