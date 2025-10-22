package com.academia.academia.dto.asistencia;

import java.util.UUID;

public class AsistenciaResponseDTO {

    private UUID sessionId;
    private UUID inscripcionId;
    private boolean presente;

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public UUID getInscripcionId() {
        return inscripcionId;
    }

    public void setInscripcionId(UUID inscripcionId) {
        this.inscripcionId = inscripcionId;
    }

    public boolean isPresente() {
        return presente;
    }

    public void setPresente(boolean presente) {
        this.presente = presente;
    }
}
