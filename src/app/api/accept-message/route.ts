import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/users.model";
import dbConnect from "@/lib/db";
import { User } from "next-auth";
import { NextResponse } from "next/server";
import { acceptMessagesSchema } from "@/schemas/accept-messages.schema";

export async function POST(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user;

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

  const userId = user._id;
  const { acceptMessages } = await req.json();

  const res = acceptMessagesSchema.safeParse({ acceptMessages });

  if (!res.success) {
    const errors = res.error.format().acceptMessages?._errors || [];
    return NextResponse.json(
      {
        success: false,
        message: errors.length > 0 ? errors.join(", ") : "Invalid input",
      },
      { status: 400 }
    );
  }

  try {
    const { acceptMessages } = res.data;
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMsg: acceptMessages,
      },
      {
        new: true,
      }
    );
    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update message accepting status",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message accepting status updated successfully",
        updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user;

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

  const userId = user._id;

  try {
    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
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

    return NextResponse.json(
      {
        success: true,
        message: "User found",
        isAcceptingMsg: foundUser.isAcceptingMsg,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred",
      },
      {
        status: 500,
      }
    );
  }
}
