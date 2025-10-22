package com.academia.academia.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "cursocatalogo")
public class CursoCatalogo {

    @Id
    @Column(name = "curso_id", nullable = false)
    private UUID cursoId;

    @Column(name = "nombre", nullable = false, length = 30)
    private String nombre;

    @Column(name = "nivel_curso", length = 20)
    private String nivelCurso;

    @Column(name = "duracion", length = 20)
    private String duracion;

    @PrePersist
    public void prePersist() {
        if (cursoId == null) {
            cursoId = UUID.randomUUID();
        }
    }

    public UUID getCursoId() {
        return cursoId;
    }

    public void setCursoId(UUID cursoId) {
        this.cursoId = cursoId;
    }

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
