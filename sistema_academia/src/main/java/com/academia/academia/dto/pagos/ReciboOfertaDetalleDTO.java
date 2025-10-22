package com.academia.academia.dto.pagos;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;
import java.util.UUID;

public class ReciboOfertaDetalleDTO {

    private UUID ofertaId;
    private String nombreOferta;
    private String dia;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaInicio;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaFinalizacion;

    private UUID institutoId;
    private String institutoNombre;

    public UUID getOfertaId() {
        return ofertaId;
    }

    public void setOfertaId(UUID ofertaId) {
        this.ofertaId = ofertaId;
    }

    public String getNombreOferta() {
        return nombreOferta;
    }

    public void setNombreOferta(String nombreOferta) {
        this.nombreOferta = nombreOferta;
    }

    public String getDia() {
        return dia;
    }

    public void setDia(String dia) {
        this.dia = dia;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFinalizacion() {
        return horaFinalizacion;
    }

    public void setHoraFinalizacion(LocalTime horaFinalizacion) {
        this.horaFinalizacion = horaFinalizacion;
    }

    public UUID getInstitutoId() {
        return institutoId;
    }

    public void setInstitutoId(UUID institutoId) {
        this.institutoId = institutoId;
    }

    public String getInstitutoNombre() {
        return institutoNombre;
    }

    public void setInstitutoNombre(String institutoNombre) {
        this.institutoNombre = institutoNombre;
    }
}

