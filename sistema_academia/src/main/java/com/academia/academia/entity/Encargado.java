package com.academia.academia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "encargado")
public class Encargado {

    @Id
    @Column(name = "encargado_id", nullable = false)
    private UUID encargadoId;

    @Column(name = "nombre", nullable = false, length = 50)
    private String nombre;

    @Column(name = "apellido", nullable = false, length = 50)
    private String apellido;

    @Column(name = "telefono", length = 15)
    private String telefono;

    @PrePersist
    public void prePersist() {
        if (encargadoId == null) {
            encargadoId = UUID.randomUUID();
        }
    }

    public UUID getEncargadoId() {
        return encargadoId;
    }

    public void setEncargadoId(UUID encargadoId) {
        this.encargadoId = encargadoId;
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
}
