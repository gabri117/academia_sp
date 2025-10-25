# Academia SP

Plataforma full stack para administrar catalogos academicos, alumnos, cobros y flujos operativos de una academia. El repositorio agrupa un backend en Spring Boot y un frontend en React pensados para el Proyecto Final de Base de Datos I 2025.

## Modulos

| Carpeta | Rol | Stack principal |
| --- | --- | --- |
| `sistema_academia/` | API REST para catalogos, inscripciones, sesiones, evaluaciones y pagos. | Spring Boot 3.5, Java 21, Maven Wrapper, PostgreSQL |
| `frontend_academia/` | SPA para la gestion diaria con ruteo, formularios y control de roles. | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand |

## Capacidades principales

- Catalogos maestros: niveles, grados, cursos, ofertas de curso y tarifas.
- Gestion de alumnos, encargados y vinculos, con historial de inscripciones.
- Control operativo: sesiones de clase, asistencias y unidades de evaluacion.
- Flujo financiero: cargos, recibos, estado de cuenta y reportes rapidos.
- UI con autenticacion simulada (roles `admin` y `user`), formularios con React Hook Form + Zod, consumo de API via Axios y persistencia en localStorage.

## Requisitos previos

- Node.js 18+ (se recomienda la version LTS vigente).
- npm (incluido con Node.js).
- Java 21 y Maven 3.9+ (el wrapper `mvnw` ya esta configurado).
- PostgreSQL 14+ con un usuario con permisos para crear la base `sistemaacademia`.
- curl y/o Postman para las pruebas de la API.

## Estructura de carpetas

```
academia_sp/
  README.md
  frontend_academia/        # SPA React + Vite
  sistema_academia/         # API Spring Boot + scripts de QA
```

## Puesta en marcha rapida

### Backend (`sistema_academia/`)

1. Crear la base y configurar credenciales:
   ```bash
   createdb sistemaacademia
   # Linux/macOS
   export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/sistemaacademia
   export SPRING_DATASOURCE_USERNAME=postgres
   export SPRING_DATASOURCE_PASSWORD=postgres
   # Windows PowerShell
   $env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/sistemaacademia"
   $env:SPRING_DATASOURCE_USERNAME="postgres"
   $env:SPRING_DATASOURCE_PASSWORD="postgres"
   ```
2. (Opcional) aplicar SQL adicional desde `scripts/migrations/` si necesitas columnas o datos extra.
3. Cargar los datos semilla que viven en `src/main/resources/data.sql` (Spring los inserta al arrancar).
4. Iniciar la API:
   ```bash
   cd sistema_academia
   ./mvnw spring-boot:run   # usa mvnw.cmd en Windows
   ```
5. Verifica la documentacion en `http://localhost:8080/swagger-ui/index.html`. La propiedad `spring.jpa.hibernate.ddl-auto` esta en `none`, asi que cualquier cambio de esquema debe vivir en migraciones controladas.

#### Smoke tests y colecciones

- Importa `sistema_academia/postman/coleccion.json` y apunta la variable `{{baseUrl}}` al entorno deseado.
- Para un chequeo CLI ejecuta:
  ```bash
  BASE_URL=http://localhost:8080 bash scripts/smoke.sh
  ```
  o en Windows:
  ```powershell
  scripts\smoke.bat
  ```
  Los scripts recorren catalogos, alumnos, inscripciones, sesiones y pagos reportando los codigos HTTP esperados.

### Frontend (`frontend_academia/`)

1. Instalar dependencias:
   ```bash
   cd frontend_academia
   npm install
   ```
2. Copiar y editar variables:
   ```bash
   cp .env.example .env
   ```
   Define `VITE_API_URL` con la URL base del backend (por defecto `http://localhost:8080/api/v1`).
3. Ejecutar el entorno local:
   ```bash
   npm run dev
   ```
   Vite expone la SPA en `http://localhost:5173`. Para revisar el build usa `npm run build` y `npm run preview`. El linting esta disponible via `npm run lint`.
4. El directorio `mocks/` junto con MSW permite simular respuestas cuando el backend no esta disponible (habilitado automaticamente en desarrollo si configuras los handlers).

## Variables de entorno claves

| Variable | Modulo | Comentario |
| --- | --- | --- |
| `SPRING_DATASOURCE_URL` | Backend | JDBC al cluster de PostgreSQL (por defecto `jdbc:postgresql://localhost:5432/sistemaacademia`). |
| `SPRING_DATASOURCE_USERNAME` | Backend | Usuario con permisos de lectura/escritura. |
| `SPRING_DATASOURCE_PASSWORD` | Backend | Contrasena asociada al usuario anterior. |
| `BASE_URL` | Scripts QA | URL que consumen `scripts/smoke.sh` y `scripts\smoke.bat`. |
| `VITE_API_URL` | Frontend | Endpoint base del backend que consumen los servicios Axios. |

## Datos, documentacion y utilidades

- `sistema_academia/src/main/resources/data.sql` precarga niveles, grados, cursos, ofertas, tarifas, alumnos e inscripciones para pruebas manuales y para los smoke tests.
- `sistema_academia/scripts/migrations/*.sql` almacena ajustes incrementales de esquema (ejemplo: `20251016_add_recibo_estado.sql`).
- `sistema_academia/postman/coleccion.json` centraliza las peticiones usadas en QA.
- `frontend_academia/docs/frontend-integration-spec.md` mapea cada endpoint con los formularios y tablas de la SPA.
- `frontend_academia/mocks/` contiene handlers MSW para trabajar desconectado y `frontend_academia/GEMINI.md` resume decisiones de UI.

## Flujo de trabajo sugerido

1. Crear ramas por caracteristica y abrir PRs contra `main` para mantener historico claro.
2. Mantener sincronizados los contratos API/UI (actualiza el spec de `docs/` si cambian endpoints).
3. Antes de integrar cambios ejecutar `./mvnw test`, los scripts de smoke y `npm run lint`.
4. Validar manualmente desde la SPA apuntando a `http://localhost:8080/api/v1` o al entorno que corresponda.

## Licencia

Ambos modulos se distribuyen bajo licencia MIT. Consulta `frontend_academia/LICENSE` y `sistema_academia/LICENSE` para conocer los terminos completos.
