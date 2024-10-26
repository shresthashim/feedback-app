import dbConnect from "@/lib/db";
import User from "@/model/users.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { NextRequest, NextResponse } from "next/server";

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

function generateVerifyCode(): { code: string; expires: Date } {
  return {
    code: Math.floor(100000 + Math.random() * 900000).toString(),
    expires: new Date(Date.now() + 3600000), // 1 hour expiration
  };
}

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { username, email, password } = await req.json();

    // Check if the username is already taken by a verified user
    const existingVerifiedUser = await User.findOne({ username, isVerified: true });
    if (existingVerifiedUser) {
      return NextResponse.json({ success: false, message: "Username already taken!" }, { status: 400 });
    }

    // Check if there's an existing user by email
    const existingUserByEmail = await User.findOne({ email });
    const { code: verifyCode, expires: verifyCodeExpires } = generateVerifyCode();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json({ success: false, message: "Email already taken!" }, { status: 400 });
      }
      // Update unverified existing user
      existingUserByEmail.password = await hashPassword(password);
      existingUserByEmail.verifyCode = verifyCode;
      existingUserByEmail.verifyCodeExpires = verifyCodeExpires;
      existingUserByEmail.isVerified = false;
      await existingUserByEmail.save();
    } else {
      // Create new user if no existing user by email
      const newUser = new User({
        username,
        email,
        password: await hashPassword(password),
        verifyCode,
        verifyCodeExpires,
        isAcceptingMsg: true,
        messages: [],
      });
      await newUser.save();
    }

    // Send verification email
    const emailRes = await sendVerificationEmail(email, username, verifyCode);
    if (!emailRes.success) {
      return NextResponse.json({ success: false, message: "Error sending verification email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error in sign-up:", error);
    return NextResponse.json({ success: false, message: "Error registering user" }, { status: 500 });
  }
}
