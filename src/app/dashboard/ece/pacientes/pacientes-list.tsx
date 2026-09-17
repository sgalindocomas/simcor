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
    cip: string | null;
    data_naixement: string | null;
    adreca: string | null;
    telefon: string | null;
    correu_electronic: string | null;
    farmacos: string[] | null;
};

export function PacientesList({ initialPacientes, centroId }: { initialPacientes: Pacient[], centroId: string | null }) {
    const [pacientes, setPacientes] = useState<Pacient[]>(initialPacientes);
    const [isCreating, setIsCreating] = useState(false);
    const [nom, setNom] = useState("");
    const [cognoms, setCognoms] = useState("");
    const [dni, setDni] = useState("");
    const [cip, setCip] = useState("");
    const [dataNaixement, setDataNaixement] = useState("");
    const [adreca, setAdreca] = useState("");
    const [telefon, setTelefon] = useState("");
    const [correuElectronic, setCorreuElectronic] = useState("");
    const [farmacos, setFarmacos] = useState<string[]>([]);
    const [newFarmaco, setNewFarmaco] = useState("");
    const [loading, setLoading] = useState(false);

    // Estados de edición
    const [editingPaciente, setEditingPaciente] = useState<Pacient | null>(null);
    const [editNom, setEditNom] = useState("");
    const [editCognoms, setEditCognoms] = useState("");
    const [editDni, setEditDni] = useState("");
    const [editCip, setEditCip] = useState("");
    const [editDataNaixement, setEditDataNaixement] = useState("");
    const [editAdreca, setEditAdreca] = useState("");
    const [editTelefon, setEditTelefon] = useState("");
    const [editCorreuElectronic, setEditCorreuElectronic] = useState("");
    const [editFarmacos, setEditFarmacos] = useState<string[]>([]);
    const [editNewFarmaco, setEditNewFarmaco] = useState("");

    const supabase = createClient();

    const addFarmaco = () => {
        if (newFarmaco.trim()) {
            setFarmacos([...farmacos, newFarmaco.trim()]);
            setNewFarmaco("");
        }
    };

    const removeFarmaco = (index: number) => {
        setFarmacos(farmacos.filter((_, i) => i !== index));
    };

    const addEditFarmaco = () => {
        if (editNewFarmaco.trim()) {
            setEditFarmacos([...editFarmacos, editNewFarmaco.trim()]);
            setEditNewFarmaco("");
        }
    };

    const removeEditFarmaco = (index: number) => {
        setEditFarmacos(editFarmacos.filter((_, i) => i !== index));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newPacientData = {
                nom,
                cognoms,
                dni,
                cip,
                data_naixement: dataNaixement || null,
                adreca,
                telefon,
                correu_electronic: correuElectronic,
                farmacos,
                ref_centre: centroId
            };

            const { data, error } = await supabase
                .from("pacient")
                .insert([newPacientData])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setPacientes([data, ...pacientes]);
                setIsCreating(false);
                setNom("");
                setCognoms("");
                setDni("");
                setCip("");
                setDataNaixement("");
                setAdreca("");
                setTelefon("");
                setCorreuElectronic("");
                setFarmacos([]);
                setNewFarmaco("");
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
            const updateData = {
                nom: editNom,
                cognoms: editCognoms,
                dni: editDni,
                cip: editCip,
                data_naixement: editDataNaixement || null,
                adreca: editAdreca,
                telefon: editTelefon,
                correu_electronic: editCorreuElectronic,
                farmacos: editFarmacos
            };

            const { error } = await supabase
                .from("pacient")
                .update(updateData)
                .eq("id", editingPaciente.id);

            if (error) throw error;
            
            setPacientes(pacientes.map(p => p.id === editingPaciente.id ? { ...p, ...updateData } : p));
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
                                <div className="space-y-2">
                                    <Label>CIP</Label>
                                    <Input value={cip} onChange={(e) => setCip(e.target.value)} placeholder="Código de Identificación Personal" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha de Nacimiento</Label>
                                    <Input type="date" value={dataNaixement} onChange={(e) => setDataNaixement(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Teléfono</Label>
                                    <Input type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="Ej. 600000000" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Correo Electrónico</Label>
                                    <Input type="email" value={correuElectronic} onChange={(e) => setCorreuElectronic(e.target.value)} placeholder="correo@ejemplo.com" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Dirección</Label>
                                    <Input value={adreca} onChange={(e) => setAdreca(e.target.value)} placeholder="Ej. Calle Principal 123" />
                                </div>
                                
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Fármacos</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            value={newFarmaco} 
                                            onChange={(e) => setNewFarmaco(e.target.value)} 
                                            placeholder="Ej. Paracetamol"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addFarmaco();
                                                }
                                            }}
                                        />
                                        <Button type="button" onClick={addFarmaco} variant="secondary">Añadir</Button>
                                    </div>
                                    {farmacos.length > 0 && (
                                        <ul className="mt-2 space-y-1">
                                            {farmacos.map((farmaco, idx) => (
                                                <li key={idx} className="flex justify-between items-center bg-muted/50 px-3 py-1 rounded-md text-sm">
                                                    {farmaco}
                                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFarmaco(idx)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
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

            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm mt-6">
                {pacientes.length === 0 && !isCreating ? (
                    <div className="p-12 text-center text-muted-foreground">
                        No hay pacientes registrados actualmente. Añade tu primer paciente.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                                <tr>
                                    <th className="px-6 py-3.5">Paciente</th>
                                    <th className="px-6 py-3.5">Identificación</th>
                                    <th className="px-6 py-3.5">Contacto</th>
                                    <th className="px-6 py-3.5">Fármacos</th>
                                    <th className="px-6 py-3.5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {pacientes.map((p) => (
                                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                    {(p.nom ? p.nom.charAt(0) : "P").toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{p.nom} {p.cognoms}</span>
                                                    {p.data_naixement && <span className="text-xs text-muted-foreground font-normal">Nac: {new Date(p.data_naixement).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {p.dni && <div className="text-xs">DNI: {p.dni}</div>}
                                            {p.cip && <div className="text-xs">CIP: {p.cip}</div>}
                                            {!p.dni && !p.cip && "-"}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {p.telefon && <div className="text-xs">Tel: {p.telefon}</div>}
                                            {p.correu_electronic && <div className="text-xs">Email: {p.correu_electronic}</div>}
                                            {p.adreca && <div className="text-xs truncate max-w-[150px]" title={p.adreca}>Dir: {p.adreca}</div>}
                                            {!p.telefon && !p.correu_electronic && !p.adreca && "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.farmacos && p.farmacos.length > 0 ? (
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {p.farmacos.map((f, i) => (
                                                        <span key={i} className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">{f}</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground" 
                                                    onClick={() => {
                                                        setEditingPaciente(p);
                                                        setEditNom(p.nom || "");
                                                        setEditCognoms(p.cognoms || "");
                                                        setEditDni(p.dni || "");
                                                        setEditCip(p.cip || "");
                                                        setEditDataNaixement(p.data_naixement || "");
                                                        setEditAdreca(p.adreca || "");
                                                        setEditTelefon(p.telefon || "");
                                                        setEditCorreuElectronic(p.correu_electronic || "");
                                                        setEditFarmacos(p.farmacos || []);
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Dialog open={!!editingPaciente} onOpenChange={(open) => !open && setEditingPaciente(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Paciente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input required value={editNom} onChange={(e) => setEditNom(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Apellidos</Label>
                                <Input value={editCognoms} onChange={(e) => setEditCognoms(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>DNI/NIE</Label>
                                <Input value={editDni} onChange={(e) => setEditDni(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>CIP</Label>
                                <Input value={editCip} onChange={(e) => setEditCip(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de Nacimiento</Label>
                                <Input type="date" value={editDataNaixement} onChange={(e) => setEditDataNaixement(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Teléfono</Label>
                                <Input type="tel" value={editTelefon} onChange={(e) => setEditTelefon(e.target.value)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Correo Electrónico</Label>
                                <Input type="email" value={editCorreuElectronic} onChange={(e) => setEditCorreuElectronic(e.target.value)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Dirección</Label>
                                <Input value={editAdreca} onChange={(e) => setEditAdreca(e.target.value)} />
                            </div>
                            
                            <div className="space-y-2 md:col-span-2">
                                <Label>Fármacos</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        value={editNewFarmaco} 
                                        onChange={(e) => setEditNewFarmaco(e.target.value)} 
                                        placeholder="Ej. Paracetamol"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addEditFarmaco();
                                            }
                                        }}
                                    />
                                    <Button type="button" onClick={addEditFarmaco} variant="secondary">Añadir</Button>
                                </div>
                                {editFarmacos.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {editFarmacos.map((farmaco, idx) => (
                                            <li key={idx} className="flex justify-between items-center bg-muted/50 px-3 py-1 rounded-md text-sm">
                                                {farmaco}
                                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeEditFarmaco(idx)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
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
