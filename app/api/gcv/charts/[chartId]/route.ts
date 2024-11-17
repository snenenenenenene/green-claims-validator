// app/api/gcv/charts/[chartId]/route.ts
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/options";

export async function DELETE(
  request: Request,
  { params }: { params: { chartId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.role === "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chartId } = params;

    // Check if chart exists
    const chart = await prisma.gcvChart.findUnique({
      where: { id: chartId },
    });

    if (!chart) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 });
    }

    // Delete the chart
    await prisma.gcvChart.delete({
      where: { id: chartId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chart:", error);
    return NextResponse.json(
      { error: "Failed to delete chart" },
      { status: 500 },
    );
  }
}
