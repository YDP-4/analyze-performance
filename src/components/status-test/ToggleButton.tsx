'use client'

import { useToggleStore } from '@/store/useStore'
import { Button } from '../ui/button'

export default function ToggleButton() {
  const { toggle } = useToggleStore()
  return <Button onClick={toggle} className='bg-pf-purple text-pf-white hover:bg-pf-purple hover:bg-opacity-70 border-b-2 border-r-2 '>버튼 zustand</Button>
}
