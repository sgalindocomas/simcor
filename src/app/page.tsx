import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { Stethoscope, Activity, Users } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="flex items-center justify-between p-6 max-w-[1400px] w-full mx-auto">
                <div className="flex items-center gap-2">
                    <Activity className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold tracking-tight">Simcor</span>
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSelector />
                    <ThemeToggle />
                    <Link href="/login">
                        <Button variant="ghost">Iniciar Sesión</Button>
                    </Link>
                    <Link href="/register">
                        <Button>Registrarse</Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 mt-10">
                <div className="space-y-6 max-w-3xl">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                        Plataforma de Simulación Clínica
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
                        El futuro de la formación <span className="text-primary">médica</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Simcor proporciona un entorno realista y controlado para la evaluación y seguimiento de escenarios clínicos, conectando centros, profesores y alumnos.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <Link href="/register">
                            <Button size="lg" className="h-12 px-8 text-base">
                                Comenzar ahora
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                                Ir al Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-[1200px] mx-auto text-left w-full">
                    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-card border shadow-sm">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Monitorización en tiempo real</h3>
                        <p className="text-muted-foreground">Supervisa constantes vitales y responde a incidentes en simulaciones clínicas al instante.</p>
                    </div>
                    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-card border shadow-sm">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Stethoscope className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Evaluación Clínica (ECE)</h3>
                        <p className="text-muted-foreground">Sistema integral para la evaluación estructurada de habilidades y competencias médicas.</p>
                    </div>
                    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-card border shadow-sm">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Gestión de Centros</h3>
                        <p className="text-muted-foreground">Administra alumnos, profesores y escenarios desde un panel centralizado e intuitivo.</p>
                    </div>
                </div>
            </main>
            
            <footer className="border-t py-8 mt-20">
                <div className="max-w-[1400px] mx-auto px-6 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Simcor. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    );
}
