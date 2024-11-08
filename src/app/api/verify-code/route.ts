import dbConnect from "@/lib/db";
import User from "@/model/users.model";
import { NextResponse } from "next/server";
import { verifySchema } from "@/schemas/verify.schema";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, code } = await req.json();

    const res = verifySchema.safeParse({ username, code });

    if (!res.success) {
      const codeError = res.error.format().code?._errors || [];
      return NextResponse.json(
        {
          success: false,
          message: codeError?.length > 0 ? codeError.join(", ") : "Invalid verification code",
        },
        {
          status: 400,
        }
      );
    }

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
    return NextResponse.json(
      {
        success: false,
        message: "Error verifying code",
      },
      {
        status: 500,
      }
    );
  }
}
