import { useEffect, useMemo, useState } from 'react'

import type { SelectOption } from './useCatalogOptions'
import { useAlumnoOptions } from './useCatalogOptions'

const normalize = (value: string) => value.trim().toLowerCase()
const formatAlumnoLabel = (label: string) => label.replace(/\s*-\s*/g, ' ').replace(/\s+/g, ' ').trim()

export const useAlumnoSearch = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAlumno, setSelectedAlumno] = useState<SelectOption | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { data: alumnos = [], isLoading } = useAlumnoOptions()

  const formattedAlumnos = useMemo<SelectOption[]>(
    () => alumnos.map((alumno) => ({ ...alumno, label: formatAlumnoLabel(alumno.label) })),
    [alumnos],
  )

  const suggestions = useMemo(() => {
    const normalizedQuery = normalize(searchQuery)
    if (!normalizedQuery) return formattedAlumnos
    return formattedAlumnos.filter((alumno) => normalize(alumno.label).includes(normalizedQuery))
  }, [formattedAlumnos, searchQuery])

  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleInputChange = (value: string) => {
    setSearchQuery(value)
    setSelectedAlumno(null)
    setShowSuggestions(true)
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
  }

  const handleSelectAlumno = (option: SelectOption) => {
    setSelectedAlumno(option)
    setSearchQuery(option.label)
    setShowSuggestions(false)
  }

  const clearSelection = () => {
    setSearchQuery('')
    setSelectedAlumno(null)
    setShowSuggestions(false)
  }

  return {
    searchQuery,
    selectedAlumno,
    selectedAlumnoId: selectedAlumno?.value ?? null,
    suggestions,
    isLoading,
    showSuggestions: showSuggestions && Boolean(searchQuery),
    handleInputChange,
    handleInputFocus,
    handleSelectAlumno,
    clearSelection,
    setShowSuggestions,
  }
}

export type UseAlumnoSearchReturn = ReturnType<typeof useAlumnoSearch>
