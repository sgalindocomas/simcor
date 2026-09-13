import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, FileText, User } from "lucide-react";

type Params = Promise<{ id: string }>;

export default async function AfectadoDetailPage(props: { params: Params }) {
    const params = await props.params;
    const supabase = await createClient();
    const id = params.id;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { data: afectado } = await supabase
        .from("afectat")
        .select(`
            *,
            pacient (*),
            informe (*)
        `)
        .eq("id", id)
        .single();

    if (!afectado) {
        return (
            <div className="p-8 text-center space-y-4">
                <h2 className="text-xl">Afectado no encontrado</h2>
                <Button asChild variant="outline">
                    <Link href="/dashboard/ece">Volver a Incidentes</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link href="/dashboard/ece" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ChevronLeft className="w-4 h-4"/> Volver a Incidentes
            </Link>

            <h2 className="text-2xl font-bold flex items-center gap-2">
                <User className="w-6 h-6"/> 
                Detalle del Afectado
            </h2>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">
                        {afectado.pacient?.nom} {afectado.pacient?.cognoms}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p><strong>DNI:</strong> {afectado.pacient?.dni || "No especificado"}</p>
                    <p><strong>Edad en el incidente:</strong> {afectado.edat || "No especificada"}</p>
                    <p><strong>Sexo:</strong> {afectado.sexe || "No especificado"}</p>
                </CardContent>
            </Card>

            <h3 className="text-xl font-semibold mt-8 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5"/>
                Informes Clínicos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {afectado.informe && afectado.informe.length > 0 ? (
                    afectado.informe.map((inf: any) => (
                        <Card key={inf.id} className="hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <CardTitle className="text-lg">Informe #{inf.id.split("-")[0]}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {inf.data || "Fecha no especificada"} {inf.hora || ""}
                                </p>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`/dashboard/ece/informes/${inf.id}`}>Ver Detalle Completo</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full p-8 border border-dashed rounded-lg text-center text-muted-foreground">
                        <p>No hay informes asociados a este afectado.</p>
                        <Button className="mt-4" disabled>+ Crear Informe (Próximamente)</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
