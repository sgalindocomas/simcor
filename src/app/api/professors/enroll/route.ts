import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        // Verificar el rol del usuario que realiza la petición
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'centro') {
            return NextResponse.json({ error: "Solo los usuarios de tipo Centro pueden inscribir profesores" }, { status: 403 });
        }

        const body = await request.json();
        const { email, password, full_name, employee_number, department } = body;

        if (!email || !password || !full_name) {
            return NextResponse.json({ error: "Faltan campos obligatorios (nombre, correo y contraseña)" }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Cliente secundario sin persistencia de sesión para no desloguear al centro
        const tempClient = createAdminClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false }
        });

        const { data, error } = await tempClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: 'profesor',
                    center_id: user.id,
                    full_name,
                    employee_number,
                    department
                }
            }
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, professor: data.user });
    } catch (err: any) {
        console.error("Error en API de inscripción de profesor:", err);
        return NextResponse.json({ error: err.message || "Error interno del servidor" }, { status: 500 });
    }
}
