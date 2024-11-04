// app/api/claims/[claimId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { ClaimStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface UpdateClaimRequest {
  status?: ClaimStatus;
  progress?: number;
  currentStep?: string;
  results?: any;
}

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
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
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
    // Verify claim ownership
    const existingClaim = await prisma.claim.findFirst({
      where: {
        id: params.claimId,
        userId: session.user.id,
      }
    });

    if (!existingClaim) {
      return NextResponse.json(
        { error: "Claim not found or access denied" },
        { status: 404 }
      );
    }

    const { status, progress, currentStep, results }: UpdateClaimRequest = await request.json();

    // Validate status if provided
    if (status && !Object.values(ClaimStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Validate progress if provided
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return NextResponse.json(
        { error: "Progress must be between 0 and 100" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Prisma.ClaimUpdateInput = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;
    if (currentStep) updateData.currentStep = currentStep;
    if (results) updateData.results = results;

    // Handle status changes
    if (status === ClaimStatus.COMPLETED) {
      updateData.lastAnalyzed = new Date();
    }

    const claim = await prisma.claim.update({
      where: {
        id: params.claimId,
      },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Revalidate cache for claims pages
    revalidatePath('/claims');
    revalidatePath(`/claims/${params.claimId}`);

    return NextResponse.json({ claim });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: "Failed to update claim" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    // Verify claim ownership
    const existingClaim = await prisma.claim.findFirst({
      where: {
        id: params.claimId,
        userId: session.user.id,
      }
    });

    if (!existingClaim) {
      return NextResponse.json(
        { error: "Claim not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.claim.delete({
      where: {
        id: params.claimId,
      }
    });

    // Revalidate cache
    revalidatePath('/claims');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: "Failed to delete claim" },
      { status: 500 }
    );
  }
}