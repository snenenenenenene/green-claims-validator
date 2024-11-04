// app/api/claims/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ClaimStatus } from "@prisma/client";

interface CreateClaimRequest {
  claim: string;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const { claim }: CreateClaimRequest = await request.json();
    
    if (!claim || typeof claim !== 'string') {
      return NextResponse.json(
        { error: "Invalid claim data" },
        { status: 400 }
      );
    }

    // Check if user has enough credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true }
    });

    if (!user || user.credits < 1) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 403 }
      );
    }

    // Create claim and deduct credit in a transaction
    const newClaim = await prisma.$transaction(async (tx) => {
      // Deduct credit
      await tx.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: 1 } }
      });

      // Create claim
      return await tx.claim.create({
        data: {
          claim,
          userId: session.user.id,
          status: ClaimStatus.NOT_STARTED,
          progress: 0,
        },
      });
    });

    return NextResponse.json({ success: true, claim: newClaim });
  } catch (error) {
    console.error('Failed to create claim:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "Duplicate claim" },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to create claim" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Get URL parameters
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as ClaimStatus | null;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    // Build where clause
    const where: Prisma.ClaimWhereInput = {
      userId: session.user.id,
      ...(status && { status })
    };

    // Get total count for pagination
    const total = await prisma.claim.count({ where });

    // Get claims with pagination
    const claims = await prisma.claim.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      claims,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}