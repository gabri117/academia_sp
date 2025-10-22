package com.academia.academia.controller;

import com.academia.academia.dto.establecimiento.EstablecimientoCreateDTO;
import com.academia.academia.dto.establecimiento.EstablecimientoResponseDTO;
import com.academia.academia.dto.establecimiento.EstablecimientoUpdateDTO;
import com.academia.academia.service.EstablecimientoService;
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
@RequestMapping("/api/v1/establecimientos")
@Tag(name = "Catálogos Base", description = "Administración de establecimientos educativos")
public class EstablecimientoController {

    private final EstablecimientoService establecimientoService;

    public EstablecimientoController(EstablecimientoService establecimientoService) {
        this.establecimientoService = establecimientoService;
    }

    @GetMapping
    @Operation(summary = "Listar establecimientos", description = "Obtiene los establecimientos paginados")
    @ApiResponse(responseCode = "200", description = "Listado de establecimientos")
    public Page<EstablecimientoResponseDTO> listar(@PageableDefault(size = 20) Pageable pageable) {
        return establecimientoService.listar(pageable);
    }

    @GetMapping("/{institutoId}")
    @Operation(summary = "Obtener establecimiento", description = "Obtiene un establecimiento por su identificador")
    @ApiResponse(responseCode = "200", description = "Establecimiento encontrado")
    public EstablecimientoResponseDTO obtener(@PathVariable UUID institutoId) {
        return establecimientoService.obtener(institutoId);
    }

    @PostMapping
    @Operation(summary = "Crear establecimiento", description = "Registra un nuevo establecimiento")
    @ApiResponse(responseCode = "201", description = "Establecimiento creado")
    public ResponseEntity<EstablecimientoResponseDTO> crear(
            @Valid @RequestBody EstablecimientoCreateDTO dto) {
        EstablecimientoResponseDTO response = establecimientoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{institutoId}")
    @Operation(summary = "Actualizar establecimiento", description = "Actualiza un establecimiento existente")
    @ApiResponse(responseCode = "200", description = "Establecimiento actualizado")
    public EstablecimientoResponseDTO actualizar(
            @PathVariable UUID institutoId,
            @Valid @RequestBody EstablecimientoUpdateDTO dto) {
        return establecimientoService.actualizar(institutoId, dto);
    }

    @DeleteMapping("/{institutoId}")
    @Operation(summary = "Eliminar establecimiento", description = "Elimina un establecimiento")
    @ApiResponse(responseCode = "204", description = "Establecimiento eliminado")
    public ResponseEntity<Void> eliminar(@PathVariable UUID institutoId) {
        establecimientoService.eliminar(institutoId);
        return ResponseEntity.noContent().build();
    }
}
