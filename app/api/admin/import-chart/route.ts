// app/api/admin/import-chart/route.ts
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();

    const savedChart = await prisma.gcvChart.create({
      data: {
        content: JSON.stringify(content),
        name:
          content.type === "single" ? content.flow.name : "Complete Chart Set",
        version: 1,
      },
    });

    return NextResponse.json({
      success: true,
      chartId: savedChart.id,
    });
  } catch (error) {
    console.error("Error saving chart:", error);
    return NextResponse.json(
      { error: "Failed to save chart" },
      { status: 500 },
    );
  }
}
