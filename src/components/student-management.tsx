"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useI18n } from "@/i18n/i18n-context";
import { User, Plus, Search, Trash2, GraduationCap, X, CheckCircle2, AlertCircle } from "lucide-react";

interface StudentItem {
    id: string;
    email: string;
    full_name: string;
    department?: string | null;
    course_group?: string | null;
    student_code?: string | null;
    created_at?: string;
}

interface StudentManagementProps {
    centerId: string;
}

export function StudentManagement({ centerId }: StudentManagementProps) {
    const { t } = useI18n();
    const supabase = createClient();

    const [students, setStudents] = useState<StudentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form states for new student
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [courseGroup, setCourseGroup] = useState("");
    const [studentCode, setStudentCode] = useState("");
    const [department, setDepartment] = useState("");
    
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            // Consulta de los alumnos vinculados a este centro mediante la vista o join
            const { data, error } = await supabase
                .from("students")
                .select(`
                    id,
                    department,
                    course_group,
                    student_code,
                    created_at,
                    profiles:id (
                        email,
                        full_name
                    )
                `)
                .eq("center_id", centerId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error cargando alumnos:", error);
            } else if (data) {
                const formatted: StudentItem[] = data.map((item: any) => ({
                    id: item.id,
                    email: item.profiles?.email || "",
                    full_name: item.profiles?.full_name || "Alumno",
                    department: item.department,
                    course_group: item.course_group,
                    student_code: item.student_code,
                    created_at: item.created_at,
                }));
                setStudents(formatted);
            }
        } catch (err) {
            console.error("Excepción al cargar alumnos:", err);
        } finally {
            setLoading(false);
        }
    }, [centerId, supabase]);

    useEffect(() => {
        if (centerId) {
            fetchStudents();
        }
    }, [centerId, fetchStudents]);

    const [invitationLink, setInvitationLink] = useState<string | null>(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteDepartment, setInviteDepartment] = useState("");
    const [inviteCourseGroup, setInviteCourseGroup] = useState("");
    const [inviteHours, setInviteHours] = useState("48");
    const [generatingLink, setGeneratingLink] = useState(false);

    const handleGenerateLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneratingLink(true);
        try {
            const res = await fetch("/api/students/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    department: inviteDepartment,
                    courseGroup: inviteCourseGroup,
                    expiresInHours: parseInt(inviteHours)
                }),
            });
            const data = await res.json();
            if (res.ok && data.token) {
                const origin = window.location.origin;
                setInvitationLink(`${origin}/register-student?token=${data.token}`);
            } else {
                alert(data.error || "Error al generar enlace");
            }
        } catch (error) {
            console.error("Error al generar enlace", error);
            alert("Error al generar enlace");
        } finally {
            setGeneratingLink(false);
        }
    };

    const handleEnrollStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setFormError("Las contraseñas no coinciden.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setFormError("Por favor, introduce un correo electrónico válido.");
            return;
        }

        setSubmitting(true);
        setFormError(null);
        setFormSuccess(null);

        try {
            const res = await fetch("/api/students/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName,
                    course_group: courseGroup,
                    student_code: studentCode,
                    department,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                setFormError(result.error || t('students.errorEnroll'));
            } else {
                setFormSuccess(t('students.successEnroll'));
                // Limpiar campos
                setFullName("");
                setEmail("");
                setPassword("");
                setCourseGroup("");
                setStudentCode("");
                setDepartment("");
                fetchStudents();
                setTimeout(() => {
                    setIsModalOpen(false);
                    setFormSuccess(null);
                }, 1500);
            }
        } catch (err: any) {
            setFormError(err.message || t('students.errorEnroll'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (!confirm(t('students.deleteConfirm'))) return;

        try {
            // Eliminar de la tabla students (por cascada borra el perfil si está configurado o elimina la asociación)
            const { error } = await supabase
                .from("students")
                .delete()
                .eq("id", studentId)
                .eq("center_id", centerId);

            if (error) {
                alert("Error al borrar alumno: " + error.message);
            } else {
                fetchStudents();
            }
        } catch (err: any) {
            alert("Error al borrar alumno: " + err.message);
        }
    };

    const filteredStudents = students.filter((s) => {
        const query = searchTerm.toLowerCase();
        return (
            s.full_name.toLowerCase().includes(query) ||
            s.email.toLowerCase().includes(query) ||
            (s.course_group && s.course_group.toLowerCase().includes(query)) ||
            (s.student_code && s.student_code.toLowerCase().includes(query))
        );
    });

    return (
        <div className="space-y-6">
            {/* Encabezado y botón de acción */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-xl ring-1 ring-border/50 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold tracking-tight">{t('students.title')}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t('students.description')}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold shadow-sm hover:bg-muted active:scale-95 transition-all duration-200"
                    >
                        Generar enlace
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                    >
                        <Plus className="h-4 w-4" />
                        {t('students.enrollBtn')}
                    </button>
                </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Buscar alumno por nombre, email, curso o matrícula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-foreground bg-card ring-1 ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-primary text-sm shadow-sm"
                />
            </div>

            {/* Tabla de Alumnos */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Cargando lista de alumnos...
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                        <User className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                        <p className="text-base font-medium text-foreground">{t('students.noStudents')}</p>
                        <p className="text-xs text-muted-foreground">
                            Utiliza el botón de arriba para registrar al primer alumno en tu centro.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                                <tr>
                                    <th className="px-6 py-3.5">{t('students.fullName')}</th>
                                    <th className="px-6 py-3.5">{t('students.email')}</th>
                                    <th className="px-6 py-3.5">{t('students.courseGroup')}</th>
                                    <th className="px-6 py-3.5">{t('students.studentCode')}</th>
                                    <th className="px-6 py-3.5 text-right">{t('students.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                    {student.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{student.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                {student.course_group || "Sin asignar"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{student.student_code || "-"}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteStudent(student.id)}
                                                className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                                                title="Eliminar alumno"
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

            {/* Modal para Generar Enlace */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-xl ring-1 ring-border/50 relative">
                        <button
                            onClick={() => { setIsInviteModalOpen(false); setInvitationLink(null); }}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold tracking-tight">Generar Enlace de Registro</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Crea un enlace temporal para que los alumnos se registren solos en tu centro.
                            </p>
                        </div>

                        {!invitationLink ? (
                            <form onSubmit={handleGenerateLink} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium leading-6">Departamento (opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Enfermería"
                                        value={inviteDepartment}
                                        onChange={(e) => setInviteDepartment(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 bg-background ring-1 ring-inset ring-border text-sm focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium leading-6">Grupo / Curso (opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 1º TES - Grupo A"
                                        value={inviteCourseGroup}
                                        onChange={(e) => setInviteCourseGroup(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 bg-background ring-1 ring-inset ring-border text-sm focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium leading-6">Caducidad</label>
                                    <select
                                        value={inviteHours}
                                        onChange={(e) => setInviteHours(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 bg-background ring-1 ring-inset ring-border text-sm focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="24">24 horas</option>
                                        <option value="48">48 horas</option>
                                        <option value="168">1 semana</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsInviteModalOpen(false)}
                                        className="rounded-md px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={generatingLink}
                                        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                                    >
                                        {generatingLink ? "Generando..." : "Generar enlace"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 rounded-lg bg-muted text-sm break-all font-mono">
                                    {invitationLink}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Copia este enlace y compártelo con tus alumnos. Podrán registrarse y serán añadidos automáticamente a este grupo.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(invitationLink);
                                            alert("Enlace copiado al portapapeles");
                                        }}
                                        className="rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80 transition-all"
                                    >
                                        Copiar enlace
                                    </button>
                                    <button
                                        onClick={() => { setIsInviteModalOpen(false); setInvitationLink(null); }}
                                        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                            <h3 className="text-xl font-bold tracking-tight">{t('students.enrollModalTitle')}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t('students.enrollModalDesc')}
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

                        <form onSubmit={handleEnrollStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium leading-6">
                                    {t('students.fullName')} <span className="text-destructive">*</span>
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
                                        {t('students.email')} <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="alumno@ejemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 bg-background ring-1 ring-inset ring-border text-sm focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium leading-6">
                                        {t('students.password')} <span className="text-destructive">*</span>
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
                                        Repetir Contraseña <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="Repite la contraseña"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`mt-1 block w-full rounded-md border-0 py-1.5 px-3 bg-background ring-1 ring-inset ${confirmPassword && password !== confirmPassword ? "ring-destructive focus:ring-destructive" : "ring-border focus:ring-primary"} text-sm focus:ring-2`}
                                    />
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="text-xs text-destructive mt-1">Las contraseñas no coinciden</p>
                                    )}
                                </div>
                                <div className="hidden sm:block"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium leading-6">
                                        {t('students.courseGroup')}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: 1º TES - Grupo A"
                                        value={courseGroup}
                                        onChange={(e) => setCourseGroup(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 bg-background ring-1 ring-inset ring-border text-sm focus:ring-2 focus:ring-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium leading-6">
                                        {t('students.studentCode')}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: ALU-2024-04"
                                        value={studentCode}
                                        onChange={(e) => setStudentCode(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 bg-background ring-1 ring-inset ring-border text-sm focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium leading-6">
                                    {t('students.department')}
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Sanidad / Urgencias"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 bg-background ring-1 ring-inset ring-border text-sm focus:ring-2 focus:ring-primary"
                                />
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
                                    disabled={submitting || (confirmPassword !== "" && password !== confirmPassword)}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
                                >
                                    {submitting ? t('students.enrolling') : t('students.enrollBtn')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
