"use client";

import { useUnreadCount } from "@/hooks/useUnreadCount";

export function LiveUnreadCount({
  userId,
  initialCount,
}: {
  userId: string;
  initialCount: number;
}) {
  const count = useUnreadCount(userId, initialCount);
  return <>{count}</>;
}
