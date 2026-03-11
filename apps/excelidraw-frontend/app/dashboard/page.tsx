"use client";
import { useAuth } from "@/Context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoutes";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Room {
  id: number;
  slug: string;
  name: string;
  created_date: string;
}

const HTTP_URL = process.env.NEXT_PUBLIC_HTTP_BACKEND_URL || "http://localhost:3001";

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchRooms = useCallback(async () => {
    const res = await fetch(`${HTTP_URL}/api/v1/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setRooms(data.rooms);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchRooms();
  }, [token, fetchRooms]);

  const createRoom = async () => {
    if (!newRoomName.trim()) return;
    setIsCreating(true);
    setError("");
    try {
      const res = await fetch(`${HTTP_URL}/api/v1/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newRoomName }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewRoomName("");
        router.push(`/canvas/${data.room.id}`);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to create room");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950 text-white">
        <header className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Your Whiteboards</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{user?.email}</span>
            <button
              onClick={logout}
              className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex gap-3 mb-2">
            <input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="New whiteboard name..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === "Enter" && createRoom()}
            />
            <button
              onClick={createRoom}
              disabled={isCreating}
              className="px-6 py-2.5 bg-blue-600 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm mb-6">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => router.push(`/canvas/${room.id}`)}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-left hover:border-blue-500/50 hover:bg-gray-900/80 transition group"
              >
                <h3 className="font-medium text-lg mb-2 group-hover:text-blue-400 transition">
                  {room.name}
                </h3>
                <p className="text-gray-500 text-sm">
                  Created {new Date(room.created_date).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>

          {rooms.length === 0 && (
            <div className="text-center text-gray-500 py-16">
              <p className="text-lg mb-2">No whiteboards yet</p>
              <p className="text-sm">Create your first whiteboard above to get started</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
