import dbConnect from "@/lib/db";
import User from "@/model/users.model";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, code } = await req.json();

    const decodedUsername = decodeURIComponent(username);

    const user = await User.findOne({ username: decodedUsername });

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

    const isCodeValid = user.verifyCode === code;

    const isCodeNotExpired = new Date(user.verifyCodeExpires) > new Date();
    if (isCodeNotExpired && isCodeValid) {
      user.isVerified = true;
      await user.save();

      return NextResponse.json(
        {
          success: true,
          message: "User verified successfully",
        },
        {
          status: 200,
        }
      );
    } else if (!isCodeNotExpired) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification code expired",
        },
        {
          status: 400,
        }
      );
    } else if (!isCodeValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification code",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    return {
      status: 500,
      body: {
        message: "Error verifying code",
      },
    };
  }
}
