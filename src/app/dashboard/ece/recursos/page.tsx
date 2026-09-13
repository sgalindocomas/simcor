import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { RecursosList } from "./recursos-list";

export default async function RecursosPage() {
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
    
    // Obtener los recursos
    const { data: recursos } = await supabase
        .from("recurs")
        .select("*")
        .order("id", { ascending: false });

    return (
        <div className="w-full">
            <RecursosList initialRecursos={recursos || []} centroId={centroId} />
        </div>
    );
}
