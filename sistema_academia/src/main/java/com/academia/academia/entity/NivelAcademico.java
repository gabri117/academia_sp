package com.academia.academia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "nivelacademico")
public class NivelAcademico {

    @Id
    @Column(name = "nivel_id", nullable = false)
    private UUID nivelId;

    @Column(name = "nombre", nullable = false, length = 20, unique = true)
    private String nombre;

    @PrePersist
    public void prePersist() {
        if (nivelId == null) {
            nivelId = UUID.randomUUID();
        }
    }

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
