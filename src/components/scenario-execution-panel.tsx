"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/i18n-context";
import { useMonitorPresence } from "@/hooks/use-monitor-presence";
import { HeartPulse, Droplets, Wind, Thermometer, Activity, Play } from "lucide-react";
import { ConnectionBadge } from "@/components/connection-badge";
import { MonitorConnectionCard } from "@/components/monitor-connection-card";

type ScenarioState = {
    id: string;
    scenario_id: string;
    state_name: string;
    order_index: number;
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

export function ScenarioExecutionPanel({
    sessionId,
    scenarioId,
    initialStates
}: {
    sessionId: string,
    scenarioId: string,
    initialStates: ScenarioState[]
}) {
    const supabase = createClient();
    const isMonitorConnected = useMonitorPresence(sessionId);
    const { t } = useI18n();

    const [monitorState, setMonitorState] = useState<MonitorState | null>(null);
    const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
    const [updateError, setUpdateError] = useState<string | null>(null);

    // Initial load of the monitor_state
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
            setUpdateError("Error al actualizar monitor");
        } else if (monitorState) {
            setMonitorState({ ...monitorState, ...payload });
        }
    };

    const activatePhase = async (index: number) => {
        const phase = initialStates[index];
        if (!phase) return;

        setActivePhaseIndex(index);

        await updateMonitor({
            heart_rate: phase.heart_rate ?? 80,
            spo2: phase.spo2 ?? 98,
            respiratory_rate: phase.respiratory_rate ?? 16,
            systolic_bp: phase.systolic_bp ?? 120,
            diastolic_bp: phase.diastolic_bp ?? 80,
            etco2: phase.etco2 ?? 40,
            ecg_rhythm: phase.ecg_rhythm || "nsr",
            temperature: phase.temperature ?? 36.5,
        });
    };

    if (!monitorState) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Cargando estado del monitor...</div>;
    }

    return (
        <div className="w-full space-y-8">
            {/* Header Connection Badge */}
            <div className="flex items-center gap-4">
                <ConnectionBadge isConnected={isMonitorConnected} />
            </div>

            {updateError && <div className="text-destructive font-bold text-center p-2 bg-destructive/10 rounded-md">{updateError}</div>}

            {/* If NOT connected, show QR. If connected, show controls. */}
            {!isMonitorConnected ? (
                <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-6 mt-4">
                    <div className="w-full">
                        <MonitorConnectionCard activeSessionId={sessionId} />
                    </div>

                    {/* Informative placeholder */}
                    <Card className="w-full border-dashed shadow-sm">
                        <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-4">
                            <h2 className="text-xl font-semibold opacity-70">
                                {t('dashboardContent.monitorPendingTitle')}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {t('dashboardContent.monitorPendingDesc')}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left: Toggles for connections (as requested by user) */}
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2">Sensores del Paciente</h3>

                        <Button
                            onClick={() => {
                                const newConnectedState = !monitorState.is_ecg_connected;
                                updateMonitor({
                                    is_ecg_connected: newConnectedState,
                                    ecg_rhythm: newConnectedState ? (initialStates[activePhaseIndex]?.ecg_rhythm || "nsr") : "no_signal"
                                });
                            }}
                            className={`w-full py-8 font-bold shadow-sm justify-start pl-6 transition-all ${monitorState.is_ecg_connected
                                ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 shadow-none"
                                }`}
                        >
                            <HeartPulse className="mr-3 h-5 w-5" />
                            {monitorState.is_ecg_connected ? "ECG Conectado" : "Conectar ECG"}
                        </Button>

                        <Button
                            onClick={() => updateMonitor({ is_sp02_connected: !monitorState.is_sp02_connected })}
                            className={`w-full py-8 font-bold shadow-sm justify-start pl-6 transition-all ${monitorState.is_sp02_connected
                                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 shadow-none"
                                }`}
                        >
                            <Droplets className="mr-3 h-5 w-5" />
                            {monitorState.is_sp02_connected ? "SpO2 Conectado" : "Conectar SpO2"}
                        </Button>

                        <Button
                            onClick={() => updateMonitor({ is_bp_connected: !monitorState.is_bp_connected })}
                            className={`w-full py-8 font-bold shadow-sm justify-start pl-6 transition-all ${monitorState.is_bp_connected
                                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 shadow-none"
                                }`}
                        >
                            <Activity className="mr-3 h-5 w-5" />
                            {monitorState.is_bp_connected ? "NIBP Conectado" : "Conectar Manguito"}
                        </Button>

                        <Button
                            onClick={() => updateMonitor({ is_capno_connected: !monitorState.is_capno_connected })}
                            className={`w-full py-8 font-bold shadow-sm justify-start pl-6 transition-all ${monitorState.is_capno_connected
                                ? "bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 shadow-none"
                                }`}
                        >
                            <Wind className="mr-3 h-5 w-5" />
                            {monitorState.is_capno_connected ? "Capno Conectado" : "Conectar Capno"}
                        </Button>

                        <Button
                            onClick={() => updateMonitor({ is_temp_connected: !monitorState.is_temp_connected })}
                            className={`w-full py-8 font-bold shadow-sm justify-start pl-6 transition-all ${monitorState.is_temp_connected
                                ? "bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/20"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 shadow-none"
                                }`}
                        >
                            <Thermometer className="mr-3 h-5 w-5" />
                            {monitorState.is_temp_connected ? "Tª Conectada" : "Conectar Tª"}
                        </Button>
                    </div>

                    {/* Right: Scenario Phases & Current Values */}
                    <div className="lg:col-span-3 space-y-6">
                        <Card className="border-primary/20 shadow-md overflow-hidden pt-0 gap-0">
                            <CardHeader className="bg-primary/5 border-b pb-4 pt-6 rounded-none">
                                <CardTitle className="text-xl text-primary">Control del Escenario</CardTitle>
                                <CardDescription>Pulsa sobre una fase para enviar esos valores vitales al monitor</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {initialStates.map((phase, index) => {
                                        const isActive = activePhaseIndex === index;
                                        return (
                                            <div
                                                key={phase.id}
                                                className={`p-6 transition-colors ${isActive ? "bg-primary/10" : "hover:bg-muted/50"}`}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                                            {index + 1}
                                                        </div>
                                                        <h4 className={`text-lg font-bold ${isActive ? 'text-primary' : ''}`}>
                                                            {phase.state_name}
                                                        </h4>
                                                    </div>

                                                    <Button
                                                        variant={isActive ? "default" : "outline"}
                                                        disabled={isActive}
                                                        onClick={() => activatePhase(index)}
                                                        className="gap-2"
                                                    >
                                                        {isActive ? (
                                                            <>Fase Activa</>
                                                        ) : (
                                                            <><Play className="h-4 w-4" /> Lanzar Fase</>
                                                        )}
                                                    </Button>
                                                </div>

                                                <div className="flex flex-wrap gap-2 pl-11">
                                                    <Badge variant="outline" className={`px-2 py-1 gap-1 ${isActive ? "bg-background border-primary/20" : ""}`}>
                                                        <HeartPulse className="h-3 w-3" /> FC: {phase.heart_rate}
                                                    </Badge>
                                                    <Badge variant="outline" className={`px-2 py-1 gap-1 ${isActive ? "bg-background border-primary/20" : ""}`}>
                                                        Ritmo: {phase.ecg_rhythm}
                                                    </Badge>
                                                    <Badge variant="outline" className={`px-2 py-1 gap-1 ${isActive ? "bg-background border-primary/20" : ""}`}>
                                                        <Droplets className="h-3 w-3" /> SpO2: {phase.spo2}%
                                                    </Badge>
                                                    <Badge variant="outline" className={`px-2 py-1 gap-1 ${isActive ? "bg-background border-primary/20" : ""}`}>
                                                        <Activity className="h-3 w-3" /> TA: {phase.systolic_bp}/{phase.diastolic_bp}
                                                    </Badge>
                                                    <Badge variant="outline" className={`px-2 py-1 gap-1 ${isActive ? "bg-background border-primary/20" : ""}`}>
                                                        <Wind className="h-3 w-3" /> FR: {phase.respiratory_rate} (EtCO2: {phase.etco2})
                                                    </Badge>
                                                    <Badge variant="outline" className={`px-2 py-1 gap-1 ${isActive ? "bg-background border-primary/20" : ""}`}>
                                                        <Thermometer className="h-3 w-3" /> {phase.temperature}°C
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
