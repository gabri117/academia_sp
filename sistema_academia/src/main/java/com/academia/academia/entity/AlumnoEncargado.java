package com.academia.academia.entity;

import com.academia.academia.entity.id.AlumnoEncargadoId;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "alumnoencargado")
public class AlumnoEncargado {

    @EmbeddedId
    private AlumnoEncargadoId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("alumnoId")
    @JoinColumn(name = "alumno_id", nullable = false)
    private Alumno alumno;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("encargadoId")
    @JoinColumn(name = "encargado_id", nullable = false)
    private Encargado encargado;

    public AlumnoEncargadoId getId() {
        return id;
    }

    public void setId(AlumnoEncargadoId id) {
        this.id = id;
    }

    public Alumno getAlumno() {
        return alumno;
    }

    public void setAlumno(Alumno alumno) {
        this.alumno = alumno;
    }

    public Encargado getEncargado() {
        return encargado;
    }

    public void setEncargado(Encargado encargado) {
        this.encargado = encargado;
    }
}
