// app/api/gcv/manage-chart/route.ts
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chartId, action } = await request.json();

    if (!chartId) {
      return NextResponse.json(
        { error: "Chart ID is required" },
        { status: 400 },
      );
    }

    if (action === "activate") {
      // First deactivate all charts
      await prisma.gcvChart.updateMany({
        where: {
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Then activate the selected chart
      await prisma.gcvChart.update({
        where: {
          id: chartId,
        },
        data: {
          isActive: true,
        },
      });
    } else if (action === "deactivate") {
      // Deactivate specific chart
      await prisma.gcvChart.update({
        where: {
          id: chartId,
        },
        data: {
          isActive: false,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error managing chart:", error);
    return NextResponse.json(
      { error: "Failed to manage chart" },
      { status: 500 },
    );
  }
}
