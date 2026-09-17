# Simcor

**Simcor** es una plataforma integral de simulación clínica diseñada para transformar el futuro de la formación médica. Proporciona un entorno realista y controlado para la evaluación y seguimiento de escenarios clínicos, conectando eficientemente a centros, profesores y alumnos.

## 🚀 Características Principales

*   **Monitorización en tiempo real:** Supervisa constantes vitales y permite a los instructores responder a incidentes y modificar parámetros en simulaciones clínicas al instante.
*   **Evaluación Clínica Estructurada (ECE):** Un sistema completo para la evaluación objetiva y estructurada de las habilidades, toma de decisiones y competencias médicas de los estudiantes.
*   **Gestión Integral de Centros:** Panel centralizado e intuitivo para administrar centros educativos, roles de usuarios (profesores, alumnos, administradores) y configurar escenarios de simulación.

## 💻 Tecnologías

Este proyecto está construido con una pila tecnológica moderna enfocada en el rendimiento y la escalabilidad:

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Lenguaje:** TypeScript
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
*   **Componentes UI:** [shadcn/ui](https://ui.shadcn.com/)
*   **Base de datos, Backend y Autenticación:** [Supabase](https://supabase.com/)
*   **Iconos:** [Lucide React](https://lucide.dev/)

## 🛠️ Desarrollo Local

### Prerrequisitos

*   Node.js (v18 o superior)
*   Un gestor de paquetes como npm, pnpm o yarn

### Instalación

1. Clona el repositorio e ingresa al directorio:
   ```bash
   git clone <url-del-repositorio>
   cd simcor
   ```

2. Instala las dependencias:
   ```bash
   npm install
   # o pnpm install
   # o yarn install
   ```

3. Configura las variables de entorno. Crea un archivo `.env.local` en la raíz del proyecto y añade tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   # o pnpm dev
   # o yarn dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación en funcionamiento.
