package com.academia.academia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.UUID;

@Entity
@Table(
    name = "gradoacademico",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"nivel_id", "nombre"})
    }
)
public class GradoAcademico {

    @Id
    @Column(name = "grado_id", nullable = false)
    private UUID gradoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nivel_id", nullable = false)
    private NivelAcademico nivelAcademico;

    @Column(name = "nombre", nullable = false, length = 50)
    private String nombre;

    @PrePersist
    public void prePersist() {
        if (gradoId == null) {
            gradoId = UUID.randomUUID();
        }
    }

    public UUID getGradoId() {
        return gradoId;
    }

    public void setGradoId(UUID gradoId) {
        this.gradoId = gradoId;
    }

    public NivelAcademico getNivelAcademico() {
        return nivelAcademico;
    }

    public void setNivelAcademico(NivelAcademico nivelAcademico) {
        this.nivelAcademico = nivelAcademico;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
