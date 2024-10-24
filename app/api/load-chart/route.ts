import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ statusCode: 401, message: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching chart instance for user:", session.user.id);
    const chartInstance = await prisma.chartInstance.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    console.log("Loaded chart instance:", chartInstance);

    if (!chartInstance) {
      console.log("No saved chart found for user:", session.user.id);
      return NextResponse.json({ statusCode: 404, message: "No saved chart found" }, { status: 404 });
    }

    console.log("Successfully retrieved chart instance");
    return NextResponse.json({ 
      success: true, 
      content: chartInstance.content,
    });

  } catch (err: any) {
    console.error("Error in GET route:", err);
    return NextResponse.json({ statusCode: 500, message: err.message }, { status: 500 });
  }
}