import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="flex flex-col items-center min-h-screen py-20">
      <div className="flex flex-col items-center gap-2 mt-8">
        <Image alt="로고" src="/logo.png" height={70} width={70} />
        <h1 className="text-3xl font-bold">Performance For You</h1>
      </div>

      <div className="flex-1 flex flex-col justify-center max-h-[600px] gap-8 sm:gap-12 lg:gap-16">
        <div className="flex flex-col gap-4">
          <div className="text-sm">Please enter the URL below</div>
          <Input className="w-96 h-14" />
        </div>
        <Button size={'lg'} className="w-96">
          Analyze
        </Button>
      </div>
    </div>
  )
}
