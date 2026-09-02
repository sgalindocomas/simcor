"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n/i18n-context";

type Scenario = {
    id: string;
    instructor_id: string;
    title: string;
    description: string | null;
    created_at: string;
};

export function ScenariosList({ initialScenarios, userId }: { initialScenarios: Scenario[], userId: string }) {
    const [scenarios, setScenarios] = useState<Scenario[]>(initialScenarios);
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startingScenarioId, setStartingScenarioId] = useState<string | null>(null);

    const supabase = createClient();
    const router = useRouter();
    const { t } = useI18n();

    const handleStart = async (scenario: Scenario) => {
        setStartingScenarioId(scenario.id);
        try {
            // 1. Validar que tenga al menos 2 fases
            const { data: states, error: statesError } = await supabase
                .from("scenario_states")
                .select("*")
                .eq("scenario_id", scenario.id)
                .order("order_index", { ascending: true });

            if (statesError) throw statesError;

            if (!states || states.length < 2) {
                setError(`El escenario "${scenario.title}" no es válido: debe tener al menos 2 fases para poder empezar.`);
                window.scrollTo({ top: 0, behavior: "smooth" });
                setStartingScenarioId(null);
                return;
            }

            const initialState = states[0];

            // 2. Gestionar la sesión
            // Check if there is already an active session
            const { data: existingSessions, error: existingError } = await supabase
                .from("sessions")
                .select("id")
                .eq("instructor_id", userId)
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .limit(1);

            if (existingError) throw existingError;

            let sessionId = existingSessions?.[0]?.id;

            if (sessionId) {
                // Reuse existing session and update its scenario_name
                await supabase
                    .from("sessions")
                    .update({ scenario_name: scenario.title })
                    .eq("id", sessionId);
            } else {
                // Create session (borrando las anteriores inertes del instructor)
                await supabase.from("sessions").delete().eq("instructor_id", userId);
                const { data: sessionData, error: sessionError } = await supabase
                    .from("sessions")
                    .insert([{
                        instructor_id: userId,
                        scenario_name: scenario.title,
                    }])
                    .select("id")
                    .single();

                if (sessionError) throw sessionError;
                sessionId = sessionData.id;
            }

            // 3. Crear o actualizar monitor_state con vitals de initialState y sensores en false
            // Intentar actualizar, si falla por no existir (caso raro si reusamos), insertamos. UPSERT
            const { error: monitorError } = await supabase
                .from("monitor_state")
                .upsert({
                    session_id: sessionId,
                    heart_rate: initialState.heart_rate ?? 80,
                    spo2: initialState.spo2 ?? 98,
                    respiratory_rate: initialState.respiratory_rate ?? 16,
                    systolic_bp: initialState.systolic_bp ?? 120,
                    diastolic_bp: initialState.diastolic_bp ?? 80,
                    etco2: initialState.etco2 ?? 40,
                    ecg_rhythm: initialState.ecg_rhythm || "nsr",
                    temperature: initialState.temperature ?? 36.5,
                    is_ecg_connected: false,
                    is_sp02_connected: false,
                    is_bp_connected: false,
                    is_capno_connected: false,
                    is_temp_connected: false
                }, { onConflict: 'session_id' });

            if (monitorError) throw monitorError;

            // 4. Redirigir al dashboard-escenario
            router.push(`/dashboard-escenario/${sessionId}?scenarioId=${scenario.id}`);

        } catch (err: any) {
            console.error(err);
            alert("Error al iniciar escenario: " + err.message);
            setStartingScenarioId(null);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            console.log({ userId })
            const { data, error: insertError } = await supabase
                .from("scenarios")
                .insert([{
                    instructor_id: userId,
                    title,
                    description: description || null
                }])
                .select()
                .single();

            if (insertError) throw insertError;

            if (data) {
                setScenarios([data, ...scenarios]);
                setIsCreating(false);
                setTitle("");
                setDescription("");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Error al crear escenario");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from("scenarios")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;

            setScenarios(scenarios.filter(s => s.id !== id));
        } catch (err: any) {
            console.error(err);
            alert("Error al borrar: " + err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{t('scenarios.title')}</h2>
                <Button
                    onClick={() => setIsCreating(!isCreating)}
                >
                    {isCreating ? t('common.cancel') : t('scenarios.newScenario')}
                </Button>
            </div>

            {error && (
                <div className="rounded-md bg-destructive/15 border border-destructive/20 p-4 text-sm text-destructive mb-6 font-medium animate-in fade-in">
                    {error}
                </div>
            )}

            {isCreating && (
                <Card className="animate-in fade-in slide-in-from-top-4 duration-300 mb-8 border-primary/20 shadow-md">
                    <form onSubmit={handleCreate}>
                        <CardHeader>
                            <CardTitle>{t('scenarios.createTitle')}</CardTitle>
                            <CardDescription>{t('scenarios.createDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="font-semibold mt-4">{t('scenarios.scenarioTitleLbl')}</Label>
                                <Input
                                    id="title"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={t('scenarios.scenarioTitlePh')}
                                    className="text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="font-semibold">{t('scenarios.scenarioDescLbl')}</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="resize-none text-base"
                                    placeholder={t('scenarios.scenarioDescPh')}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3 pt-6 border-t mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsCreating(false);
                                    setTitle("");
                                    setDescription("");
                                }}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !title.trim()}
                            >
                                {loading ? t('common.saving') : t('scenarios.saveScenario')}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}

            {scenarios.length === 0 && !isCreating ? (
                <div className="text-center p-12 rounded-xl border border-dashed bg-card/50">
                    <p className="text-muted-foreground">{t('scenarios.noScenarios')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scenarios.map(scenario => (
                        <Card key={scenario.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors group">
                            <CardHeader>
                                <CardTitle className="truncate" title={scenario.title}>{scenario.title}</CardTitle>
                                <CardDescription className="line-clamp-2 mt-2">
                                    {scenario.description || t('scenarios.noDescription')}
                                </CardDescription>
                            </CardHeader>

                            <CardFooter className="flex flex-col gap-3 pt-4 border-t mt-auto">
                                <Button
                                    onClick={() => handleStart(scenario)}
                                    disabled={startingScenarioId === scenario.id}
                                    className="w-full font-bold"
                                >
                                    {startingScenarioId === scenario.id ? t('scenarios.starting') : t('scenarios.start')}
                                </Button>
                                <div className="flex justify-between items-center w-full">
                                    <Link
                                        href={`/scenarios/${scenario.id}`}
                                        className="text-sm font-medium text-primary hover:underline flex items-center"
                                    >
                                        {t('scenarios.phases')}
                                    </Link>
                                    <ConfirmDialog
                                        title={t('scenarios.deleteConfirmTitle')}
                                        description={t('scenarios.deleteConfirmDesc')}
                                        onConfirm={() => handleDelete(scenario.id)}
                                        confirmText={t('common.delete')}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                                        >
                                            {t('common.delete')}
                                        </Button>
                                    </ConfirmDialog>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
