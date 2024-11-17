// app/api/gcv/active-chart/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const activeChart = await prisma.gcvChart.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!activeChart) {
      return NextResponse.json(
        { error: "No active chart found" },
        { status: 404 },
      );
    }

    return NextResponse.json(activeChart);
  } catch (error) {
    console.error("Error fetching active chart:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart" },
      { status: 500 },
    );
  }
}
