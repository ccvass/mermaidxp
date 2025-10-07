import React, { useEffect, useState } from 'react';

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  isActive: boolean;
  lastSeen: number;
}

interface CollaborativeCursorsProps {
  users: CollaborationUser[];
  containerRef: React.RefObject<HTMLElement | null>;
  zoom: number;
  pan: { x: number; y: number };
}

export const CollaborativeCursors: React.FC<CollaborativeCursorsProps> = ({ users, containerRef, zoom, pan }) => {
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; visible: boolean }>>({});

  // Update cursor positions
  useEffect(() => {
    const newCursors: Record<string, { x: number; y: number; visible: boolean }> = {};

    users.forEach((user) => {
      if (user.cursor && user.isActive) {
        // Transform cursor position based on current zoom and pan
        const transformedX = user.cursor.x * zoom + pan.x;
        const transformedY = user.cursor.y * zoom + pan.y;

        newCursors[user.id] = {
          x: transformedX,
          y: transformedY,
          visible: true,
        };
      }
    });

    setCursors(newCursors);
  }, [users, zoom, pan]);

  // Hide cursors after inactivity
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCursors((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((userId) => {
          const user = users.find((u) => u.id === userId);
          if (user && now - user.lastSeen > 5000) {
            // 5 seconds
            updated[userId] = { ...updated[userId], visible: false };
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [users]);

  if (!containerRef.current) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {users.map((user) => {
        const cursor = cursors[user.id];
        if (!cursor || !cursor.visible) return null;

        return (
          <div
            key={user.id}
            className="absolute transition-all duration-150 ease-out"
            style={{
              left: cursor.x,
              top: cursor.y,
              transform: 'translate(-2px, -2px)',
            }}
          >
            {/* Cursor Pointer */}
            <svg width="20" height="20" viewBox="0 0 20 20" className="drop-shadow-lg">
              <path d="M2 2L18 8L8 12L2 18L2 2Z" fill={user.color} stroke="white" strokeWidth="1" />
            </svg>

            {/* User Name Label */}
            <div
              className="absolute top-5 left-2 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CollaborativeCursors;
