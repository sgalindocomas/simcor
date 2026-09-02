"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function MonitorConnectionBadge({ sessionId }: { sessionId: string }) {
    const [isConnected, setIsConnected] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!sessionId) return;

        const roomName = `room_${sessionId}`;

        // Subscribe to presence on the specified room
        const channel = supabase.channel(roomName, {
            config: {
                presence: {
                    key: 'instructor',
                },
            },
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState();

                // Determine if any connected client has device_type: 'monitor_display'
                let monitorFound = false;
                for (const presenceKey in newState) {
                    const clients = newState[presenceKey] as any[];
                    if (clients.some(client => client.device_type === 'monitor_display')) {
                        monitorFound = true;
                        break;
                    }
                }

                setIsConnected(monitorFound);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                if (newPresences.some((p: any) => p.device_type === 'monitor_display')) {
                    setIsConnected(true);
                }
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                // If a client left, we run a sync check implicitly by fetching state
                // but doing it synchronously here is tricky since state might not be updated yet.
                // The 'sync' event fires right after 'leave', so 'sync' will safely update the state.
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Instructor tracks their own presence, though not strictly required,
                    // it allows the student tablet to know the instructor is connected if needed later.
                    await channel.track({ device_type: 'instructor_dashboard' });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId, supabase]);

    if (isConnected) {
        return (
            <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-widest">
                    Monitor Conectado
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-widest">
                Monitor Desconectado
            </span>
        </div>
    );
}
