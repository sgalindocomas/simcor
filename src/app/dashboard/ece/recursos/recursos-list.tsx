"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";

type Recurs = {
    id: string;
    codi_recurs: string;
};

export function RecursosList({ initialRecursos, centroId }: { initialRecursos: Recurs[], centroId: string | null }) {
    const [recursos, setRecursos] = useState<Recurs[]>(initialRecursos);
    const [isCreating, setIsCreating] = useState(false);
    const [prefix, setPrefix] = useState("R");
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Estados de edición
    const [editingRecurso, setEditingRecurso] = useState<Recurs | null>(null);
    const [editCodi, setEditCodi] = useState("");

    const supabase = createClient();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const start = parseInt(rangeStart);
        const end = parseInt(rangeEnd);
        
        if (isNaN(start) || isNaN(end) || start > end) {
            alert("Rango no válido");
            return;
        }

        setLoading(true);
        try {
            const inserts = [];
            for (let i = start; i <= end; i++) {
                inserts.push({ codi_recurs: `${prefix}${i}`, centro_id: centroId });
            }

            const { data, error } = await supabase
                .from("recurs")
                .insert(inserts)
                .select();

            if (error) throw error;
            if (data) {
                setRecursos([...data, ...recursos]);
                setIsCreating(false);
                setRangeStart("");
                setRangeEnd("");
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!editingRecurso) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from("recurs")
                .update({ codi_recurs: editCodi })
                .eq("id", editingRecurso.id);

            if (error) throw error;
            
            setRecursos(recursos.map(r => r.id === editingRecurso.id ? { ...r, codi_recurs: editCodi } : r));
            setEditingRecurso(null);
        } catch (err: any) {
            alert("Error al editar: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("recurs")
                .delete()
                .eq("id", id);
            
            if (error) throw error;
            setRecursos(recursos.filter(r => r.id !== id));
        } catch (err: any) {
            alert("Error al eliminar: " + err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Registro de Recursos</h2>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? "Cancelar" : "+ Nuevo Recurso"}
                </Button>
            </div>

            {isCreating && (
                <Card className="animate-in fade-in slide-in-from-top-4 duration-300 border-primary/20 shadow-md">
                    <form onSubmit={handleCreate}>
                        <CardHeader>
                            <CardTitle>Crear Recurso</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                                <div className="space-y-2 flex-1">
                                    <Label>Prefijo (ej. R)</Label>
                                    <Input required value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="Ej. R" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label>Rango Inicial</Label>
                                    <Input type="number" required value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} placeholder="Ej. 411" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label>Rango Final</Label>
                                    <Input type="number" required value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} placeholder="Ej. 435" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-start gap-3 pt-4 border-t mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading || !rangeStart || !rangeEnd}>
                                {loading ? "Generando..." : "Generar Recursos"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                {recursos.map(r => (
                    <Card key={r.id} className="hover:border-primary/50 transition-colors flex flex-col p-6 bg-card/60 relative group">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => {
                                    setEditingRecurso(r);
                                    setEditCodi(r.codi_recurs);
                                }}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <ConfirmDialog
                                title="Eliminar recurso"
                                description="¿Estás seguro de que deseas eliminar este recurso? Esta acción no se puede deshacer y desvinculará este recurso de todos los incidentes."
                                onConfirm={() => handleDelete(r.id)}
                            >
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </ConfirmDialog>
                        </div>
                        <span className="text-xl font-bold tracking-wider m-auto mt-4">{r.codi_recurs}</span>
                    </Card>
                ))}
                
                {recursos.length === 0 && !isCreating && (
                    <div className="col-span-full text-center p-12 bg-card/50 border border-dashed rounded-lg text-muted-foreground">
                        No hay recursos registrados actualmente.
                    </div>
                )}
            </div>

            <Dialog open={!!editingRecurso} onOpenChange={(open) => !open && setEditingRecurso(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Recurso</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Código de Recurso</Label>
                            <Input 
                                value={editCodi} 
                                onChange={(e) => setEditCodi(e.target.value)} 
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingRecurso(null)}>Cancelar</Button>
                        <Button onClick={handleEdit} disabled={loading || !editCodi}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
