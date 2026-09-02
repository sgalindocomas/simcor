"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/i18n/i18n-context";

type Scenario = { id: string; title: string };
type ScenarioState = {
    id: string;
    state_name: string;
    heart_rate: number | null;
    spo2: number | null;
    respiratory_rate: number | null;
    systolic_bp: number | null;
    diastolic_bp: number | null;
    etco2: number | null;
    ecg_rhythm: string | null;
    temperature: number | null;
};
type MonitorState = {
    session_id: string;
    heart_rate: number;
    spo2: number;
    respiratory_rate: number;
    systolic_bp: number;
    diastolic_bp: number;
    etco2: number;
    ecg_rhythm: string;
    is_ecg_connected: boolean;
    is_sp02_connected: boolean;
    is_bp_connected: boolean;
    temperature: number;
    is_capno_connected: boolean;
    is_temp_connected: boolean;
};

export function ExecutionPanel({ sessionId, instructorId }: { sessionId: string, instructorId: string }) {
    const supabase = createClient();
    const { t } = useI18n();

    const [monitorState, setMonitorState] = useState<MonitorState>({
        session_id: sessionId,
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
        is_temp_connected: false,
    });
    const [updateError, setUpdateError] = useState<string | null>(null);

    // Initial load
    useEffect(() => {
        const fetchInitialState = async () => {
            const { data, error } = await supabase
                .from("monitor_state")
                .select("*")
                .eq("session_id", sessionId)
                .single();

            if (data && !error) {
                setMonitorState(data as MonitorState);
            }
        };

        fetchInitialState();

        // Subscribe to real-time updates for monitor_state
        const channel = supabase.channel(`monitor_${sessionId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "monitor_state", filter: `session_id=eq.${sessionId}` },
                (payload) => setMonitorState(payload.new as MonitorState)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId, supabase]);

    const updateMonitor = async (payload: Partial<MonitorState>) => {
        setUpdateError(null);
        const { error } = await supabase
            .from("monitor_state")
            .update(payload)
            .eq("session_id", sessionId);

        if (error) {
            console.error("Update failed:", error);
            setUpdateError(t('executionPanel.updateError'));
            // Optionally revert local state if needed
        } else {
            // Optimistic update
            setMonitorState(prev => ({ ...prev, ...payload }));
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">{t('executionPanel.title')}</h2>
            {updateError && <div className="text-destructive font-bold text-center">{updateError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* AREA 1: SpO2 y Frecuencia Cardíaca */}
                <Card className="flex flex-col overflow-hidden">
                    <CardHeader className="border-b border-blue-500/20 pb-4">
                        <CardTitle className="text-blue-600 dark:text-blue-400">{t('executionPanel.spo2FcTitle')}</CardTitle>
                        <CardDescription>{t('executionPanel.spo2FcDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6 flex-grow">
                        <Button
                            onClick={() => updateMonitor({ is_sp02_connected: !monitorState.is_sp02_connected })}
                            className={`w-full py-6 font-bold shadow-sm ${monitorState.is_sp02_connected
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            {monitorState.is_sp02_connected ? t('executionPanel.pulseOximeterConnected') : t('executionPanel.placePulseOximeter')}
                        </Button>

                        <div className="grid grid-cols-2 gap-4">
                            <VitalControler
                                label="SpO2" value={monitorState.spo2} unit="%"
                                onChange={(val) => updateMonitor({ spo2: val })}
                            />
                            <VitalControler
                                label="Frec. Cardíaca" value={monitorState.heart_rate} unit="lpm"
                                onChange={(val) => updateMonitor({ heart_rate: val })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* AREA 2: Presión Arterial (NIBP) */}
                <Card className="flex flex-col overflow-hidden">
                    <CardHeader className="border-b border-orange-500/20 pb-4">
                        <CardTitle className="text-orange-600 dark:text-orange-400">{t('executionPanel.nibpTitle')}</CardTitle>
                        <CardDescription>{t('executionPanel.nibpDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6 flex-grow">
                        <Button
                            onClick={() => updateMonitor({ is_bp_connected: !monitorState.is_bp_connected })}
                            className={`w-full py-6 font-bold shadow-sm ${monitorState.is_bp_connected
                                ? "bg-orange-500 hover:bg-orange-600 text-white"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            {monitorState.is_bp_connected
                                ? t('executionPanel.nibpConnected')
                                : t('executionPanel.connectNibp')}
                        </Button>

                        <div className="grid grid-cols-2 gap-4">
                            <VitalControler
                                label={t('executionPanel.sysBpLabel')} value={monitorState.systolic_bp} unit="mmHg"
                                onChange={(val) => updateMonitor({ systolic_bp: val })}
                            />
                            <VitalControler
                                label={t('executionPanel.diaBpLabel')} value={monitorState.diastolic_bp} unit="mmHg"
                                onChange={(val) => updateMonitor({ diastolic_bp: val })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* AREA 3: Monitorización Central (ECG / Resp) */}
                <Card className="flex flex-col overflow-hidden">
                    <CardHeader className="border-b border-green-500/20 pb-4">
                        <CardTitle className="text-green-600 dark:text-green-400">{t('executionPanel.centralMonitorTitle')}</CardTitle>
                        <CardDescription>{t('executionPanel.centralMonitorDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6 flex-grow">
                        <Button
                            onClick={() => {
                                const newConnectedState = !monitorState.is_ecg_connected;
                                updateMonitor({
                                    is_ecg_connected: newConnectedState,
                                    ecg_rhythm: newConnectedState ? "nsr" : "no_signal"
                                });
                            }}
                            className={`w-full py-6 font-bold shadow-sm ${monitorState.is_ecg_connected
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                        >
                            {monitorState.is_ecg_connected ? t('executionPanel.ecgConnected') : t('executionPanel.connectEcg')}
                        </Button>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Ritmo ECG</label>
                            <Select
                                value={monitorState.ecg_rhythm}
                                onValueChange={(val) => updateMonitor({ ecg_rhythm: val })}
                                disabled={!monitorState.is_ecg_connected}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('executionPanel.selectRhythmPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="nsr">{t('executionPanel.rhythmNsr')}</SelectItem>
                                    <SelectItem value="vf">{t('executionPanel.rhythmVf')}</SelectItem>
                                    <SelectItem value="vt">{t('executionPanel.rhythmVt')}</SelectItem>
                                    <SelectItem value="asistolia">{t('executionPanel.rhythmAsystole')}</SelectItem>
                                    {monitorState.ecg_rhythm === "no_signal" && (
                                        <SelectItem value="no_signal" className="hidden">{t('executionPanel.rhythmNoSignal')}</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                    </CardContent>
                </Card>

                {/* AREA 4: Capnografía y Temperatura */}
                <Card className="flex flex-col overflow-hidden">
                    <CardHeader className="border-b border-purple-500/20 pb-4">
                        <CardTitle className="text-purple-600 dark:text-purple-400">{t('executionPanel.capnoTitle')}</CardTitle>
                        <CardDescription>{t('executionPanel.capnoDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6 flex-grow">
                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={() => updateMonitor({ is_capno_connected: !monitorState.is_capno_connected })}
                                className={`w-full py-6 font-bold shadow-sm ${monitorState.is_capno_connected
                                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                {monitorState.is_capno_connected ? t('executionPanel.capnoConnected') : t('executionPanel.connectCapno')}
                            </Button>
                            <Button
                                onClick={() => updateMonitor({ is_temp_connected: !monitorState.is_temp_connected })}
                                className={`w-full py-6 font-bold shadow-sm ${monitorState.is_temp_connected
                                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    }`}
                            >
                                {monitorState.is_temp_connected ? t('executionPanel.tempConnected') : t('executionPanel.connectTemp')}
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <VitalControler
                                label={t('executionPanel.rrLabel')} value={monitorState.respiratory_rate} unit="rpm"
                                onChange={(val) => updateMonitor({ respiratory_rate: val })}
                            />
                            <VitalControler
                                label={t('executionPanel.etco2Label')} value={monitorState.etco2} unit="mmHg"
                                onChange={(val) => updateMonitor({ etco2: val })}
                            />
                            <div className="col-span-2">
                                <VitalControler
                                    label={t('executionPanel.tempLabel')} value={monitorState.temperature} unit="°C"
                                    onChange={(val) => updateMonitor({ temperature: Math.round(val * 10) / 10 })}
                                    step={0.5}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

// Helper component to adjust a single vital sign
function VitalControler({ label, value, unit, onChange, step = 1 }: { label: string, value: number, unit: string, onChange: (val: number) => void, step?: number }) {
    return (
        <Card className="p-3 text-center shadow-sm">
            <span className="text-xs text-muted-foreground block mb-1">{label}</span>
            <div className="flex items-center justify-between mt-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full font-bold"
                    onClick={() => onChange(value - step)}
                >
                    -
                </Button>
                <div className="flex flex-col items-center">
                    <span className="text-xl font-bold">{value}</span>
                    <span className="text-[10px] text-muted-foreground -mt-1">{unit}</span>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 rounded-full font-bold"
                    onClick={() => onChange(value + step)}
                >
                    +
                </Button>
            </div>
        </Card>
    );
}
