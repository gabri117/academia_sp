package com.academia.academia.dto.nivel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class NivelCreateDTO {

    @NotBlank
    @Size(max = 20)
    private String nombre;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
