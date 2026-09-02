"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { useI18n } from "@/i18n/i18n-context";

export function ConnectMonitor() {
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [showQR, setShowQR] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();
    const { t } = useI18n();

    const handleCreateSession = async () => {
        setLoading(true);
        setError(null);

        try {
            // First get the current user ID
            const { data: userData, error: userError } = await supabase.auth.getUser();

            if (userError || !userData.user) {
                throw new Error("You must be logged in to create a session");
            }

            // Delete previous sessions for this instructor
            const { error: deleteError } = await supabase
                .from("sessions")
                .delete()
                .eq("instructor_id", userData.user.id);

            if (deleteError) {
                throw deleteError;
            }

            // Insert a new session to the public.sessions table
            const { data, error: insertError } = await supabase
                .from("sessions")
                .insert([{
                    instructor_id: userData.user.id,
                    scenario_name: "Nueva sesión", // Default for now
                }])
                .select("id")
                .single();

            if (insertError) {
                throw insertError;
            }

            if (data) {
                setSessionId(data.id);

                // Also initialize the monitor_state row for this new session
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
                    // Decide if you want to throw or just log. We throw to be safe
                    throw new Error("Failed to initialize monitor state");
                }

                // Automatically show QR after creation
                setShowQR(true);
            }
        } catch (err: any) {
            console.error("Error creating session:", err);
            setError(err.message || "Failed to create session");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
            <div>
                <h2 className="text-xl font-semibold mb-2">{t('connectMonitor.title')}</h2>
                <p className="text-sm text-muted-foreground">
                    {t('connectMonitor.description')}
                </p>
            </div>

            {error && (
                <div className="w-full rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {!sessionId ? (
                <button
                    onClick={handleCreateSession}
                    disabled={loading}
                    className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-50"
                >
                    {loading ? t('connectMonitor.creating') : t('connectMonitor.createSession')}
                </button>
            ) : (
                <button
                    onClick={() => setShowQR(true)}
                    className="rounded-md bg-secondary text-secondary-foreground border px-6 py-3 text-sm font-semibold shadow-sm hover:bg-secondary/80 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                >
                    {t('connectMonitor.viewQR')}
                </button>
            )}

            {/* Modal for QR Code */}
            {showQR && sessionId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-xl bg-card p-8 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowQR(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Cerrar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>

                        <div className="flex flex-col items-center space-y-6">
                            <h3 className="text-xl font-bold">{t('connectMonitor.scanToConnect')}</h3>

                            <div className="bg-white p-4 rounded-xl shadow-inner">
                                <QRCodeSVG
                                    value={sessionId}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>

                            <p className="text-xs text-muted-foreground break-all text-center">
                                {t('connectMonitor.sessionIdLabel')}<br />
                                <span className="font-mono">{sessionId}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
