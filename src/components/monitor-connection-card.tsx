"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { useI18n } from "@/i18n/i18n-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function MonitorConnectionCard({ activeSessionId }: { activeSessionId?: string }) {
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(activeSessionId || null);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();
    const { t } = useI18n();

    // Sync with prop if it changes
    useEffect(() => {
        if (activeSessionId) {
            setSessionId(activeSessionId);
        }
    }, [activeSessionId]);

    const handleCreateSession = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();

            if (userError || !userData.user) {
                throw new Error("You must be logged in to create a session");
            }

            const { error: deleteError } = await supabase
                .from("sessions")
                .delete()
                .eq("instructor_id", userData.user.id);

            if (deleteError) {
                throw deleteError;
            }

            const { data, error: insertError } = await supabase
                .from("sessions")
                .insert([{
                    instructor_id: userData.user.id,
                    scenario_name: "Nueva sesión",
                }])
                .select("id")
                .single();

            if (insertError) {
                throw insertError;
            }

            if (data) {
                setSessionId(data.id);

                const { error: monitorStateError } = await supabase
                    .from("monitor_state")
                    .insert([{
                        session_id: data.id,
                        heart_rate: 80,
                        spo2: 98,
                        respiratory_rate: 16,
                        systolic_bp: 120,
                        diastolic_bp: 80,
                        etco2: 40,
                        ecg_rhythm: "no_signal",
                        is_ecg_connected: false,
                        is_sp02_connected: false,
                        is_bp_connected: false,
                        temperature: 36.5,
                        is_capno_connected: false,
                        is_temp_connected: false
                    }]);

                if (monitorStateError) {
                    console.error("Failed to initialize monitor state:", monitorStateError);
                    throw new Error("Failed to initialize monitor state");
                }
            }
        } catch (err: any) {
            console.error("Error creating session:", err);
            setError(err.message || "Failed to create session");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-6 mt-4 w-full">
            {error && (
                <div className="w-full rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center">
                    {error}
                </div>
            )}

            {!sessionId ? (
                <Card className="w-full border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-center text-xl">{t('connectMonitor.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 flex flex-col items-center justify-center text-center space-y-6">
                        <p className="text-sm text-muted-foreground">
                            {t('connectMonitor.description')}
                        </p>
                        <Button
                            onClick={handleCreateSession}
                            disabled={loading}
                            className="w-full text-base font-semibold py-6 shadow-sm"
                        >
                            {loading ? t('connectMonitor.creating') : t('connectMonitor.createSession')}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="w-full border shadow-lg overflow-hidden rounded-xl pt-0 gap-0 animate-in fade-in zoom-in-95 duration-300">
                    <CardHeader className="bg-primary/5 border-b rounded-none pt-6 pb-6 w-full">
                        <CardTitle className="text-center text-xl">{t('connectMonitor.scanToConnect')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8 flex flex-col items-center space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-inner inline-block">
                            <QRCodeSVG value={sessionId} size={240} level="H" includeMargin={true} />
                        </div>
                        <p className="text-sm text-muted-foreground text-center max-w-[280px]">
                            {t('connectMonitor.qrInstructions')}
                        </p>
                        <div className="bg-muted p-3 flex flex-col rounded-lg w-full items-center">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                                {t('connectMonitor.sessionIdLabel')}
                            </span>
                            <span className="font-mono text-sm tracking-widest bg-background px-3 py-1 rounded shadow-sm border">
                                {sessionId.split('-')[0]}-...
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
