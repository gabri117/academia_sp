package com.academia.academia.dto.alumno;

import com.academia.academia.entity.enums.AlumnoEstado;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public class AlumnoUpdateDTO {

    private UUID institutoId;

    @NotBlank
    @Size(max = 50)
    private String nombre;

    @NotBlank
    @Size(max = 50)
    private String apellido;

    @Size(max = 15)
    private String telefono;

    @Size(max = 100)
    private String direccion;

    @Size(max = 20)
    private String carnet;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaNacimiento;

    private AlumnoEstado estado = AlumnoEstado.activo;

    public UUID getInstitutoId() {
        return institutoId;
    }

    public void setInstitutoId(UUID institutoId) {
        this.institutoId = institutoId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getCarnet() {
        return carnet;
    }

    public void setCarnet(String carnet) {
        this.carnet = carnet;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public AlumnoEstado getEstado() {
        return estado;
    }

    public void setEstado(AlumnoEstado estado) {
        this.estado = estado;
    }
}
