'use client'
import { useToggleStore } from '@/store/useStore'

export default function ToggleResult() {
  const { isOpen } = useToggleStore()
  return <div className="mx-5 text-pf-red">{isOpen ? '열림' : '닫힘'}</div>
}
