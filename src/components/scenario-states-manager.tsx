"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Activity, HeartPulse, Droplets, Wind, Thermometer, ChevronUp, ChevronDown, Trash2, Edit2, Plus } from "lucide-react";
import { useI18n } from "@/i18n/i18n-context";

// Matching Supabase table structure
export type ScenarioState = {
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

// Form data matches ScenarioState but without id/scenario_id initially
type StateFormData = Omit<ScenarioState, "id" | "scenario_id">;

const DEFAULT_STATE: StateFormData = {
    state_name: "Nueva Fase",
    order_index: 0,
    heart_rate: 80,
    spo2: 98,
    respiratory_rate: 16,
    systolic_bp: 120,
    diastolic_bp: 80,
    etco2: 40,
    ecg_rhythm: "nsr",
    temperature: 36.5
};

const RHYTHM_LABELS: Record<string, string> = {
    "nsr": "Sinusal",
    "vt": "Taquicardia Ventricular (TV)",
    "vf": "Fibrilación Ventricular (FV)",
    "asistolia": "Asistolia",
    "no_signal": "Sin Señal"
};

export function ScenarioStatesManager({ scenarioId, initialStates }: { scenarioId: string, initialStates: ScenarioState[] }) {
    const [states, setStates] = useState<ScenarioState[]>(initialStates);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStateId, setEditingStateId] = useState<string | null>(null);
    const [formData, setFormData] = useState<StateFormData>(DEFAULT_STATE);
    const [loading, setLoading] = useState(false);

    const supabase = createClient();
    const { t } = useI18n();

    // Helper for rhythms
    const getRhythmLabel = (rhythm: string) => {
        switch (rhythm) {
            case "nsr": return t('statesManager.rhythmNsr');
            case "vt": return t('statesManager.rhythmVt');
            case "vf": return t('statesManager.rhythmVf');
            case "asistolia": return t('statesManager.rhythmAsystole');
            case "no_signal": return t('statesManager.rhythmNoSignal');
            default: return rhythm;
        }
    };

    const openCreateForm = () => {
        setFormData({ ...DEFAULT_STATE, state_name: t('statesManager.newStateDefault'), order_index: states.length });
        setEditingStateId(null);
        setIsFormOpen(true);
    };

    const openEditForm = (state: ScenarioState) => {
        setFormData({
            state_name: state.state_name,
            order_index: state.order_index,
            heart_rate: state.heart_rate ?? 80,
            spo2: state.spo2 ?? 98,
            respiratory_rate: state.respiratory_rate ?? 16,
            systolic_bp: state.systolic_bp ?? 120,
            diastolic_bp: state.diastolic_bp ?? 80,
            etco2: state.etco2 ?? 40,
            ecg_rhythm: state.ecg_rhythm || "nsr",
            temperature: state.temperature ?? 36.5
        });
        setEditingStateId(state.id);
        setIsFormOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Extra validation to ensure no null values are submitted since they are visually required
        const finalData = {
            ...formData,
            heart_rate: formData.heart_rate ?? 80,
            spo2: formData.spo2 ?? 98,
            respiratory_rate: formData.respiratory_rate ?? 16,
            systolic_bp: formData.systolic_bp ?? 120,
            diastolic_bp: formData.diastolic_bp ?? 80,
            etco2: formData.etco2 ?? 40,
            ecg_rhythm: formData.ecg_rhythm || "nsr",
            temperature: formData.temperature ?? 36.5
        };

        setLoading(true);

        try {
            if (editingStateId) {
                // Update
                const { data, error } = await supabase
                    .from("scenario_states")
                    .update(finalData)
                    .eq("id", editingStateId)
                    .select()
                    .single();

                if (error) throw error;
                if (data) {
                    setStates(states.map(s => s.id === editingStateId ? data : s));
                }
            } else {
                // Insert
                const { data, error } = await supabase
                    .from("scenario_states")
                    .insert([{ ...finalData, scenario_id: scenarioId }])
                    .select()
                    .single();

                if (error) throw error;
                if (data) {
                    setStates([...states, data].sort((a, b) => a.order_index - b.order_index));
                }
            }
            setIsFormOpen(false);
        } catch (err: any) {
            console.error(err);
            alert(t('statesManager.saveError') + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === states.length - 1)
        ) return;

        const currentStates = [...states].sort((a, b) => a.order_index - b.order_index);
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        const stateA = currentStates[index];
        const stateB = currentStates[swapIndex];

        // Swap order_index locally
        const tempOrder = stateA.order_index;
        stateA.order_index = stateB.order_index;
        stateB.order_index = tempOrder;

        // Optimistic UI update
        currentStates[index] = stateB;
        currentStates[swapIndex] = stateA;
        setStates(currentStates.sort((a, b) => a.order_index - b.order_index));

        // Background sync to Supabase
        try {
            await Promise.all([
                supabase.from("scenario_states").update({ order_index: stateA.order_index }).eq("id", stateA.id),
                supabase.from("scenario_states").update({ order_index: stateB.order_index }).eq("id", stateB.id)
            ]);
        } catch (err: any) {
            console.error("Failed to swap order", err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from("scenario_states").delete().eq("id", id);
            if (error) throw error;
            setStates(states.filter(s => s.id !== id));
        } catch (err: any) {
            alert(t('statesManager.deleteError') + err.message);
        }
    };

    // Helper formatter to keep JSX clean
    const formatNumberInput = (val: string) => {
        if (val === "") return null;
        return Number(val);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
                <div>
                    <h2 className="text-xl font-bold">{t('statesManager.title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('statesManager.description')}</p>
                </div>
                {!isFormOpen && (
                    <Button onClick={openCreateForm} className="gap-2 font-semibold">
                        <Plus className="h-4 w-4" /> {t('statesManager.newPhase')}
                    </Button>
                )}
            </div>

            {isFormOpen && (
                <Card className="animate-in fade-in zoom-in-95 duration-200 border-primary/20 shadow-lg">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle>{editingStateId ? t('statesManager.editPhase') : t('statesManager.newPhaseTitle')}</CardTitle>
                        <CardDescription>
                            {t('statesManager.formDescription')}
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSave}>
                        <CardContent className="space-y-8 pt-6">
                            <div className="space-y-2 max-w-md">
                                <Label className="text-base">{t('statesManager.phaseNameLabel')} <span className="text-destructive">*</span></Label>
                                <Input
                                    required
                                    className="text-lg bg-background"
                                    value={formData.state_name}
                                    onChange={(e) => setFormData({ ...formData, state_name: e.target.value })}
                                    placeholder={t('statesManager.phaseNamePlaceholder')}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Hemodinámica */}
                                <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-4 p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
                                    <h3 className="text-sm font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                                        <HeartPulse className="h-4 w-4" /> {t('statesManager.hemodynamicsTitle')}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t('statesManager.ecgRhythmLabel')} <span className="text-destructive">*</span></Label>
                                            <Select
                                                required
                                                value={formData.ecg_rhythm || "nsr"}
                                                onValueChange={(val) => setFormData({ ...formData, ecg_rhythm: val })}
                                            >
                                                <SelectTrigger className="bg-background">
                                                    <SelectValue placeholder={t('statesManager.rhythmPlaceholder')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="nsr">{t('statesManager.rhythmNsr')}</SelectItem>
                                                    <SelectItem value="vf">{t('statesManager.rhythmVf')}</SelectItem>
                                                    <SelectItem value="vt">{t('statesManager.rhythmVt')}</SelectItem>
                                                    <SelectItem value="asistolia">{t('statesManager.rhythmAsystole')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('statesManager.hrLabel')} <span className="text-destructive">*</span></Label>
                                            <Input
                                                required
                                                type="number"
                                                className="bg-background"
                                                value={formData.heart_rate === null ? "" : formData.heart_rate}
                                                onChange={(e) => setFormData({ ...formData, heart_rate: formatNumberInput(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('statesManager.sysBpLabel')} <span className="text-destructive">*</span></Label>
                                            <Input
                                                required
                                                type="number"
                                                className="bg-background"
                                                value={formData.systolic_bp === null ? "" : formData.systolic_bp}
                                                onChange={(e) => setFormData({ ...formData, systolic_bp: formatNumberInput(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('statesManager.diaBpLabel')} <span className="text-destructive">*</span></Label>
                                            <Input
                                                required
                                                type="number"
                                                className="bg-background"
                                                value={formData.diastolic_bp === null ? "" : formData.diastolic_bp}
                                                onChange={(e) => setFormData({ ...formData, diastolic_bp: formatNumberInput(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Respiratorio */}
                                <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                    <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                        <Wind className="h-4 w-4" /> {t('statesManager.respiratoryTitle')}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t('statesManager.spo2Label')} <span className="text-destructive">*</span></Label>
                                            <Input
                                                required
                                                type="number"
                                                className="bg-background"
                                                value={formData.spo2 === null ? "" : formData.spo2}
                                                onChange={(e) => setFormData({ ...formData, spo2: formatNumberInput(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('statesManager.rrLabel')} <span className="text-destructive">*</span></Label>
                                            <Input
                                                required
                                                type="number"
                                                className="bg-background"
                                                value={formData.respiratory_rate === null ? "" : formData.respiratory_rate}
                                                onChange={(e) => setFormData({ ...formData, respiratory_rate: formatNumberInput(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('statesManager.etco2Label')} <span className="text-destructive">*</span></Label>
                                            <Input
                                                required
                                                type="number"
                                                className="bg-background"
                                                value={formData.etco2 === null ? "" : formData.etco2}
                                                onChange={(e) => setFormData({ ...formData, etco2: formatNumberInput(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('statesManager.tempLabel')} <span className="text-destructive">*</span></Label>
                                            <Input
                                                required
                                                type="number"
                                                step="0.1"
                                                className="bg-background"
                                                value={formData.temperature === null ? "" : formData.temperature}
                                                onChange={(e) => setFormData({ ...formData, temperature: formatNumberInput(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3 bg-muted/30 pt-4 rounded-b-xl border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFormOpen(false)}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="min-w-[120px]"
                            >
                                {loading ? t('common.saving') : t('statesManager.savePhase')}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}

            {states.length === 0 && !isFormOpen ? (
                <div className="text-center py-16 px-4 flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50">
                    <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium">{t('statesManager.emptyTitle')}</h3>
                    <p className="text-muted-foreground mt-1 mb-6 max-w-sm">{t('statesManager.emptyDesc')}</p>
                    <Button onClick={openCreateForm}>{t('statesManager.createFirstPhase')}</Button>
                </div>
            ) : (
                <div className="space-y-3 relative">
                    <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-border -z-10 hidden sm:block"></div>
                    {states.sort((a, b) => a.order_index - b.order_index).map((state, index) => (
                        <Card key={state.id} className="group relative transition-all hover:shadow-md border-muted-foreground/20 hover:border-primary/50">
                            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground min-w-[32px] sm:min-w-[48px]">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleMove(index, 'up')}
                                            disabled={index === 0}
                                            className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                                            title={t('statesManager.moveUp')}
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border shadow-sm">
                                            {index + 1}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleMove(index, 'down')}
                                            disabled={index === states.length - 1}
                                            className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                                            title={t('statesManager.moveDown')}
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-lg leading-tight truncate">{state.state_name}</h4>
                                    </div>
                                    {/* Mobile actions at the top */}
                                    <div className="flex sm:hidden gap-1 ml-auto">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(state)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <ConfirmDialog
                                            title={t('common.delete')}
                                            description={t('statesManager.deleteConfirm')}
                                            onConfirm={() => handleDelete(state.id)}
                                            confirmText={t('common.delete')}
                                        >
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </ConfirmDialog>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-wrap items-center gap-2 sm:pl-4 pl-12 border-l-0 sm:border-l border-border/50">
                                    <Badge variant="outline" className="px-2 py-1 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30 gap-1 font-medium">
                                        <HeartPulse className="h-3 w-3" />
                                        FC {state.heart_rate}
                                        <span className="opacity-70 font-normal ml-1 border-l border-green-500/30 pl-1">{getRhythmLabel(state.ecg_rhythm || "")}</span>
                                    </Badge>

                                    <Badge variant="outline" className="px-2 py-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1 font-medium">
                                        <Droplets className="h-3 w-3" />
                                        SpO2 {state.spo2}%
                                    </Badge>

                                    <Badge variant="outline" className="px-2 py-1 bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 gap-1 font-medium">
                                        <Activity className="h-3 w-3" />
                                        TA {state.systolic_bp}/{state.diastolic_bp}
                                    </Badge>

                                    <Badge variant="outline" className="px-2 py-1 bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 gap-1 font-medium">
                                        <Wind className="h-3 w-3" />
                                        FR {state.respiratory_rate}
                                    </Badge>

                                    <Badge variant="outline" className="px-2 py-1 bg-muted text-muted-foreground border-border gap-1 font-medium">
                                        <Thermometer className="h-3 w-3" />
                                        {state.temperature}°C
                                    </Badge>
                                </div>

                                {/* Desktop Actions */}
                                <div className="hidden sm:flex items-center gap-2 ml-auto pl-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 shadow-sm"
                                        onClick={() => openEditForm(state)}
                                    >
                                        <Edit2 className="h-3.5 w-3.5 mr-1" /> {t('statesManager.edit')}
                                    </Button>
                                    <ConfirmDialog
                                        title={t('common.delete')}
                                        description={t('statesManager.deleteConfirm')}
                                        onConfirm={() => handleDelete(state.id)}
                                        confirmText={t('common.delete')}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </ConfirmDialog>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
