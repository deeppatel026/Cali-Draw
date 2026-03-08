"use client";
import { useAuth } from "@/Context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoutes";
import { useParams } from "next/navigation";
import { Canvas } from "@/components/Canvas";

export default function CanvasPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { token, user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="h-screen w-screen">
        <Canvas roomId={roomId} token={token!} userId={user!.id} />
      </div>
    </ProtectedRoute>
  );
}