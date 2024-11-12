// app/api/documents/[id]/review/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../../auth/[...nextauth]/options";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status, note } = await request.json();

    // Update document status
    const updatedDocument = await prisma.document.update({
      where: { id: params.id },
      data: {
        status,
        reviewNote: note,
        reviewerId: user.id,
        updatedAt: new Date(),
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        reviewedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      document: {
        id: updatedDocument.id,
        name: updatedDocument.name,
        type: updatedDocument.type,
        size: updatedDocument.size,
        status: updatedDocument.status,
        createdAt: updatedDocument.createdAt,
        updatedAt: updatedDocument.updatedAt,
        reviewNote: updatedDocument.reviewNote,
        reviewedBy: updatedDocument.reviewedBy,
        uploadedBy: updatedDocument.uploadedBy,
      }
    });

  } catch (error) {
    console.error('Document review error:', error);
    return NextResponse.json(
      { error: "Failed to review document" },
      { status: 500 }
    );
  }
}