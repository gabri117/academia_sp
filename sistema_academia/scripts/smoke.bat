@echo off
setlocal ENABLEDELAYEDEXPANSION
if "%BASE_URL%"=="" set BASE_URL=http://localhost:8080
set TMP_RESP=%TEMP%\academia-smoke.json

echo Usando BASE_URL=%BASE_URL%

call :callapi GET "%BASE_URL%/api/v1/niveles-academicos" "" "Listar niveles" "200"
call :callapi GET "%BASE_URL%/api/v1/grados-academicos/nivel/11111111-1111-1111-1111-111111111111" "" "Listar grados del nivel base" "200"
call :callapi GET "%BASE_URL%/api/v1/establecimientos?size=20" "" "Listar establecimientos" "200"

call :callapi POST "%BASE_URL%/api/v1/encargados" "{\"nombre\":\"QA\",\"apellido\":\"Demo\",\"telefono\":\"5550002\"}" "Crear encargado demo" "201"
call :callapi POST "%BASE_URL%/api/v1/alumnos" "{\"institutoId\":\"44444444-4444-4444-4444-444444444444\",\"nombre\":\"Alumno QA\",\"apellido\":\"Batch\",\"telefono\":\"5550003\",\"direccion\":\"Zona Batch\",\"fechaNacimiento\":\"2013-04-01\",\"estado\":\"activo\"}" "Crear alumno demo" "201"
call :callapi POST "%BASE_URL%/api/v1/alumno-encargado" "{\"alumnoId\":\"88888888-8888-8888-8888-888888888888\",\"encargadoId\":\"99999999-9999-9999-9999-999999999999\"}" "Vincular alumno con encargado" "201 409"
call :callapi GET "%BASE_URL%/api/v1/ofertas-curso?size=20" "" "Listar ofertas" "200"
call :callapi POST "%BASE_URL%/api/v1/inscripciones" "{\"alumnoId\":\"88888888-8888-8888-8888-888888888888\",\"ofertaId\":\"66666666-6666-6666-6666-666666666666\",\"fechaInscripcion\":\"2025-01-15\",\"estado\":\"ACTIVA\"}" "Inscribir alumno demo" "201 409"
call :callapi POST "%BASE_URL%/api/v1/sesiones-clase" "{\"ofertaId\":\"66666666-6666-6666-6666-666666666666\",\"fecha\":\"2025-02-06\"}" "Crear sesión clase" "201 409"
call :callapi POST "%BASE_URL%/api/v1/asistencias" "{\"sessionId\":\"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb\",\"inscripcionId\":\"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa\",\"presente\":true}" "Registrar asistencia" "201 409"
call :callapi POST "%BASE_URL%/api/v1/unidades-evaluacion" "{\"ofertaId\":\"66666666-6666-6666-6666-666666666666\",\"nombre\":\"Evaluacion Batch\"}" "Crear unidad de evaluación" "201 409"
call :callapi POST "%BASE_URL%/api/v1/calificaciones" "{\"inscripcionId\":\"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa\",\"evaluacionId\":\"cccccccc-cccc-cccc-cccc-cccccccccccc\",\"nota\":88.0,\"observaciones\":\"Entrega en tiempo\"}" "Registrar calificación" "201 409"
call :callapi POST "%BASE_URL%/api/v1/recibos" "{\"alumnoId\":\"88888888-8888-8888-8888-888888888888\",\"total\":0}" "Crear recibo demo" "201"
rem Para aplicar detalle capture los IDs creados.
rem call :callapi POST "%BASE_URL%/api/v1/detalle-recibo" "{\"reciboId\":\"<UUIDRECIBO>\",\"cargoId\":\"<UUIDCARGO>\",\"montoAplicado\":200.00}" "Aplicar detalle" "201"

echo.
echo Smoke completado. Revise códigos anteriores.
goto :eof

:callapi
set METHOD=%~1
set URL=%~2
set BODY=%~3
set DESC=%~4
set EXPECTED=%~5

echo.
echo >>> %DESC%
if "%BODY%"=="" (
  for /f "delims=" %%A in ('curl -s -o "%TMP_RESP%" -w "%%{http_code}" -X %METHOD% "%URL%"') do set STATUS=%%A
) else (
  echo %BODY%>"%TMP_RESP%.body"
  for /f "delims=" %%A in ('curl -s -o "%TMP_RESP%" -w "%%{http_code}" -H "Content-Type: application/json" -X %METHOD% "%URL%" -d @"%TMP_RESP%.body"') do set STATUS=%%A
  del "%TMP_RESP%.body" >nul 2>&1
)
if "%EXPECTED%"=="" set EXPECTED=200
for %%C in (%EXPECTED%) do (
  if "%%C"=="!STATUS!" goto :ok
)
echo ⚠️  Esperado %EXPECTED% pero se obtuvo !STATUS!
goto :print
:ok
echo ✅ !STATUS!
:print
if exist "%TMP_RESP%" type "%TMP_RESP%"
del "%TMP_RESP%" >nul 2>&1
exit /b 0
