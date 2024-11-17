// app/api/gcv/charts/route.ts
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role === "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const charts = await prisma.gcvChart.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ charts });
  } catch (error) {
    console.error("Error fetching charts:", error);
    return NextResponse.json(
      { error: "Failed to fetch charts" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role === "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();

    // Ensure new imports are inactive
    const newChart = await prisma.gcvChart.create({
      data: {
        name:
          content.type === "single" ? content.flow.name : "Complete Chart Set",
        content: JSON.stringify(content),
        isActive: false, // Always create as inactive
      },
    });

    return NextResponse.json({
      success: true,
      chart: newChart,
    });
  } catch (error) {
    console.error("Error creating chart:", error);
    return NextResponse.json(
      { error: "Failed to create chart" },
      { status: 500 },
    );
  }
}
