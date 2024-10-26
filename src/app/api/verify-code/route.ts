import dbConnect from "@/lib/db";
import User from "@/model/users.model";
import { NextResponse } from "next/server";
import { verifySchema } from "@/schemas/verify.schema";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const requestData = await req.json();

    const res = verifySchema.safeParse(requestData);

    if (!res.success) {
      const codeError = res.error.format().code?._errors || [];
      return NextResponse.json(
        {
          success: false,
          message: codeError.length > 0 ? codeError.join(", ") : "Invalid verification code",
        },
        { status: 400 }
      );
    }

    const { username, code } = res.data;
    const decodedUsername = decodeURIComponent(username);
    const user = await User.findOne({ username: decodedUsername });

    if (!user) {
      return createResponse(false, "User not found", 404);
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpires) > new Date();

    if (!isCodeNotExpired) {
      return createResponse(false, "Verification code expired", 400);
    }

    if (!isCodeValid) {
      return createResponse(false, "Invalid verification code", 400);
    }

    user.isVerified = true;
    await user.save();
    return createResponse(true, "User verified successfully", 200);
  } catch (error) {
    console.error("Verification error:", error);
    return createResponse(false, "Error verifying code", 500);
  }
}

function createResponse(success: boolean, message: string, status: number) {
  return NextResponse.json({ success, message }, { status });
}
