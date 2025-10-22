package com.academia.academia.dto.oferta;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CursoCatalogoCreateDTO {

    @NotBlank
    @Size(max = 30)
    private String nombre;

    @Size(max = 20)
    private String nivelCurso;

    @Size(max = 20)
    private String duracion;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getNivelCurso() {
        return nivelCurso;
    }

    public void setNivelCurso(String nivelCurso) {
        this.nivelCurso = nivelCurso;
    }

    public String getDuracion() {
        return duracion;
    }

    public void setDuracion(String duracion) {
        this.duracion = duracion;
    }
}
