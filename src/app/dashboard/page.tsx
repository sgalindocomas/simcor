import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import Link from "next/link";
import { Monitor, Stethoscope } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardSelectorPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background flex flex-col p-8">
            <header className="flex items-center justify-between mb-8 max-w-[1400px] mx-auto w-full">
                <div className="flex items-center gap-6">
                    <h1 className="text-3xl font-bold tracking-tight">Simcor App</h1>
                </div>
                <div className="flex items-center gap-6">
                    <LanguageSelector />
                    <ThemeToggle />
                </div>
            </header>

            <main className="w-full max-w-[1000px] mx-auto flex-1 flex flex-col items-center justify-center gap-12 mt-16 mb-24">
                <h2 className="text-4xl font-bold tracking-tight text-center">Selecciona una aplicación</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <Link href="/dashboard/monitor" className="group flex flex-col items-center justify-center gap-6 p-12 rounded-3xl border bg-card hover:bg-accent hover:border-primary transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1">
                        <div className="p-6 bg-primary/10 rounded-2xl group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                            <Monitor className="w-16 h-16 text-primary" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold">Monitor</h3>
                            <p className="text-muted-foreground text-sm font-medium">Panel de control, gestión de escenarios y alumnos</p>
                        </div>
                    </Link>

                    <Link href="/dashboard/ece" className="group flex flex-col items-center justify-center gap-6 p-12 rounded-3xl border bg-card hover:bg-accent hover:border-primary transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1">
                        <div className="p-6 bg-primary/10 rounded-2xl group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                            <Stethoscope className="w-16 h-16 text-primary" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold">ECE</h3>
                            <p className="text-muted-foreground text-sm font-medium">Aplicación de Evaluación Clínica Estructurada</p>
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    );
}
