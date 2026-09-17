import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
        .rpc("get_professor_invitation_details", { p_token: token });

    if (error || !data) {
        return NextResponse.json({ error: "Enlace inválido o no encontrado" }, { status: 404 });
    }

    if (new Date(data.expires_at) < new Date()) {
        return NextResponse.json({ error: "Este enlace de invitación ha caducado" }, { status: 410 });
    }

    return NextResponse.json(data);
}
