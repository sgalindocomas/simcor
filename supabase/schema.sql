-- ==============================================================================
-- CORRECCIÓN Y ACTUALIZACIÓN - ESQUEMA DE USUARIOS SUPABASE (CENTRO / ALUMNO)
-- ==============================================================================

-- 1. Tabla base de perfiles de usuario (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'centro',
    institution TEXT,
    department TEXT,
    professional_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aseguramos que las columnas necesarias existan si la tabla ya estaba creada previamente
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'centro';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 1.5 Tabla de PROFESORES (professors)
CREATE TABLE IF NOT EXISTS public.professors (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
    department TEXT,                     -- Departamento / Especialidad
    employee_number TEXT,                -- Número de empleado o identificador
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de CENTROS EDUCATIVOS (centers)
CREATE TABLE IF NOT EXISTS public.centers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                  -- Nombre del centro educativo
    address TEXT,                        -- Dirección física del centro
    city TEXT,                           -- Ciudad / Municipio
    province TEXT,                       -- Provincia
    postal_code TEXT,                    -- Código postal
    phone TEXT,                          -- Teléfono de contacto
    study_type TEXT,                     -- Tipo de estudios (ej: FP Emergencias Sanitarias, Grado Medicina, etc.)
    center_code TEXT,                    -- Código oficial del centro / NIF (opcional)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de ALUMNOS (students)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    center_id UUID NOT NULL REFERENCES public.centers(id) ON DELETE CASCADE,
    department TEXT,                     -- Departamento / Especialidad
    course_group TEXT,                   -- Curso o Grupo (ej: 1º TES - Grupo A)
    student_code TEXT,                   -- Matrícula, DNI o número identificador de alumno
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_students_center_id ON public.students(center_id);
CREATE INDEX IF NOT EXISTS idx_professors_center_id ON public.professors(center_id);

-- 5. Habilitar Seguridad a Nivel de Fila (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de Seguridad (RLS)

-- PROFILES --
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Centros can view their students profiles" ON public.profiles;
CREATE POLICY "Centros can view their students profiles"
ON public.profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.students
        WHERE students.id = profiles.id
        AND students.center_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- CENTERS --
DROP POLICY IF EXISTS "Centers viewable by owner or enrolled students" ON public.centers;
CREATE POLICY "Centers viewable by owner or enrolled students"
ON public.centers FOR SELECT
USING (
    auth.uid() = id OR
    EXISTS (
        SELECT 1 FROM public.students
        WHERE students.center_id = centers.id
        AND students.id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Centros can update own center details" ON public.centers;
CREATE POLICY "Centros can update own center details"
ON public.centers FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Centros can insert own center details" ON public.centers;
CREATE POLICY "Centros can insert own center details"
ON public.centers FOR INSERT
WITH CHECK (auth.uid() = id);

-- STUDENTS --
DROP POLICY IF EXISTS "Students can view own student record" ON public.students;
CREATE POLICY "Students can view own student record"
ON public.students FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Centros can view their enrolled students" ON public.students;
CREATE POLICY "Centros can view their enrolled students"
ON public.students FOR SELECT
USING (center_id = auth.uid());

DROP POLICY IF EXISTS "Centros can insert students" ON public.students;
CREATE POLICY "Centros can insert students"
ON public.students FOR INSERT
WITH CHECK (center_id = auth.uid());

DROP POLICY IF EXISTS "Centros can update students" ON public.students;
CREATE POLICY "Centros can update students"
ON public.students FOR UPDATE
USING (center_id = auth.uid());

DROP POLICY IF EXISTS "Centros can delete students" ON public.students;
CREATE POLICY "Centros can delete students"
ON public.students FOR DELETE
USING (center_id = auth.uid());

-- PROFESSORS --
DROP POLICY IF EXISTS "Professors can view own record" ON public.professors;
CREATE POLICY "Professors can view own record"
ON public.professors FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Centros can view their professors" ON public.professors;
CREATE POLICY "Centros can view their professors"
ON public.professors FOR SELECT
USING (center_id = auth.uid());

DROP POLICY IF EXISTS "Centros can insert professors" ON public.professors;
CREATE POLICY "Centros can insert professors"
ON public.professors FOR INSERT
WITH CHECK (center_id = auth.uid());

DROP POLICY IF EXISTS "Centros can update professors" ON public.professors;
CREATE POLICY "Centros can update professors"
ON public.professors FOR UPDATE
USING (center_id = auth.uid());

DROP POLICY IF EXISTS "Centros can delete professors" ON public.professors;
CREATE POLICY "Centros can delete professors"
ON public.professors FOR DELETE
USING (center_id = auth.uid());


-- 7. Función de Trigger A Prueba de Fallos (SECURITY DEFINER + search_path)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role_val TEXT;
    center_id_val UUID;
    full_name_val TEXT;
BEGIN
    user_role_val := COALESCE(new.raw_user_meta_data->>'role', 'centro');
    full_name_val := COALESCE(new.raw_user_meta_data->>'full_name', new.email, 'Usuario');

    -- 1. Insertar o actualizar en profiles
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        full_name_val,
        user_role_val::public.user_role
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        email = EXCLUDED.email;

    -- 2. Si es un CENTRO, insertar en la tabla centers
    IF user_role_val = 'centro' THEN
        INSERT INTO public.centers (id, name, address, city, province, postal_code, phone, study_type, center_code)
        VALUES (
            new.id,
            COALESCE(new.raw_user_meta_data->>'center_name', full_name_val, 'Centro Educativo'),
            new.raw_user_meta_data->>'address',
            new.raw_user_meta_data->>'city',
            new.raw_user_meta_data->>'province',
            new.raw_user_meta_data->>'postal_code',
            new.raw_user_meta_data->>'phone',
            new.raw_user_meta_data->>'study_type',
            new.raw_user_meta_data->>'center_code'
        )
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            study_type = EXCLUDED.study_type;
    
    -- 3. Si es un ALUMNO, insertar en la tabla students
    ELSIF user_role_val = 'alumno' THEN
        BEGIN
            center_id_val := (new.raw_user_meta_data->>'center_id')::UUID;
            IF center_id_val IS NOT NULL THEN
                INSERT INTO public.students (id, center_id, department, course_group, student_code)
                VALUES (
                    new.id,
                    center_id_val,
                    new.raw_user_meta_data->>'department',
                    new.raw_user_meta_data->>'course_group',
                    new.raw_user_meta_data->>'student_code'
                )
                ON CONFLICT (id) DO NOTHING;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    
    -- 4. Si es un PROFESOR, insertar en la tabla professors
    ELSIF user_role_val = 'profesor' THEN
        BEGIN
            center_id_val := (new.raw_user_meta_data->>'center_id')::UUID;
            IF center_id_val IS NOT NULL THEN
                INSERT INTO public.professors (id, center_id, department, employee_number)
                VALUES (
                    new.id,
                    center_id_val,
                    new.raw_user_meta_data->>'department',
                    new.raw_user_meta_data->>'employee_number'
                )
                ON CONFLICT (id) DO NOTHING;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- Ante cualquier excepción imprevista, emitir un aviso en los logs pero NO abortar el registro del usuario
    RAISE WARNING 'Error en handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Asignar el trigger a la tabla auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
