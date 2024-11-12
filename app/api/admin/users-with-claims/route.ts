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

    // Fetch users with their claims
    const users = await prisma.user.findMany({
      include: {
        claims: {
          select: {
            id: true,
            claim: true,
            status: true,
            progress: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: 'desc'
          }
        },
        _count: {
          select: {
            claims: true,
          }
        },
        sessions: {
          orderBy: {
            expires: 'desc'
          },
          take: 1,
        },
      },
      orderBy: {
        email: 'asc'
      },
    });

    // Transform the data for the frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      emailVerified: user.emailVerified,
      totalClaims: user._count.claims,
      lastActive: user.sessions[0]?.expires ?? user.emailVerified ?? null,
      claims: user.claims.map(claim => ({
        id: claim.id,
        claim: claim.claim,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
        status: claim.status,
        progress: claim.progress,
      })),
    }));

    return NextResponse.json({ 
      users: transformedUsers,
      totalUsers: users.length,
      totalClaims: users.reduce((acc, user) => acc + user._count.claims, 0),
      activeUsers: users.filter(user => 
        user.sessions[0]?.expires && 
        new Date(user.sessions[0].expires) > new Date()
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
        claims: {
          select: {
            id: true,
            claim: true,
            status: true,
            progress: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            claims: true,
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
      emailVerified: updatedUser.emailVerified,
      totalClaims: updatedUser._count.claims,
      claims: updatedUser.claims,
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