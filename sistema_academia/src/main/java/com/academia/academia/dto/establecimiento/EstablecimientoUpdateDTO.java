package com.academia.academia.dto.establecimiento;

import com.academia.academia.entity.enums.Jornada;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class EstablecimientoUpdateDTO {

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @Size(max = 100)
    private String direccion;

    @Size(max = 50)
    private String nombreDirector;

    @Size(max = 15)
    private String telefono;

    @NotNull
    private Jornada jornada;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getNombreDirector() {
        return nombreDirector;
    }

    public void setNombreDirector(String nombreDirector) {
        this.nombreDirector = nombreDirector;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public Jornada getJornada() {
        return jornada;
    }

    public void setJornada(Jornada jornada) {
        this.jornada = jornada;
    }
}
