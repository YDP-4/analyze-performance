import { create } from 'zustand'

interface ToggleState {
  isOpen: boolean
  toggle: () => void
  setOpen: (open: boolean) => void
}

export const useToggleStore = create<ToggleState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
}))
