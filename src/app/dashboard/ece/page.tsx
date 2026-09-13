import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { IncidentesList } from "./incidentes-list";

export default async function ECEPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    let centroId = null;
    if (profile?.role === "centro") {
        centroId = user.id;
    } else if (profile?.role === "profesor") {
        const { data: profData } = await supabase.from("professors").select("center_id").eq("id", user.id).single();
        centroId = profData?.center_id;
    }

    const { data: incidentes } = await supabase
        .from("incident")
        .select(`
            *,
            afectat (
                id,
                ref_pacient,
                edat,
                sexe,
                pacient (nom, cognoms)
            ),
            incident_recurs (
                ref_recurs,
                recurs (codi_recurs)
            )
        `)
        .order("timestamp", { ascending: false });
        
    const { data: pacientes } = await supabase.from("pacient").select("id, nom, cognoms, dni");
    const { data: recursos } = await supabase.from("recurs").select("id, codi_recurs");

    return (
        <div className="w-full">
            <IncidentesList 
                initialIncidentes={incidentes || []} 
                pacientes={pacientes || []}
                recursos={recursos || []}
                centroId={centroId}
            />
        </div>
    );
}
