// app/api/admin/claims/route.ts
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
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

    // Fetch all claims with their documents and users
    const claims = await prisma.claim.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
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
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Transform the data to exclude sensitive information
    const transformedClaims = claims.map((claim) => ({
      id: claim.id,
      claim: claim.claim,
      status: claim.status,
      progress: claim.progress,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
      user: claim.user,
      documents: claim.documents.map((doc) => ({
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
    }));

    return NextResponse.json({ claims: transformedClaims });
  } catch (error) {
    console.error("Admin claims fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 },
    );
  }
}
