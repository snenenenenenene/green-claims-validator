// app/api/claims/[claimId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { claimId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const claim = await prisma.claim.findFirst({
      where: {
        id: params.claimId,
        userId: (session.user as any).id,
      },
    });

    if (!claim) {
      return NextResponse.json(
        { error: "Claim not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ claim });
  } catch (error) {
    console.error('Database error:', error);
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
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const { status, progress } = await request.json();

    const claim = await prisma.claim.update({
      where: {
        id: params.claimId,
      },
      data: {
        status,
        progress,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ claim });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: "Failed to update claim" },
      { status: 500 }
    );
  }
}