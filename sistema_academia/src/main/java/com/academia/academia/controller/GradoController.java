package com.academia.academia.controller;

import com.academia.academia.dto.grado.GradoCreateDTO;
import com.academia.academia.dto.grado.GradoResponseDTO;
import com.academia.academia.dto.grado.GradoUpdateDTO;
import com.academia.academia.service.GradoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
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
@RequestMapping("/api/v1/grados-academicos")
@Tag(name = "Catálogos Base", description = "Gestión de grados académicos")
public class GradoController {

    private final GradoService gradoService;

    public GradoController(GradoService gradoService) {
        this.gradoService = gradoService;
    }

    @GetMapping
    @Operation(summary = "Listar grados académicos", description = "Devuelve todos los grados académicos")
    @ApiResponse(responseCode = "200", description = "Listado de grados")
    public List<GradoResponseDTO> listarTodos() {
        return gradoService.listarTodos();
    }

    @GetMapping("/nivel/{nivelId}")
    @Operation(summary = "Listar grados por nivel", description = "Devuelve los grados asociados a un nivel")
    @ApiResponse(responseCode = "200", description = "Grados encontrados para el nivel")
    public List<GradoResponseDTO> listarPorNivel(@PathVariable UUID nivelId) {
        return gradoService.listarPorNivel(nivelId);
    }

    @GetMapping("/{gradoId}")
    @Operation(summary = "Obtener grado académico", description = "Recupera un grado académico específico")
    @ApiResponse(responseCode = "200", description = "Grado encontrado")
    public GradoResponseDTO obtener(@PathVariable UUID gradoId) {
        return gradoService.obtener(gradoId);
    }

    @PostMapping
    @Operation(summary = "Crear grado académico", description = "Registra un nuevo grado académico")
    @ApiResponse(responseCode = "201", description = "Grado creado")
    public ResponseEntity<GradoResponseDTO> crear(@Valid @RequestBody GradoCreateDTO dto) {
        GradoResponseDTO response = gradoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{gradoId}")
    @Operation(summary = "Actualizar grado académico", description = "Actualiza un grado académico existente")
    @ApiResponse(responseCode = "200", description = "Grado actualizado")
    public GradoResponseDTO actualizar(
            @PathVariable UUID gradoId,
            @Valid @RequestBody GradoUpdateDTO dto) {
        return gradoService.actualizar(gradoId, dto);
    }

    @DeleteMapping("/{gradoId}")
    @Operation(summary = "Eliminar grado académico", description = "Elimina el grado indicado")
    @ApiResponse(responseCode = "204", description = "Grado eliminado")
    public ResponseEntity<Void> eliminar(@PathVariable UUID gradoId) {
        gradoService.eliminar(gradoId);
        return ResponseEntity.noContent().build();
    }
}
