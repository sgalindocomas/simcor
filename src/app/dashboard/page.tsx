import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import Link from "next/link";
import { Monitor, Stethoscope, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardSelectorPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const rawRole = profile?.role || user.user_metadata?.role;
    const role = String(rawRole).toLowerCase().trim();

    if (role === "alumno") {
        return redirect("/access-denied");
    }

    if (role === "centro") {
        return redirect("/dashboard/monitor");
    }

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-16 items-center justify-between px-6 max-w-[1400px] mx-auto w-full">
                    <div className="flex items-center gap-2">
                        <Monitor className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">Simcor</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <LanguageSelector />
                        <ThemeToggle />
                        <form action="/auth/signout" method="post">
                            <Button variant="ghost" size="icon" type="submit" title="Cerrar sesión">
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-[1000px] mx-auto flex-1 flex flex-col items-center justify-center gap-12 py-16 px-4">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold tracking-tight">Selecciona una aplicación</h2>
                    <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                        Elige el módulo al que deseas acceder según tu perfil y la tarea que vas a realizar.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <Link href="/dashboard/monitor" className="group block focus:outline-none">
                        <Card className="h-full border-2 border-transparent transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/5 bg-card/60 backdrop-blur-sm group-hover:bg-card">
                            <CardContent className="flex flex-col items-center justify-center p-12 gap-8 text-center">
                                <div className="p-6 bg-primary/10 rounded-3xl group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                                    <Monitor className="w-16 h-16 text-primary" />
                                </div>
                                <div className="space-y-3">
                                    <CardTitle className="text-3xl font-bold">Monitor</CardTitle>
                                    <CardDescription className="text-base font-medium">
                                        Panel de control centralizado. Gestión de escenarios de simulación, alumnos y registros.
                                    </CardDescription>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/dashboard/ece" className="group block focus:outline-none">
                        <Card className="h-full border-2 border-transparent transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/5 bg-card/60 backdrop-blur-sm group-hover:bg-card">
                            <CardContent className="flex flex-col items-center justify-center p-12 gap-8 text-center">
                                <div className="p-6 bg-primary/10 rounded-3xl group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                                    <Stethoscope className="w-16 h-16 text-primary" />
                                </div>
                                <div className="space-y-3">
                                    <CardTitle className="text-3xl font-bold">ECE</CardTitle>
                                    <CardDescription className="text-base font-medium">
                                        Evaluación Clínica Estructurada. Registro de incidentes y seguimiento de competencias.
                                    </CardDescription>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </main>
        </div>
    );
}
