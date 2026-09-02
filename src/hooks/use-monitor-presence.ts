import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function useMonitorPresence(sessionId: string | undefined) {
    const [isMonitorConnected, setIsMonitorConnected] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!sessionId) {
            setIsMonitorConnected(false);
            return;
        }

        const roomName = `monitor_state_${sessionId}`;

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
                console.log("[Presence] Sync event received. Current state:", newState);

                let monitorFound = false;
                for (const presenceKey in newState) {
                    const clients = newState[presenceKey] as any[];
                    console.log(`[Presence] Clients for key ${presenceKey}:`, clients);
                    if (clients.some(client => client.device_type === 'monitor_display')) {
                        monitorFound = true;
                        break;
                    }
                }

                console.log("[Presence] Monitor found in sync?", monitorFound);
                setIsMonitorConnected(monitorFound);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                console.log(`[Presence] Join event. Key: ${key}, Presences:`, newPresences);
                if (newPresences.some((p: any) => p.device_type === 'monitor_display')) {
                    console.log("[Presence] Monitor just joined!");
                    setIsMonitorConnected(true);
                }
            })
            .on('presence', { event: 'leave' }, async ({ key, leftPresences }: { key: string, leftPresences: any[] }) => {
                if (leftPresences.some((p: any) => p.device_type === 'monitor_display')) {
                    console.log("[Presence] Monitor just left!");
                    setIsMonitorConnected(false);
                }
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ device_type: 'instructor_dashboard' });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId, supabase]);

    return isMonitorConnected;
}
