// pages/api/claim.ts
import prisma from "@/lib/prisma"; // Assuming you are using Prisma

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, claim } = body;

  try {
    await prisma.claim.create({
      data: {
        userId,
        claim,
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, message: "User ID is required" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const claim = await prisma.claim.findFirst({
      where: { userId: String(userId) },
    });

    return new Response(
      JSON.stringify({ success: true, claim: claim?.claim || null }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
