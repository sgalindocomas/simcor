"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function RegisterProfessorContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [invitation, setInvitation] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [name, setName] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        if (!token) {
            setError("No se ha proporcionado un enlace de invitación válido.");
            setLoading(false);
            return;
        }

        const fetchInvitation = async () => {
            try {
                const res = await fetch(`/api/professors/invite/${token}`);
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error);
                } else {
                    setInvitation(data);
                }
            } catch (err) {
                setError("Error de conexión al verificar el enlace.");
            } finally {
                setLoading(false);
            }
        };

        fetchInvitation();
    }, [token]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Por favor, introduce un correo electrónico válido.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // 1. Sign up the user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: "profesor",
                        full_name: `${name} ${lastname}`
                    }
                }
            });

            if (authError) throw new Error(authError.message);

            if (!authData.user) {
                throw new Error("No se pudo crear el usuario.");
            }

            // 2. Call the Postgres function to insert professor and profile
            const { error: rpcError } = await supabase.rpc('register_professor_from_invitation', {
                p_invitation_id: token,
                p_name: name,
                p_lastname: lastname
            });

            if (rpcError) {
                throw new Error("Error al completar el registro del perfil de profesor: " + rpcError.message);
            }

            setSuccess(true);
            
            // Redirect to dashboard (since professors CAN log into Simcor)
            setTimeout(() => {
                router.push("/dashboard");
                router.refresh();
            }, 3000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-muted-foreground">Verificando enlace...</div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md text-center p-6 space-y-6">
                    <div className="flex justify-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl">¡Registro completado!</CardTitle>
                    <CardDescription className="text-base">
                        Tu cuenta de profesor ha sido creada correctamente y vinculada al centro.
                    </CardDescription>
                    <div className="bg-muted p-4 rounded-lg text-sm">
                        Redirigiendo a tu panel de control...
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            
            <Card className="w-full max-w-lg z-10 border-border/50 shadow-2xl backdrop-blur-sm bg-card/90">
                <CardHeader className="space-y-4 pb-6 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Users className="w-10 h-10 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">Registro de Profesor</CardTitle>
                    <CardDescription className="text-base">
                        Completa tus datos para acceder a las herramientas docentes de tu centro.
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    {error ? (
                        <div className="space-y-6 text-center">
                            <div className="bg-destructive/10 p-4 rounded-lg text-destructive text-sm font-medium flex flex-col items-center gap-2">
                                <AlertCircle className="h-6 w-6" />
                                {error}
                            </div>
                            <Button asChild className="w-full">
                                <Link href="/">Volver a Simcor</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-6">
                            {/* Información del Centro en solo lectura */}
                            <div className="bg-muted p-4 rounded-lg space-y-2 border border-border/50">
                                <div>
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Centro Educativo</span>
                                    <p className="font-medium text-sm">{invitation?.center?.name}</p>
                                </div>
                                {invitation?.department && (
                                    <div>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Departamento / Especialidad</span>
                                        <p className="font-medium text-sm">{invitation.department}</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Tu nombre"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastname">Apellidos</Label>
                                    <Input
                                        id="lastname"
                                        required
                                        value={lastname}
                                        onChange={(e) => setLastname(e.target.value)}
                                        placeholder="Tus apellidos"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="profesor@ejemplo.com"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Crea una contraseña segura"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Repetir Contraseña</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repite tu contraseña"
                                        aria-invalid={confirmPassword !== "" && password !== confirmPassword}
                                    />
                                    {confirmPassword !== "" && password !== confirmPassword && (
                                        <p className="text-xs text-destructive mt-1">Las contraseñas no coinciden</p>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={submitting || (confirmPassword !== "" && password !== confirmPassword)}>
                                {submitting ? "Creando cuenta..." : "Completar Registro"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function RegisterProfessorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-muted-foreground">Cargando...</div>
            </div>
        }>
            <RegisterProfessorContent />
        </Suspense>
    );
}
