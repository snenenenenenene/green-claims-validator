import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
  const session = await getSession({ req });

  if (!session || session.user.role !== "admin") {
    return new Response(JSON.stringify({ message: "Access denied" }), {
      status: 403,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const { id } = req.query;

  try {
    const { role } = await req.json();
    const user = await prisma.user.update({
      where: { id: id as string },
      data: { role },
    });
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error updating user role" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
