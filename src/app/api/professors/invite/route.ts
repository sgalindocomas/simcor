import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await request.json();
        const { department, expiresInHours } = body;

        const hours = parseInt(expiresInHours) || 48;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + hours);

        const { data, error } = await supabase
            .from("professor_invitations")
            .insert([
                {
                    center_id: user.id,
                    department: department || null,
                    expires_at: expiresAt.toISOString(),
                },
            ])
            .select("id")
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ token: data.id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
