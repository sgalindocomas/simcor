"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/i18n/i18n-context";

export function StudentDashboardContent({ profileId }: { profileId: string }) {
    const { t } = useI18n();

    return (
        <div className="w-full flex flex-col items-center justify-center space-y-6 mt-8">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Bienvenido al Panel de Estudiante</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>
                        Aquí podrás ver tus sesiones asignadas, historial de escenarios completados y tus resultados de simulación.
                    </p>
                    <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center bg-muted/20">
                        <p className="text-lg font-medium opacity-70">
                            Próximamente
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
