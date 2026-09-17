import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, LogOut } from "lucide-react";
import Link from "next/link";

export default function AccessDeniedPage() {
    return (
        <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
            <Card className="max-w-md w-full border-destructive/20 shadow-xl">
                <CardHeader className="text-center space-y-4 pb-6">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-destructive/10 rounded-full">
                            <AlertCircle className="w-10 h-10 text-destructive" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Acceso Restringido</CardTitle>
                    <CardDescription className="text-base">
                        Has iniciado sesión con una cuenta de <strong>Alumno</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Esta plataforma web (Simcor) está destinada exclusivamente para la gestión de Centros y Profesores.
                        <br /><br />
                        Para acceder a tus simulaciones y evaluaciones, debes utilizar la <strong>Aplicación Móvil de Alumnos</strong>.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                        <form action="/auth/signout" method="post" className="w-full">
                            <Button type="submit" variant="default" className="w-full flex gap-2">
                                <LogOut className="w-4 h-4" />
                                Cerrar Sesión
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
