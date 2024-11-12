// app/api/claims/[claimId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(
  request: Request,
  { params }: { params: { claimId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claim = await prisma.claim.findUnique({
      where: {
        id: params.claimId,
      },
      include: {
        documents: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Transform the documents to exclude the actual file data
    const transformedClaim = {
      ...claim,
      documents: claim.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        reviewNote: doc.reviewNote,
        reviewedBy: doc.reviewedBy,
        uploadedBy: doc.uploadedBy,
      })),
    };

    return NextResponse.json({ claim: transformedClaim });
  } catch (error) {
    console.error("Error fetching claim:", error);
    return NextResponse.json(
      { error: "Failed to fetch claim" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { claimId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, progress } = body;

    const updatedClaim = await prisma.claim.update({
      where: {
        id: params.claimId,
      },
      data: {
        status,
        progress,
      },
      include: {
        documents: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    // Transform the documents to exclude the actual file data
    const transformedClaim = {
      ...updatedClaim,
      documents: updatedClaim.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        reviewNote: doc.reviewNote,
        reviewedBy: doc.reviewedBy,
        uploadedBy: doc.uploadedBy,
      })),
    };

    return NextResponse.json({ claim: transformedClaim });
  } catch (error) {
    console.error("Error updating claim:", error);
    return NextResponse.json(
      { error: "Failed to update claim" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { claimId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { progress } = body;

    const updatedClaim = await prisma.claim.update({
      where: {
        id: params.claimId,
      },
      data: {
        progress,
      },
      include: {
        documents: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    // Transform the documents to exclude the actual file data
    const transformedClaim = {
      ...updatedClaim,
      documents: updatedClaim.documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        reviewNote: doc.reviewNote,
        reviewedBy: doc.reviewedBy,
        uploadedBy: doc.uploadedBy,
      })),
    };

    return NextResponse.json({ claim: transformedClaim });
  } catch (error) {
    console.error("Error updating claim progress:", error);
    return NextResponse.json(
      { error: "Failed to update claim progress" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { claimId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user owns the claim or is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    const claim = await prisma.claim.findUnique({
      where: { id: params.claimId },
      select: { userId: true },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (user?.role !== "ADMIN" && claim.userId !== user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete the claim and all associated documents (cascade delete)
    await prisma.claim.delete({
      where: {
        id: params.claimId,
      },
    });

    return NextResponse.json({ message: "Claim deleted successfully" });
  } catch (error) {
    console.error("Error deleting claim:", error);
    return NextResponse.json(
      { error: "Failed to delete claim" },
      { status: 500 }
    );
  }
}