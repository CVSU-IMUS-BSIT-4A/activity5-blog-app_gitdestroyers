import { useCallback, useState } from 'react'

export function useSettingsDialog() {
  const [open, setOpen] = useState(false)

  const openDialog = useCallback(() => setOpen(true), [])
  const closeDialog = useCallback(() => setOpen(false), [])
  const toggleDialog = useCallback(() => setOpen((v) => !v), [])

  return {
    open,
    setOpen,
    openDialog,
    closeDialog,
    toggleDialog,
  }
}


