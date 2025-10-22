package com.academia.academia.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.academia.academia.dto.pagos.ReciboOfertaFlat;
import com.academia.academia.entity.Alumno;
import com.academia.academia.entity.Establecimiento;
import com.academia.academia.entity.Recibo;
import com.academia.academia.entity.enums.Jornada;
import com.academia.academia.entity.enums.ReciboEstado;
import java.sql.Connection;
import java.sql.Statement;
import java.util.List;
import java.util.UUID;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ReciboRepositoryTest {

    private static final String SYNC_ENUM_SQL = "DO $$\n" +
            "BEGIN\n" +
            "    IF EXISTS (\n" +
            "        SELECT 1\n" +
            "        FROM pg_type t\n" +
            "        WHERE t.typname = 'recibo_estado_enum'\n" +
            "    ) THEN\n" +
            "        IF EXISTS (\n" +
            "            SELECT 1 FROM pg_enum e\n" +
            "            JOIN pg_type t ON e.enumtypid = t.oid\n" +
            "            WHERE t.typname = 'recibo_estado_enum' AND e.enumlabel = 'emitido'\n" +
            "        ) THEN\n" +
            "            ALTER TYPE recibo_estado_enum RENAME VALUE 'emitido' TO 'EMITIDO';\n" +
            "        END IF;\n" +
            "        IF EXISTS (\n" +
            "            SELECT 1 FROM pg_enum e\n" +
            "            JOIN pg_type t ON e.enumtypid = t.oid\n" +
            "            WHERE t.typname = 'recibo_estado_enum' AND e.enumlabel = 'anulado'\n" +
            "        ) THEN\n" +
            "            ALTER TYPE recibo_estado_enum RENAME VALUE 'anulado' TO 'ANULADO';\n" +
            "        END IF;\n" +
            "    END IF;\n" +
            "END\n" +
            "$$;";

    @Autowired
    private ReciboRepository reciboRepository;

    @Autowired
    private EstablecimientoRepository establecimientoRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private DataSource dataSource;

    @BeforeEach
    void sincronizarEnum() throws Exception {
        try (Connection connection = dataSource.getConnection(); Statement statement = connection.createStatement()) {
            statement.execute(SYNC_ENUM_SQL);
        }
    }

    @Test
    void guardaReciboConEstadoPorDefecto() {
        Alumno alumno = persistirAlumnoConInstituto();

        Recibo recibo = new Recibo();
        recibo.setAlumno(alumno);
        recibo.setCorrelativoRecibo(generarCorrelativo());

        Recibo guardado = reciboRepository.saveAndFlush(recibo);

        assertNotNull(guardado.getReciboId(), "Debe asignar identificador");
        assertEquals(ReciboEstado.EMITIDO, guardado.getEstado(), "El estado por defecto debe ser EMITIDO");
    }

    @Test
    void findRecibosConOfertasFiltraPorEstado() {
        Alumno alumno = persistirAlumnoConInstituto();

        Recibo emitido = new Recibo();
        emitido.setAlumno(alumno);
        emitido.setCorrelativoRecibo(generarCorrelativo());
        reciboRepository.save(emitido);

        Recibo anulado = new Recibo();
        anulado.setAlumno(alumno);
        anulado.setCorrelativoRecibo(generarCorrelativo());
        anulado.setEstado(ReciboEstado.ANULADO);
        reciboRepository.saveAndFlush(anulado);

        List<ReciboOfertaFlat> resultados =
                reciboRepository.findRecibosConOfertas(null, ReciboEstado.ANULADO, null, null);

        assertEquals(1, resultados.size(), "El filtro por estado debe devolver unicamente los anulados");
        assertEquals(ReciboEstado.ANULADO, resultados.get(0).estado(), "Debe mapear el enum nativo correctamente");
    }

    private Alumno persistirAlumnoConInstituto() {
        Establecimiento establecimiento = new Establecimiento();
        establecimiento.setNombre("Instituto Test " + UUID.randomUUID());
        establecimiento.setJornada(Jornada.Matutina);
        establecimiento = establecimientoRepository.save(establecimiento);

        Alumno alumno = new Alumno();
        alumno.setEstablecimiento(establecimiento);
        alumno.setNombre("Juan");
        alumno.setApellido("Perez");
        alumno.setDireccion("Direccion prueba");
        return alumnoRepository.save(alumno);
    }

    private String generarCorrelativo() {
        return "REC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}
