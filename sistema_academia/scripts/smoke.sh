#!/bin/bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:8080}
TMP_RESPONSE=$(mktemp)

function cleanup() {
  rm -f "$TMP_RESPONSE"
}
trap cleanup EXIT

function call_api() {
  local METHOD=$1
  local URL=$2
  local BODY=${3-}
  local DESCRIPTION=$4
  local EXPECTED=$5

  echo ""; echo ">>> ${DESCRIPTION}";
  if [[ -n "$BODY" ]]; then
    STATUS=$(curl -s -o "$TMP_RESPONSE" -w '%{http_code}' -H 'Content-Type: application/json' -X "$METHOD" "$URL" -d "$BODY")
  else
    STATUS=$(curl -s -o "$TMP_RESPONSE" -w '%{http_code}' -X "$METHOD" "$URL")
  fi

  if [[ " $EXPECTED " == *" $STATUS "* ]]; then
    echo "✅ ${STATUS}"
  else
    echo "⚠️  Esperado $EXPECTED pero se obtuvo $STATUS"
  fi
  if [[ -s "$TMP_RESPONSE" ]]; then
    head -c 500 "$TMP_RESPONSE" | sed 's/$/\n/'
  fi
}

echo "Usando BASE_URL=$BASE_URL"

call_api GET "$BASE_URL/api/v1/niveles-academicos" "" "Listar niveles" " 200 "
call_api GET "$BASE_URL/api/v1/grados-academicos/nivel/11111111-1111-1111-1111-111111111111" "" "Listar grados del nivel base" " 200 "
call_api GET "$BASE_URL/api/v1/establecimientos?size=20" "" "Listar establecimientos" " 200 "

call_api POST "$BASE_URL/api/v1/encargados" '{
  "nombre": "QA",
  "apellido": "Demo",
  "telefono": "5550000"
}' "Crear encargado demo" " 201 "

call_api POST "$BASE_URL/api/v1/alumnos" '{
  "institutoId": "44444444-4444-4444-4444-444444444444",
  "nombre": "Alumno QA",
  "apellido": "Demo",
  "telefono": "5550001",
  "direccion": "Zona QA",
  "fechaNacimiento": "2014-05-02",
  "estado": "activo"
}' "Crear alumno demo" " 201 "

call_api POST "$BASE_URL/api/v1/alumno-encargado" '{
  "alumnoId": "88888888-8888-8888-8888-888888888888",
  "encargadoId": "99999999-9999-9999-9999-999999999999"
}' "Vincular alumno con encargado inicial" " 201 409 "

call_api GET "$BASE_URL/api/v1/ofertas-curso?size=20" "" "Listar ofertas" " 200 "

call_api POST "$BASE_URL/api/v1/inscripciones" '{
  "alumnoId": "88888888-8888-8888-8888-888888888888",
  "ofertaId": "66666666-6666-6666-6666-666666666666",
  "fechaInscripcion": "2025-01-15",
  "estado": "ACTIVA"
}' "Inscribir alumno de demo" " 201 409 "

call_api POST "$BASE_URL/api/v1/sesiones-clase" '{
  "ofertaId": "66666666-6666-6666-6666-666666666666",
  "fecha": "2025-02-05"
}' "Crear sesión de clase" " 201 409 "

call_api POST "$BASE_URL/api/v1/asistencias" '{
  "sessionId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  "inscripcionId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "presente": true
}' "Registrar asistencia" " 201 409 "

call_api POST "$BASE_URL/api/v1/unidades-evaluacion" '{
  "ofertaId": "66666666-6666-6666-6666-666666666666",
  "nombre": "Evaluación QA"
}' "Crear unidad de evaluación" " 201 409 "

call_api POST "$BASE_URL/api/v1/calificaciones" '{
  "inscripcionId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "evaluacionId": "cccccccc-cccc-cccc-cccc-cccccccccccc",
  "nota": 90.5,
  "observaciones": "Evaluación demo"
}' "Registrar calificación" " 201 409 "

call_api POST "$BASE_URL/api/v1/recibos" '{
  "alumnoId": "88888888-8888-8888-8888-888888888888",
  "total": 0
}' "Crear recibo demo" " 201 "

# Para aplicar detalle, genere primero un cargo y use los IDs resultantes.
# call_api POST "$BASE_URL/api/v1/detalle-recibo" '{
#   "reciboId": "<UUIDRECIBO>",
#   "cargoId": "<UUIDCARGO>",
#   "montoAplicado": 200.00
# }' "Aplicar detalle a recibo" " 201 "

echo ""; echo "Smoke finalizado. Revise los códigos indicados arriba."
