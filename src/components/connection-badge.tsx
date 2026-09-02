"use client";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/i18n-context";

export function ConnectionBadge({ isConnected, isActive = true }: { isConnected: boolean, isActive?: boolean }) {
    const { t } = useI18n();

    if (!isActive) return null;

    if (isConnected) {
        return (
            <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <Badge variant="outline" className="border-green-500/50 text-green-600 dark:text-green-400">
                    {t('dashboardContent.monitorConnected')}
                </Badge>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <Badge variant="destructive">
                {t('dashboardContent.waitingMonitor')}
            </Badge>
        </div>
    );
}
