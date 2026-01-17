"use client"

// import Image, { type ImageProps } from "next/image";
// import { Button } from "@repo/ui/button";
// import styles from "./page.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Home() {

  const [roomId, setRoomId] = useState("")
  const router = useRouter()
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vh"
    }}>
      <div>
        <input type="text" placeholder="Room Id" onChange={(e) => {
          setRoomId(e.target.value)
        }}></input>

        <button onClick={(e) => {
          router.push(`/room/${roomId}`)
        }}>Join Room</button>
      </div>
    </div>
  );
}
