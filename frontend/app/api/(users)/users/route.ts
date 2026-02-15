import { connect } from "@/lib/db";
import User from "@/lib/modals/users";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

const ObjectId = require("mongoose").Types.ObjectId;
export const GET = async () => {
  try {
    await connect();
    const users = await User.find();
    return new NextResponse(JSON.stringify(users), { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new NextResponse("Database Error", { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();

    await connect();
    const newUser = new User(body);
    await newUser.save();
    // const user = await User.create({email, username, password});

    return new NextResponse(
      JSON.stringify({ message: "User created successfully", user: newUser }),
      { status: 201 }
    );
  } catch (error: any) {
    console.log(error);
    return new NextResponse("Database Error", { status: 500 });
  }
};

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { userId, newUsername } = body;
    await connect();
    if (!userId || !newUsername) {
      return new NextResponse(
        JSON.stringify({
          message: "Id or username not found",
        }),
        { status: 400 }
      );
    }
    if (!Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({
          message: "Invalid user ID format",
        }),
        { status: 400 }
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { username: newUsername },
      { new: true }
    );

    if (!updatedUser) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    return new NextResponse(
      JSON.stringify({
        message: "User updated successfully",
        user: updatedUser,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log();
    return new NextResponse("Database Error", { status: 500 });
  }
};
