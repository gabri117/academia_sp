package com.academia.academia.dto.grado;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class GradoUpdateDTO {

    @NotNull
    private UUID nivelId;

    @NotBlank
    @Size(max = 50)
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
