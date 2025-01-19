import Tabs from '@/components/tabs'
import { ITabsProps } from '@/components/tabs/type'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@radix-ui/react-label'
import Image from 'next/image'

export default function Page() {
  const mockList: ITabsProps[] = [
    {
      idx: 1,
      name: 'DOM Node',
      content: (
        <div>
          <Card className="p-4">
            <CardContent>
              <form>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Name of your project" />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ),
    },
    { idx: 2, name: 'Best Practices', content: <div>컴포넌트2</div> },
    { idx: 3, name: 'Loading', content: <div>컴포넌트3</div> },
  ]

  return (
    <div className="h-svh">
      <div className="flex justify-center items-center my-10">
        <h1 className="relative text-2xl font-bold">
          <Image
            className="absolute right-full bottom-1"
            alt="logo"
            src="/logo.png"
            height={35}
            width={35}
          />
          Performace Result
        </h1>
      </div>
      <div className="mx-7">
        <Tabs tabList={mockList} />
      </div>
    </div>
  )
}
