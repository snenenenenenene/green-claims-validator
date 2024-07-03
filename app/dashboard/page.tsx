"use client";
import { useEffect, useState, useCallback } from "react";
import { SessionProvider, getSession, useSession } from "next-auth/react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { Session } from "next-auth";

const initialNodes = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

export default function Dashboard() {
  const [session, setSession] = useState<
    (Session & { user: { role: string } }) | null
  >(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData as any);
    };
    fetchSession();
  }, []);

  const saveSchema = async () => {
    console.log("Saving schema...");
  };

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  if (session && session?.user?.role === "admin") {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex h-20 w-full"></div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        >
          <Controls />
          <MiniMap />
          {/* @ts-ignore */}
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
        <section className="flex w-full pt-4" id="buttons">
          <button
            className="ml-auto rounded-full border border-yellow bg-yellow p-1.5 px-8 py-4 text-black transition-all hover:border-yellow-hover hover:bg-yellow-hover"
            onClick={() => saveSchema()}
          >
            Save
          </button>
        </section>
      </div>
    );
  }
  return <p>You are not authorized to view this page!</p>;
}
