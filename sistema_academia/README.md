# sistema_academia
Proyecto de base de datos I - 2025

## Ejecución local
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/academia
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres
mvn spring-boot:run
```

Swagger UI: `http://localhost:8080/swagger-ui/index.html`

<!-- QA-README-START -->
## Demo & Validación rápida
1. Inicia la aplicación con `./mvnw spring-boot:run` (usa las credenciales de `application.yml` o exporta variables antes de arrancar).
2. Importa `postman/coleccion.json` en Postman y apunta la variable `{{baseUrl}}` a tu entorno (por defecto http://localhost:8080).
3. Ejecuta los scripts de smoke:
   - Unix/macOS: `bash scripts/smoke.sh`
   - Windows: `scripts\smoke.bat`
   Cada script emite los códigos HTTP esperados y muestra los cuerpos relevantes para validar rápidamente el flujo principal (catálogos, personas, inscripciones, sesiones, evaluaciones y pagos).
4. Si necesitas datos de prueba adicionales, revisa `src/main/resources/data.sql` y ajusta los UUID en la colección/smoke según tu escenario.
<!-- QA-README-END -->
