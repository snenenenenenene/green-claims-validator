// app/api/documents/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const claimId = formData.get('claimId') as string;

    if (!file || !claimId) {
      return NextResponse.json(
        { error: "File and claim ID are required" },
        { status: 400 }
      );
    }

    // File size validation (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const document = await prisma.document.create({
      data: {
        name: file.name,
        type: file.type,
        size: file.size,
        data: buffer,
        userId: user.id,
        claimId,
      },
    });

    return NextResponse.json({
      id: document.id,
      name: document.name,
      type: document.type,
      size: document.size,
      status: document.status,
      createdAt: document.createdAt,
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

// app/api/documents/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: { user: true }
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Check if user has access to this document
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (user?.role !== "ADMIN" && document.userId !== user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Return file with appropriate headers
    return new NextResponse(document.data, {
      headers: {
        'Content-Type': document.type,
        'Content-Disposition': `inline; filename="${document.name}"`,
      },
    });

  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { status, reviewNote } = await request.json();

    const document = await prisma.document.update({
      where: { id: params.id },
      data: {
        status,
        reviewNote,
        reviewerId: user.id,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(document);

  } catch (error) {
    console.error('Document update error:', error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}