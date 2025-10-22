package com.academia.academia.dto.nivel;

import java.util.UUID;

public class NivelResponseDTO {

    private UUID nivelId;
    private String nombre;

    public UUID getNivelId() {
        return nivelId;
    }

    public void setNivelId(UUID nivelId) {
        this.nivelId = nivelId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
