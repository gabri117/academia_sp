package com.academia.academia.controller;

import com.academia.academia.dto.pagos.DetalleReciboCreateDTO;
import com.academia.academia.dto.pagos.DetalleReciboResponseDTO;
import com.academia.academia.service.ReciboService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/detalle-recibo")
@Tag(name = "Pagos", description = "Aplicación de pagos a cargos")
public class DetalleReciboController {

    private final ReciboService reciboService;

    public DetalleReciboController(ReciboService reciboService) {
        this.reciboService = reciboService;
    }

    @PostMapping
    @Operation(summary = "Registrar detalle de recibo", description = "Aplica un pago a un cargo a través de un recibo")
    @ApiResponse(responseCode = "201", description = "Detalle registrado")
    public ResponseEntity<DetalleReciboResponseDTO> registrar(@Valid @RequestBody DetalleReciboCreateDTO dto) {
        DetalleReciboResponseDTO response = reciboService.registrarDetalle(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/recibo/{reciboId}")
    @Operation(summary = "Listar detalle de recibo", description = "Obtiene los cargos asociados a un recibo")
    @ApiResponse(responseCode = "200", description = "Detalles del recibo")
    public List<DetalleReciboResponseDTO> listarPorRecibo(@PathVariable UUID reciboId) {
        return reciboService.listarDetalles(reciboId);
    }
}
