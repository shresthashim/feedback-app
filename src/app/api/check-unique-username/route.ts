import dbConnect from "@/lib/db";
import { z } from "zod";
import User from "@/model/users.model";
import { usernameSchema } from "@/schemas/sign-up.schema";
import { NextRequest, NextResponse } from "next/server";

const usernameQuerySchema = z.object({
  username: usernameSchema,
});

export async function GET(req: Request) {
  if (req.method !== "GET") {
    return NextResponse.json({ success: false, message: "Only GET requests are allowed" }, { status: 405 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const queryParam = {
      username: searchParams.get("username"),
    };

    const res = usernameQuerySchema.safeParse(queryParam);

    console.log(res);

    if (!res.success) {
      const usernameerror = res.error.format().username?._errors || [];
      return NextResponse.json(
        { success: false, message: usernameerror?.length > 0 ? usernameerror.join(", ") : "Invalid query parameter" },
        { status: 400 }
      );
    }

    const { username } = res.data;

    const existingVerifiedUser = await User.findOne({ username, isVerified: true });

    if (existingVerifiedUser) {
      return NextResponse.json({ success: false, message: "Username already taken!" }, { status: 400 });
    } else {
      return NextResponse.json({ success: true, message: "Username is available" });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "An error occurred" }, { status: 500 });
  }
}
