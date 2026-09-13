"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Link from "next/link";
import { Calendar, MapPin, UserPlus, PackagePlus, Pencil, Trash2, X } from "lucide-react";

export function IncidentesList({ initialIncidentes, pacientes, recursos, centroId }: any) {
    const [incidentes, setIncidentes] = useState<any[]>(initialIncidentes);
    const [isCreating, setIsCreating] = useState(false);
    
    // Formularios
    const [motiu, setMotiu] = useState("");
    const [localitzacio, setLocalitzacio] = useState("");
    const [loading, setLoading] = useState(false);

    // Estados de edición
    const [editingIncident, setEditingIncident] = useState<any>(null);
    const [editMotiu, setEditMotiu] = useState("");
    const [editLocalitzacio, setEditLocalitzacio] = useState("");

    const supabase = createClient();

    // Crear Incidente
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("incident")
                .insert([{ motiu, localitzacio, centro_id: centroId }])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                data.afectat = [];
                data.incident_recurs = [];
                setIncidentes([data, ...incidentes]);
                setIsCreating(false);
                setMotiu("");
                setLocalitzacio("");
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Editar Incidente
    const handleEditIncident = async () => {
        if (!editingIncident) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from("incident")
                .update({ motiu: editMotiu, localitzacio: editLocalitzacio })
                .eq("id", editingIncident.id);

            if (error) throw error;
            
            setIncidentes(incidentes.map(inc => 
                inc.id === editingIncident.id ? { ...inc, motiu: editMotiu, localitzacio: editLocalitzacio } : inc
            ));
            setEditingIncident(null);
        } catch (err: any) {
            alert("Error al editar: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Eliminar Incidente
    const handleDeleteIncident = async (id: string) => {
        try {
            const { error } = await supabase.from("incident").delete().eq("id", id);
            if (error) throw error;
            setIncidentes(incidentes.filter(inc => inc.id !== id));
        } catch (err: any) {
            alert("Error al eliminar: " + err.message);
        }
    };

    // Añadir Recurso a Incidente
    const handleAddRecurs = async (incidentId: string, recursId: string) => {
        if (!recursId) return;
        try {
            const { error } = await supabase
                .from("incident_recurs")
                .insert([{ ref_incident: incidentId, ref_recurs: recursId }]);
            
            if (error) throw error;

            const recursObj = recursos.find((r: any) => r.id === recursId);
            setIncidentes(prev => prev.map(inc => {
                if (inc.id === incidentId) {
                    return {
                        ...inc,
                        incident_recurs: [...inc.incident_recurs, { ref_recurs: recursId, recurs: recursObj }]
                    };
                }
                return inc;
            }));
        } catch (err: any) {
            alert("Error al asignar recurso: " + err.message);
        }
    };

    // Desvincular Recurso
    const handleRemoveRecurs = async (incidentId: string, recursId: string) => {
        try {
            const { error } = await supabase
                .from("incident_recurs")
                .delete()
                .match({ ref_incident: incidentId, ref_recurs: recursId });
            
            if (error) throw error;

            setIncidentes(prev => prev.map(inc => {
                if (inc.id === incidentId) {
                    return {
                        ...inc,
                        incident_recurs: inc.incident_recurs.filter((ir: any) => ir.ref_recurs !== recursId)
                    };
                }
                return inc;
            }));
        } catch (err: any) {
            alert("Error al desvincular recurso: " + err.message);
        }
    };

    // Añadir Afectado
    const handleAddAfectat = async (incidentId: string, pacientId: string, edat: string, sexe: string) => {
        const finalPacientId = pacientId && pacientId !== "none" ? pacientId : null;
        try {
            const { data, error } = await supabase
                .from("afectat")
                .insert([{ 
                    ref_incident: incidentId, 
                    ref_pacient: finalPacientId,
                    edat: edat || null,
                    sexe: sexe || null,
                    centro_id: centroId
                }])
                .select()
                .single();
            
            if (error) throw error;

            const pacientObj = finalPacientId ? pacientes.find((p: any) => p.id === finalPacientId) : null;
            setIncidentes(prev => prev.map(inc => {
                if (inc.id === incidentId) {
                    return {
                        ...inc,
                        afectat: [...inc.afectat, { ...data, pacient: pacientObj }]
                    };
                }
                return inc;
            }));
        } catch (err: any) {
            alert("Error al añadir afectado: " + err.message);
        }
    };

    // Eliminar Afectado
    const handleRemoveAfectat = async (incidentId: string, afectatId: string) => {
        try {
            const { error } = await supabase.from("afectat").delete().eq("id", afectatId);
            if (error) throw error;

            setIncidentes(prev => prev.map(inc => {
                if (inc.id === incidentId) {
                    return {
                        ...inc,
                        afectat: inc.afectat.filter((af: any) => af.id !== afectatId)
                    };
                }
                return inc;
            }));
        } catch (err: any) {
            alert("Error al eliminar afectado: " + err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Incidentes Clínicos (ECE)</h2>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? "Cancelar" : "+ Nuevo Incidente"}
                </Button>
            </div>

            {isCreating && (
                <Card className="animate-in fade-in slide-in-from-top-4 duration-300 border-primary/20 shadow-md">
                    <form onSubmit={handleCreate}>
                        <CardHeader>
                            <CardTitle>Crear Nuevo Incidente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Motivo / Tipo de Incidente</Label>
                                    <Input required value={motiu} onChange={(e) => setMotiu(e.target.value)} placeholder="Ej. Accidente de tráfico múltiple" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Localización</Label>
                                    <Input value={localitzacio} onChange={(e) => setLocalitzacio(e.target.value)} placeholder="Ej. Autopista AP-7 Km 120" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3 pt-4 border-t mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading || !motiu}>
                                {loading ? "Guardando..." : "Guardar Incidente"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {incidentes.map(inc => (
                    <Card key={inc.id} className="hover:border-primary/50 transition-colors flex flex-col">
                        <CardHeader className="pb-3 border-b relative group">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8" 
                                    onClick={() => {
                                        setEditingIncident(inc);
                                        setEditMotiu(inc.motiu || "");
                                        setEditLocalitzacio(inc.localitzacio || "");
                                    }}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <ConfirmDialog
                                    title="Eliminar Incidente"
                                    description="¿Estás seguro de que deseas eliminar este incidente? Se borrarán en cascada todos los afectados y recursos asignados a él."
                                    onConfirm={() => handleDeleteIncident(inc.id)}
                                >
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </ConfirmDialog>
                            </div>
                            
                            <CardTitle className="text-xl pr-16 line-clamp-2">{inc.motiu || "Incidente sin motivo"}</CardTitle>
                            <CardDescription className="flex flex-col gap-1 mt-2">
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {inc.localitzacio || "No especificada"}</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(inc.timestamp).toLocaleString()}</span>
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="pt-4 flex-1">
                            <div className="space-y-6">
                                {/* Recursos */}
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center justify-between text-muted-foreground">
                                        Recursos Asignados
                                        <AddRecursDialog recursos={recursos} onAdd={(recId) => handleAddRecurs(inc.id, recId)} />
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {inc.incident_recurs?.length > 0 ? (
                                            inc.incident_recurs.map((ir: any, idx: number) => (
                                                <Badge key={idx} variant="secondary" className="flex items-center gap-1 pr-1">
                                                    {ir.recurs?.codi_recurs}
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-4 w-4 rounded-full ml-1 hover:bg-destructive/20 hover:text-destructive"
                                                        onClick={() => handleRemoveRecurs(inc.id, ir.ref_recurs)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Ningún recurso asignado</span>
                                        )}
                                    </div>
                                </div>

                                {/* Afectados */}
                                <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center justify-between text-muted-foreground">
                                        Afectados
                                        <AddAfectatDialog pacientes={pacientes} onAdd={(pacId, edat, sexe) => handleAddAfectat(inc.id, pacId, edat, sexe)} />
                                    </h4>
                                    <div className="flex flex-col gap-2">
                                        {inc.afectat?.length > 0 ? (
                                            inc.afectat.map((af: any) => (
                                                <div key={af.id} className="relative group/afectado flex items-center">
                                                    <Link href={`/dashboard/ece/afectados/${af.id}`} className="flex-1 flex flex-col p-3 rounded-md bg-accent/50 hover:bg-accent border transition-colors pr-10">
                                                        <span className="font-medium group-hover/afectado:text-primary transition-colors">
                                                            {af.pacient ? `${af.pacient.nom} ${af.pacient.cognoms}` : "Afectado No Identificado"}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground flex gap-2">
                                                            {af.edat && <span>Edad: {af.edat}</span>}
                                                            {af.sexe && <span>Sexo: {af.sexe}</span>}
                                                        </span>
                                                    </Link>
                                                    <ConfirmDialog
                                                        title="Eliminar Afectado"
                                                        description="¿Estás seguro? Esta acción borrará a este afectado de este incidente y también todos los informes clínicos asociados a él. El paciente original NO será eliminado del sistema."
                                                        onConfirm={() => handleRemoveAfectat(inc.id, af.id)}
                                                    >
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="absolute right-2 h-8 w-8 opacity-0 group-hover/afectado:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </ConfirmDialog>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No hay afectados registrados</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                
                {incidentes.length === 0 && !isCreating && (
                    <div className="col-span-full text-center p-12 bg-card/50 border border-dashed rounded-lg text-muted-foreground">
                        No hay incidentes creados. Pulsa "Nuevo Incidente" para empezar.
                    </div>
                )}
            </div>

            <Dialog open={!!editingIncident} onOpenChange={(open) => !open && setEditingIncident(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Incidente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Motivo / Tipo de Incidente</Label>
                            <Input required value={editMotiu} onChange={(e) => setEditMotiu(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Localización</Label>
                            <Input value={editLocalitzacio} onChange={(e) => setEditLocalitzacio(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingIncident(null)}>Cancelar</Button>
                        <Button onClick={handleEditIncident} disabled={loading || !editMotiu}>Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function AddRecursDialog({ recursos, onAdd }: { recursos: any[], onAdd: (id: string) => void }) {
    const [selected, setSelected] = useState("");
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2"><PackagePlus className="w-3 h-3 mr-1"/> Añadir</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Asignar Recurso</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Selecciona el recurso</Label>
                        <Select value={selected} onValueChange={setSelected}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar recurso..." />
                            </SelectTrigger>
                            <SelectContent>
                                {recursos.map(r => (
                                    <SelectItem key={r.id} value={r.id}>{r.codi_recurs}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button 
                        onClick={() => {
                            onAdd(selected);
                            setOpen(false);
                            setSelected("");
                        }}
                        disabled={!selected}
                        className="w-full"
                    >
                        Asignar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function AddAfectatDialog({ pacientes, onAdd }: { pacientes: any[], onAdd: (id: string, edat: string, sexe: string) => void }) {
    const [selected, setSelected] = useState("");
    const [edat, setEdat] = useState("");
    const [sexe, setSexe] = useState("");
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2"><UserPlus className="w-3 h-3 mr-1"/> Añadir</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Afectado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Paciente (Opcional)</Label>
                        <Select value={selected} onValueChange={setSelected}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar paciente..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none" className="text-muted-foreground italic">Sin identificar / Anónimo</SelectItem>
                                {pacientes.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.nom} {p.cognoms} {p.dni ? `(${p.dni})` : ''}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Edad</Label>
                            <Input value={edat} onChange={e => setEdat(e.target.value)} placeholder="Ej. 45" />
                        </div>
                        <div className="space-y-2">
                            <Label>Sexo</Label>
                            <Select value={sexe} onValueChange={setSexe}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Hombre">Hombre</SelectItem>
                                    <SelectItem value="Mujer">Mujer</SelectItem>
                                    <SelectItem value="Otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button 
                        onClick={() => {
                            onAdd(selected, edat, sexe);
                            setOpen(false);
                            setSelected("");
                            setEdat("");
                            setSexe("");
                        }}
                        className="w-full mt-4"
                    >
                        Vincular al Incidente
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
