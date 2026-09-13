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

type Pacient = {
    id: string;
    nom: string | null;
    cognoms: string | null;
    dni: string | null;
    edat: string | null;
    sexe: string | null;
};

export function PacientesList({ initialPacientes, centroId }: { initialPacientes: Pacient[], centroId: string | null }) {
    const [pacientes, setPacientes] = useState<Pacient[]>(initialPacientes);
    const [isCreating, setIsCreating] = useState(false);
    const [nom, setNom] = useState("");
    const [cognoms, setCognoms] = useState("");
    const [dni, setDni] = useState("");
    const [loading, setLoading] = useState(false);

    // Estados de edición
    const [editingPaciente, setEditingPaciente] = useState<Pacient | null>(null);
    const [editNom, setEditNom] = useState("");
    const [editCognoms, setEditCognoms] = useState("");
    const [editDni, setEditDni] = useState("");

    const supabase = createClient();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("pacient")
                .insert([{ nom, cognoms, dni, ref_centre: centroId }])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setPacientes([data, ...pacientes]);
                setIsCreating(false);
                setNom("");
                setCognoms("");
                setDni("");
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!editingPaciente) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from("pacient")
                .update({ nom: editNom, cognoms: editCognoms, dni: editDni })
                .eq("id", editingPaciente.id);

            if (error) throw error;
            
            setPacientes(pacientes.map(p => p.id === editingPaciente.id ? { ...p, nom: editNom, cognoms: editCognoms, dni: editDni } : p));
            setEditingPaciente(null);
        } catch (err: any) {
            alert("Error al editar: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("pacient")
                .delete()
                .eq("id", id);
            
            if (error) throw error;
            setPacientes(pacientes.filter(p => p.id !== id));
        } catch (err: any) {
            alert("Error al eliminar: " + err.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Registro de Pacientes</h2>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? "Cancelar" : "+ Nuevo Paciente"}
                </Button>
            </div>

            {isCreating && (
                <Card className="animate-in fade-in slide-in-from-top-4 duration-300 border-primary/20 shadow-md">
                    <form onSubmit={handleCreate}>
                        <CardHeader>
                            <CardTitle>Crear Paciente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nombre</Label>
                                    <Input required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ej. Juan" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Apellidos</Label>
                                    <Input value={cognoms} onChange={(e) => setCognoms(e.target.value)} placeholder="Ej. Pérez" />
                                </div>
                                <div className="space-y-2">
                                    <Label>DNI/NIE</Label>
                                    <Input value={dni} onChange={(e) => setDni(e.target.value)} placeholder="Documento de identidad" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3 pt-4 border-t mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading || !nom}>
                                {loading ? "Guardando..." : "Guardar Paciente"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {pacientes.map(p => (
                    <Card key={p.id} className="hover:border-primary/50 transition-colors relative group">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => {
                                    setEditingPaciente(p);
                                    setEditNom(p.nom || "");
                                    setEditCognoms(p.cognoms || "");
                                    setEditDni(p.dni || "");
                                }}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <ConfirmDialog
                                title="Eliminar paciente"
                                description="¿Estás seguro de que deseas eliminar este paciente? El paciente se desvinculará de todos los incidentes a los que estaba asignado."
                                onConfirm={() => handleDelete(p.id)}
                            >
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </ConfirmDialog>
                        </div>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xl pr-12">{p.nom} {p.cognoms}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                <span><strong>DNI:</strong> {p.dni || "No especificado"}</span>
                                {p.edat && <span><strong>Edad:</strong> {p.edat}</span>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                
                {pacientes.length === 0 && !isCreating && (
                    <div className="col-span-full text-center p-12 bg-card/50 border border-dashed rounded-lg text-muted-foreground">
                        No hay pacientes registrados actualmente. Añade tu primer paciente.
                    </div>
                )}
            </div>

            <Dialog open={!!editingPaciente} onOpenChange={(open) => !open && setEditingPaciente(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Paciente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input required value={editNom} onChange={(e) => setEditNom(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Apellidos</Label>
                                <Input value={editCognoms} onChange={(e) => setEditCognoms(e.target.value)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>DNI/NIE</Label>
                                <Input value={editDni} onChange={(e) => setEditDni(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingPaciente(null)}>Cancelar</Button>
                        <Button onClick={handleEdit} disabled={loading || !editNom}>Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
