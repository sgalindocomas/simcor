import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Params = Promise<{ id: string }>;

export default async function InformeDetailPage(props: { params: Params }) {
    const params = await props.params;
    const supabase = await createClient();
    const id = params.id;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { data: informe } = await supabase
        .from("informe")
        .select("*")
        .eq("id", id)
        .single();

    if (!informe) {
        return (
            <div className="p-8 text-center space-y-4">
                <h2 className="text-xl">Informe no encontrado</h2>
                <Link href="/dashboard/ece" className="text-primary hover:underline">Volver a Incidentes</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link 
                href={informe.ref_afectat ? `/dashboard/ece/afectados/${informe.ref_afectat}` : "/dashboard/ece"} 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
                <ChevronLeft className="w-4 h-4"/> Volver
            </Link>

            <h2 className="text-2xl font-bold">
                Detalle del Informe Clínico
            </h2>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Datos en bruto del Informe</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-muted p-4 rounded-md overflow-auto text-sm border">
                        {JSON.stringify(informe, null, 2)}
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
