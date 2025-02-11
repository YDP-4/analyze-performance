'use client'

import Tabs from '@/components/tabs'
import { ITabsProps } from '@/components/tabs/type'
import { fetcher } from '@/lib/fetcher'
import Image from 'next/image'
import DomGraph from './components/DomGraph'
import { AnalyzeResult } from '../types'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import PageLoadGraph from './components/PageLoadGraph'

async function getData(url: string): Promise<AnalyzeResult> {
  if (!url || !url.startsWith('http')) {
    throw new Error('Invalid URL provided.')
  }

  const encodedUrl = encodeURIComponent(url);
  const response = await fetcher(`http://localhost:3000/api/analyze?url=${encodedUrl}`)
  return response
}

export default function Page() {
  const params = useSearchParams()
  const url = params.get('url')

  const [data, setData] = useState<AnalyzeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) {
      setError('No URL provided')
      return
    }

    const fetchData = async () => {
      try {
        const result = await getData(url)
        setData(result)
      } catch (err) {
        setError('Failed to fetch data')
        console.error(err)
      }
    }

    fetchData()
  }, [url])

  if (error) {
    return <div className="text-center mt-10">{error}</div>
  }

  if (!data) {
    return <div className="text-center mt-10">Loading...</div>
  }

  const mockList: ITabsProps[] = [
    {
      idx: 1,
      name: 'DOM Node',
      content: <DomGraph data={data.domGraph} />,
    },
    { idx: 2, name: 'Best Practices', content: <div>컴포넌트2</div> },
    { idx: 3, name: 'Loading', content: <PageLoadGraph timingData={data.navigationTiming} /> },
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