import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const users = await prisma.user.findMany();
    return new Response(JSON.stringify({ success: true, users }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email, name, role } = body;

  try {
    const newUser = await prisma.user.create({
      data: { email, name, role },
    });
    return new Response(JSON.stringify({ success: true, user: newUser }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { userId, role } = body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    return new Response(JSON.stringify({ success: true, user: updatedUser }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function DELETE(request: Request) {
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
    await prisma.user.delete({
      where: { id: String(userId) },
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
