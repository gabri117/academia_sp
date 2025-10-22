package com.academia.academia.controller;

import com.academia.academia.dto.encargado.EncargadoCreateDTO;
import com.academia.academia.dto.encargado.EncargadoResponseDTO;
import com.academia.academia.dto.encargado.EncargadoUpdateDTO;
import com.academia.academia.service.EncargadoService;
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
@RequestMapping("/api/v1/encargados")
@Tag(name = "Personas", description = "Gestión de encargados")
public class EncargadoController {

    private final EncargadoService encargadoService;

    public EncargadoController(EncargadoService encargadoService) {
        this.encargadoService = encargadoService;
    }

    @GetMapping
    @Operation(summary = "Listar encargados", description = "Devuelve el listado paginado de encargados")
    @ApiResponse(responseCode = "200", description = "Listado de encargados disponible")
    public Page<EncargadoResponseDTO> listar(@PageableDefault(size = 20) Pageable pageable) {
        return encargadoService.listar(pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener encargado", description = "Obtiene la información de un encargado específico")
    @ApiResponse(responseCode = "200", description = "Encargado encontrado")
    public EncargadoResponseDTO obtener(@PathVariable UUID id) {
        return encargadoService.obtener(id);
    }

    @PostMapping
    @Operation(summary = "Crear encargado", description = "Registra un nuevo encargado")
    @ApiResponse(responseCode = "201", description = "Encargado creado correctamente")
    public ResponseEntity<EncargadoResponseDTO> crear(@Valid @RequestBody EncargadoCreateDTO dto) {
        EncargadoResponseDTO response = encargadoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar encargado", description = "Actualiza los datos de un encargado existente")
    @ApiResponse(responseCode = "200", description = "Encargado actualizado")
    public EncargadoResponseDTO actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody EncargadoUpdateDTO dto) {
        return encargadoService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar encargado", description = "Elimina un encargado por su identificador")
    @ApiResponse(responseCode = "204", description = "Encargado eliminado")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        encargadoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
