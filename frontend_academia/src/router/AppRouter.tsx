import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import PrivateRoute from './PrivateRoute'
import RoleRoute from './RoleRoute'
import AppLayout from './AppLayout'

import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import AlumnosList from '../pages/alumnos/AlumnosList'
import AlumnosForm from '../pages/alumnos/AlumnosForm'
import VincularEncargado from '../pages/alumnos/VincularEncargado'
import EncargadosList from '../pages/encargados/EncargadosList'
import EncargadosForm from '../pages/encargados/EncargadosForm'
import EstList from '../pages/establecimientos/EstList'
import EstForm from '../pages/establecimientos/EstForm'
import NivelesList from '../pages/niveles/NivelesList'
import NivelesForm from '../pages/niveles/NivelesForm'
import GradosList from '../pages/grados/GradosList'
import GradosForm from '../pages/grados/GradosForm'
import GradosPorNivel from '../pages/grados/GradosPorNivel'
import CursoCatalogoList from '../pages/cursos/CursoCatalogoList'
import CursoCatalogoForm from '../pages/cursos/CursoCatalogoForm'
import OfertasList from '../pages/ofertas/OfertasList'
import OfertasForm from '../pages/ofertas/OfertasForm'
import InscripcionesList from '../pages/inscripciones/InscripcionesList'
import InscripcionesCreate from '../pages/inscripciones/InscripcionesCreate'
import InscripcionesEdit from '../pages/inscripciones/InscripcionesEdit'
import InscripcionesPorAlumno from '../pages/inscripciones/InscripcionesPorAlumno'
import InscripcionesPorOferta from '../pages/inscripciones/InscripcionesPorOferta'
import SesionesList from '../pages/sesiones/SesionesList'
import SesionesForm from '../pages/sesiones/SesionesForm'
import AsistenciasList from '../pages/asistencias/AsistenciasList'
import AsistenciasForm from '../pages/asistencias/AsistenciasForm'
import RegistrarAsistencia from '../presentation/pages/asistencias/RegistrarAsistencia'
import UnidadesList from '../pages/evaluaciones/UnidadesList'
import UnidadesForm from '../pages/evaluaciones/UnidadesForm'
import CalificacionesList from '../pages/calificaciones/CalificacionesList'
import CalificacionesForm from '../pages/calificaciones/CalificacionesForm'
import TarifasList from '../pages/pagos/TarifasList'
import TarifasForm from '../pages/pagos/TarifasForm'
import CargosList from '../pages/pagos/CargosList'
import RecibosList from '../pages/pagos/RecibosList'
import RecibosForm from '../pages/pagos/RecibosForm'
import ReportesPage from '../pages/estadoCuenta/EstadoCuentaPage'

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          <Route path="alumnos" element={<AlumnosList />} />
          <Route path="alumnos/vinculos" element={<VincularEncargado />} />
          <Route path="alumnos/nuevo" element={<AlumnosForm />} />
          <Route path="alumnos/:id/editar" element={<AlumnosForm />} />

          <Route path="encargados" element={<EncargadosList />} />
          <Route path="encargados/nuevo" element={<EncargadosForm />} />
          <Route path="encargados/:id/editar" element={<EncargadosForm />} />

          <Route path="establecimientos" element={<EstList />} />
          <Route path="establecimientos/nuevo" element={<EstForm />} />
          <Route path="establecimientos/:id/editar" element={<EstForm />} />

          <Route path="niveles" element={<NivelesList />} />
          <Route path="niveles/nuevo" element={<NivelesForm />} />
          <Route path="niveles/:id/editar" element={<NivelesForm />} />

          <Route path="grados" element={<GradosList />} />
          <Route path="grados/nuevo" element={<GradosForm />} />
          <Route path="grados/:id/editar" element={<GradosForm />} />
          <Route path="grados/nivel/:nivelId" element={<GradosPorNivel />} />

          <Route path="cursos" element={<CursoCatalogoList />} />
          <Route path="ofertas" element={<OfertasList />} />
          <Route path="inscripciones" element={<InscripcionesList />} />
          <Route path="inscripciones/alumno/:alumnoId" element={<InscripcionesPorAlumno />} />
          <Route path="inscripciones/oferta/:ofertaId" element={<InscripcionesPorOferta />} />
          <Route path="sesiones" element={<SesionesList />} />
          <Route path="asistencias" element={<AsistenciasList />} />
          <Route
            path="asistencias/registrar/:ofertaId/:sessionId"
            element={<RegistrarAsistencia />}
          />
          <Route path="evaluaciones" element={<UnidadesList />} />
          <Route path="calificaciones" element={<CalificacionesList />} />

          <Route path="pagos">
            <Route index element={<Navigate to="tarifas" replace />} />
            <Route path="tarifas" element={<TarifasList />} />
            <Route path="cargos" element={<CargosList />} />
            <Route path="recibos" element={<RecibosList />} />
          </Route>

          <Route path="reportes" element={<ReportesPage />} />

          <Route element={<RoleRoute roles={['admin']} />}>
            <Route path="cursos/nuevo" element={<CursoCatalogoForm />} />
            <Route path="cursos/:id/editar" element={<CursoCatalogoForm />} />
            <Route path="ofertas/nueva" element={<OfertasForm />} />
            <Route path="ofertas/:id/editar" element={<OfertasForm />} />
            <Route path="inscripciones/nueva" element={<InscripcionesCreate />} />
            <Route path="inscripciones/:id/editar" element={<InscripcionesEdit />} />
            <Route path="sesiones/nueva" element={<SesionesForm />} />
            <Route path="asistencias/nueva" element={<AsistenciasForm />} />
            <Route path="evaluaciones/nueva" element={<UnidadesForm />} />
            <Route path="calificaciones/nueva" element={<CalificacionesForm />} />
            <Route path="pagos/tarifas/nueva" element={<TarifasForm />} />
            <Route path="pagos/recibos/nuevo" element={<RecibosForm />} />
            <Route path="pagos/recibos/editar/:id" element={<RecibosForm />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
)

export default AppRouter
