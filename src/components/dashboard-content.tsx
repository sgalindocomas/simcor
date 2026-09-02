"use client";

import { useMonitorPresence } from "@/hooks/use-monitor-presence";
import { ExecutionPanel } from "@/components/execution-panel";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/i18n-context";
import { ConnectionBadge } from "@/components/connection-badge";
import { MonitorConnectionCard } from "@/components/monitor-connection-card";

export function DashboardContent({ activeSessionId, instructorId }: { activeSessionId?: string, instructorId: string }) {
    const isMonitorConnected = useMonitorPresence(activeSessionId);
    const { t } = useI18n();

    return (
        <div className="w-full">
            {/* Header Badge (Local to this component so it syncs with layout state) */}
            <div className="flex items-end justify-between mb-8">
                <div className="flex items-center gap-4">
                    <ConnectionBadge isConnected={isMonitorConnected} isActive={!!activeSessionId} />
                </div>
            </div>

            {/* Main Content Layout */}
            {activeSessionId && isMonitorConnected ? (
                /* Layout when ACTIVE session AND MONITOR is CONNECTED */
                <ExecutionPanel sessionId={activeSessionId} instructorId={instructorId} />
            ) : (
                /* Layout when NO session OR MONITOR is DISCONNECTED */
                <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-6 mt-4">
                    <div className="w-full">
                        <MonitorConnectionCard activeSessionId={activeSessionId} />
                    </div>

                    {/* Informative placeholder */}
                    <Card className="w-full border-dashed shadow-sm">
                        <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-4">
                            <h2 className="text-xl font-semibold opacity-70">
                                {activeSessionId ? t('dashboardContent.monitorPendingTitle') : t('dashboardContent.executionControlTitle')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {activeSessionId
                                    ? t('dashboardContent.monitorPendingDesc')
                                    : t('dashboardContent.executionControlDesc')
                                }
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
