package com.academia.academia.controller;

import com.academia.academia.dto.nivel.NivelCreateDTO;
import com.academia.academia.dto.nivel.NivelResponseDTO;
import com.academia.academia.dto.nivel.NivelUpdateDTO;
import com.academia.academia.service.NivelService;
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
@RequestMapping("/api/v1/niveles-academicos")
@Tag(name = "Catálogos Base", description = "Gestión de niveles académicos")
public class NivelController {

    private final NivelService nivelService;

    public NivelController(NivelService nivelService) {
        this.nivelService = nivelService;
    }

    @GetMapping
    @Operation(summary = "Listar niveles académicos", description = "Devuelve todos los niveles académicos registrados")
    @ApiResponse(responseCode = "200", description = "Listado de niveles")
    public List<NivelResponseDTO> listarTodos() {
        return nivelService.listarTodos();
    }

    @GetMapping("/{nivelId}")
    @Operation(summary = "Obtener nivel académico", description = "Recupera un nivel académico específico")
    @ApiResponse(responseCode = "200", description = "Nivel encontrado")
    public NivelResponseDTO obtener(@PathVariable UUID nivelId) {
        return nivelService.obtener(nivelId);
    }

    @PostMapping
    @Operation(summary = "Crear nivel académico", description = "Registra un nuevo nivel académico")
    @ApiResponse(responseCode = "201", description = "Nivel creado")
    public ResponseEntity<NivelResponseDTO> crear(@Valid @RequestBody NivelCreateDTO dto) {
        NivelResponseDTO response = nivelService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{nivelId}")
    @Operation(summary = "Actualizar nivel académico", description = "Actualiza un nivel existente")
    @ApiResponse(responseCode = "200", description = "Nivel actualizado")
    public NivelResponseDTO actualizar(
            @PathVariable UUID nivelId,
            @Valid @RequestBody NivelUpdateDTO dto) {
        return nivelService.actualizar(nivelId, dto);
    }

    @DeleteMapping("/{nivelId}")
    @Operation(summary = "Eliminar nivel académico", description = "Elimina el nivel indicado")
    @ApiResponse(responseCode = "204", description = "Nivel eliminado")
    public ResponseEntity<Void> eliminar(@PathVariable UUID nivelId) {
        nivelService.eliminar(nivelId);
        return ResponseEntity.noContent().build();
    }
}
