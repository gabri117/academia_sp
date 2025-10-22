package com.academia.academia.entity;

import com.academia.academia.entity.enums.Jornada;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "establecimiento")
public class Establecimiento {

    @Id
    @Column(name = "instituto_id", nullable = false)
    private UUID institutoId;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "direccion", length = 100)
    private String direccion;

    @Column(name = "nombre_director", length = 50)
    private String nombreDirector;

    @Column(name = "telefono", length = 15)
    private String telefono;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "jornada", nullable = false, columnDefinition = "jornada_enum")
    private Jornada jornada;

    @PrePersist
    public void prePersist() {
        if (institutoId == null) {
            institutoId = UUID.randomUUID();
        }
    }

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
