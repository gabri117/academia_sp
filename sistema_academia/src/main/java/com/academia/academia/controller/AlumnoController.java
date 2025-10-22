package com.academia.academia.controller;

import com.academia.academia.dto.alumno.AlumnoCreateDTO;
import com.academia.academia.dto.alumno.AlumnoResponseDTO;
import com.academia.academia.dto.alumno.AlumnoUpdateDTO;
import com.academia.academia.service.AlumnoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/alumnos")
@Tag(name = "Personas", description = "Operaciones relacionadas con los alumnos")
public class AlumnoController {

    private final AlumnoService alumnoService;

    public AlumnoController(AlumnoService alumnoService) {
        this.alumnoService = alumnoService;
    }

    @GetMapping
    @Operation(summary = "Listar alumnos", description = "Devuelve el listado paginado de alumnos registrados")
    @ApiResponse(responseCode = "200", description = "Listado de alumnos disponible")
    public Page<AlumnoResponseDTO> listar(@PageableDefault(size = 20) Pageable pageable) {
        return alumnoService.listar(pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener alumno", description = "Recupera la información de un alumno por su identificador")
    @ApiResponse(responseCode = "200", description = "Alumno encontrado")
    public AlumnoResponseDTO obtener(@PathVariable UUID id) {
        return alumnoService.obtener(id);
    }

    @PostMapping
    @Operation(summary = "Crear alumno", description = "Registra un nuevo alumno")
    @ApiResponse(responseCode = "201", description = "Alumno creado correctamente")
    public ResponseEntity<AlumnoResponseDTO> crear(@Valid @RequestBody AlumnoCreateDTO dto) {
        AlumnoResponseDTO response = alumnoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar alumno", description = "Actualiza los datos de un alumno existente")
    @ApiResponse(responseCode = "200", description = "Alumno actualizado")
    public AlumnoResponseDTO actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody AlumnoUpdateDTO dto) {
        return alumnoService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar alumno", description = "Elimina el registro de un alumno")
    @ApiResponse(responseCode = "204", description = "Alumno eliminado")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        alumnoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
