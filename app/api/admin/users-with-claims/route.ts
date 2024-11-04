// app/api/admin/users-with-claims/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET() {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (sessionUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch users with their claims and related data
    const users = await prisma.user.findMany({
      include: {
        claims: {
          include: {
            documents: {
              select: {
                id: true,
                name: true,
                type: true,
                size: true,
                url: true,
                status: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            _count: {
              select: {
                documents: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            claims: true,
          },
        },
        sessions: {
          orderBy: {
            lastActive: 'desc',
          },
          take: 1,
          select: {
            lastActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data for the frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
      totalClaims: user._count.claims,
      lastActive: user.sessions[0]?.lastActive ?? user.createdAt,
      claims: user.claims.map(claim => ({
        id: claim.id,
        claim: claim.claim,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
        status: claim.status,
        progress: claim.progress,
        result: claim.result,
        documents: claim.documents.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          size: doc.size,
          url: doc.url,
          status: doc.status,
          uploadedAt: doc.createdAt,
        })),
      })),
    }));

    return NextResponse.json({ 
      users: transformedUsers,
      totalUsers: users.length,
      totalClaims: users.reduce((acc, user) => acc + user._count.claims, 0),
      activeUsers: users.filter(user => 
        user.sessions[0]?.lastActive && 
        new Date(user.sessions[0].lastActive) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length,
    });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// Handle role updates
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (sessionUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, role } = await request.json();

    // Prevent admins from demoting themselves
    if (userId === sessionUser.id && role !== "ADMIN") {
      return NextResponse.json(
        { error: "Cannot demote yourself from admin" },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      include: {
        claims: true,
        _count: {
          select: {
            claims: true,
          },
        },
        sessions: {
          orderBy: {
            lastActive: 'desc',
          },
          take: 1,
          select: {
            lastActive: true,
          },
        },
      },
    });

    // Transform the updated user data
    const transformedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      image: updatedUser.image,
      createdAt: updatedUser.createdAt,
      totalClaims: updatedUser._count.claims,
      lastActive: updatedUser.sessions[0]?.lastActive ?? updatedUser.createdAt,
      claims: updatedUser.claims.map(claim => ({
        id: claim.id,
        claim: claim.claim,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
        status: claim.status,
        progress: claim.progress,
        result: claim.result,
      })),
    };

    return NextResponse.json({ user: transformedUser });

  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// Add user documents route
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (sessionUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const claimId = formData.get('claimId') as string;

    // Here you would handle file upload to your storage service
    // const uploadedFile = await uploadToStorage(file);

    const document = await prisma.document.create({
      data: {
        name: file.name,
        type: file.type,
        size: file.size,
        url: 'URL_FROM_STORAGE',
        status: 'PENDING',
        userId,
        claimId,
      },
    });

    return NextResponse.json({ document });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}