"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";

let socket: Socket | null = null;

export function useSocket() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isAuthenticated() || !accessToken || initialized.current) return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";

    socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected");
      initialized.current = true;
    });

    socket.on("notification", (data) => {
      addNotification(data);
    });

    socket.on("disconnect", () => {
      initialized.current = false;
    });

    return () => {
      socket?.disconnect();
      socket = null;
      initialized.current = false;
    };
  }, [accessToken, isAuthenticated]);

  const joinCourseRoom = (courseId: string) => {
    socket?.emit("join_course_room", { course_id: courseId });
  };

  const leaveCourseRoom = (courseId: string) => {
    socket?.emit("leave_course_room", { course_id: courseId });
  };

  const onEvent = (event: string, callback: (data: any) => void) => {
    socket?.on(event, callback);
    return () => socket?.off(event, callback);
  };

  return { joinCourseRoom, leaveCourseRoom, onEvent, socket };
}
