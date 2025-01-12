'use client'

import { useToggleStore } from '@/store/useStore'
import { Button } from '../ui/button'

export default function ToggleButton() {
  const { toggle } = useToggleStore()
  return <Button onClick={toggle}>버튼 zustand</Button>
}
