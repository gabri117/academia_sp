# Frontend Academia

Proyecto base en React + TypeScript + Vite para la plataforma de gestion de la academia. Incluye autenticacion simulada, control de roles y componentes listos para conectar con el backend.

## Requisitos previos
- Node.js 18+ (se recomiendan las versiones LTS vigentes)
- npm (instalado junto con Node.js)

## Configuracion inicial
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Copia las variables de entorno y ajusta la URL del backend si es necesario:
   ```bash
   cp .env.example .env
   ```
   - `VITE_API_URL` debe apuntar al backend (por defecto `http://localhost:8080/api/v1`).
   - Asegurate de habilitar CORS en el backend para el origen donde corre Vite (por defecto `http://localhost:5173`).

## Scripts disponibles
- `npm run dev`: levanta el entorno de desarrollo con HMR.
- `npm run build`: genera el build de produccion.
- `npm run preview`: sirve el build generado para verificacion.
- `npm run lint`: ejecuta las reglas de ESLint.

## Arquitectura
- `src/api`: instancia de Axios con interceptores y manejo de errores.
- `src/store`: estado global con Zustand (persistencia en localStorage).
- `src/router`: ruteo con proteccion por autenticacion y roles.
- `src/components`: UI reutilizable, layouts y formularios base con React Hook Form + Zod.
- `src/pages`: paginas modulares por dominio (alumnos, pagos, evaluaciones, etc.).
- `src/services`: stubs para invocar al backend usando Axios.
- `src/hooks`: envoltorios para queries y mutations con TanStack Query.

## Roles simulados
- Ingreso via formulario o accesos rapidos.
- Si el correo contiene la palabra `admin` se asigna el rol `admin`; en caso contrario `user`.
- Acciones sensibles (por ejemplo eliminar registros o acceder a formularios de alta) se limitan al rol `admin`.

## Notas
- Para despliegues productivos, expone las variables como `VITE_` y configura CORS en el backend.
- Usa ramas de feature para cada modulo y evita trabajar directo sobre `main`.