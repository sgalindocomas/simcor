"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useI18n } from "@/i18n/i18n-context";
import { User, Plus, Search, Trash2, GraduationCap, X, CheckCircle2, AlertCircle } from "lucide-react";

interface ProfessorItem {
    id: string;
    email: string;
    full_name: string;
    department?: string | null;
    employee_number?: string | null;
    created_at?: string;
}

interface ProfessorManagementProps {
    centerId: string;
}

export function ProfessorManagement({ centerId }: ProfessorManagementProps) {
    const { t } = useI18n();
    const supabase = createClient();

    const [professors, setProfessors] = useState<ProfessorItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form states for new professor
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [employeeNumber, setEmployeeNumber] = useState("");
    const [department, setDepartment] = useState("");
    
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    const fetchProfessors = useCallback(async () => {
        setLoading(true);
        try {
            // Consulta de los alumnos vinculados a este centro mediante la vista o join
            const { data, error } = await supabase
                .from("professors")
                .select(`
                    id,
                    department,
                    employee_number,
                    created_at,
                    profiles:id (
                        email,
                        full_name
                    )
                `)
                .eq("center_id", centerId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error cargando profesores:", error);
            } else if (data) {
                const formatted: ProfessorItem[] = data.map((item: any) => ({
                    id: item.id,
                    email: item.profiles?.email || "",
                    full_name: item.profiles?.full_name || "Profesor",
                    department: item.department,
                    employee_number: item.employee_number,
                    created_at: item.created_at,
                }));
                setProfessors(formatted);
            }
        } catch (err) {
            console.error("Excepción al cargar profesores:", err);
        } finally {
            setLoading(false);
        }
    }, [centerId, supabase]);

    useEffect(() => {
        if (centerId) {
            fetchProfessors();
        }
    }, [centerId, fetchProfessors]);

    const handleEnrollProfessor = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError(null);
        setFormSuccess(null);

        try {
            const res = await fetch("/api/professors/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName,
                    employee_number: employeeNumber,
                    department,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                setFormError(result.error || "Error al inscribir profesor");
            } else {
                setFormSuccess("Profesor inscrito correctamente");
                // Limpiar campos
                setFullName("");
                setEmail("");
                setPassword("");
                setEmployeeNumber("");
                setDepartment("");
                fetchProfessors();
                setTimeout(() => {
                    setIsModalOpen(false);
                    setFormSuccess(null);
                }, 1500);
            }
        } catch (err: any) {
            setFormError(err.message || "Error al inscribir profesor");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteProfessor = async (professorId: string) => {
        if (!confirm("¿Seguro que deseas eliminar a este profesor?")) return;

        try {
            const { error } = await supabase
                .from("professors")
                .delete()
                .eq("id", professorId)
                .eq("center_id", centerId);

            if (error) {
                alert("Error al borrar profesor: " + error.message);
            } else {
                fetchProfessors();
            }
        } catch (err: any) {
            alert("Error al borrar profesor: " + err.message);
        }
    };

    const filteredProfessors = professors.filter((s) => {
        const query = searchTerm.toLowerCase();
        return (
            s.full_name.toLowerCase().includes(query) ||
            s.email.toLowerCase().includes(query) ||
            (s.employee_number && s.employee_number.toLowerCase().includes(query))
        );
    });

    return (
        <div className="space-y-6">
            {/* Encabezado y botón de acción */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-xl ring-1 ring-border/50 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold tracking-tight">Gestión de Profesores</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Añade y gestiona los profesores/instructores de tu centro.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                >
                    <Plus className="h-4 w-4" />
                    Registrar Profesor
                </button>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Buscar profesor por nombre, email o identificador..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-foreground bg-card ring-1 ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-primary text-sm shadow-sm"
                />
            </div>

            {/* Tabla de Profesores */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Cargando lista de profesores...
                    </div>
                ) : filteredProfessors.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                        <User className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                        <p className="text-base font-medium text-foreground">No hay profesores registrados</p>
                        <p className="text-xs text-muted-foreground">
                            Utiliza el botón de arriba para registrar al primer profesor en tu centro.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                                <tr>
                                    <th className="px-6 py-3.5">Nombre</th>
                                    <th className="px-6 py-3.5">Email</th>
                                    <th className="px-6 py-3.5">Departamento</th>
                                    <th className="px-6 py-3.5">Identificador</th>
                                    <th className="px-6 py-3.5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredProfessors.map((prof) => (
                                    <tr key={prof.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                    {prof.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{prof.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{prof.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                {prof.department || "Sin asignar"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{prof.employee_number || "-"}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteProfessor(prof.id)}
                                                className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                                                title="Eliminar profesor"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Inscripción de Alumno */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-xl ring-1 ring-border/50 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold tracking-tight">Registrar Profesor</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Crea una nueva cuenta de profesor para este centro.
                            </p>
                        </div>

                        {formSuccess && (
                            <div className="mb-4 rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>{formSuccess}</span>
                            </div>
                        )}

                        {formError && (
                            <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleEnrollProfessor} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium leading-6">
                                    Nombre Completo <span className="text-destructive">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Carlos Ramírez"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 bg-background ring-1 ring-inset ring-border text-sm focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium leading-6">
                                        Email <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="profesor@ejemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 bg-background ring-1 ring-inset ring-border text-sm focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium leading-6">
                                        Contraseña <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="Contraseña inicial"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 bg-background ring-1 ring-inset ring-border text-sm focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium leading-6">
                                        Departamento
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Sanidad"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 bg-background ring-1 ring-inset ring-border text-sm focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium leading-6">
                                        Identificador de Empleado
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: PRF-2024-04"
                                        value={employeeNumber}
                                        onChange={(e) => setEmployeeNumber(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 bg-background ring-1 ring-inset ring-border text-sm focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>



                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-md px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                                >
                                    {submitting ? "Inscribiendo..." : "Inscribir Profesor"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
