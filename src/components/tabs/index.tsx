'use client'

import { useState } from 'react'
import { ITabsProps } from './type'

export default function Tabs({ tabList }: { tabList: ITabsProps[] }) {
  const [selected, setSelected] = useState<ITabsProps>(tabList[0])

  return (
    <>
      <div className="flex items-center w-full bg-pf-gray text-pf-white rounded-md">
        {tabList.map((v) => (
          <div
            key={v.idx}
            className={`flex-1 py-1 text-center cursor-pointer  ${v.idx === selected.idx ? 'bg-pf-purple font-semibold' : 'bg-pf-gray hover:bg-pf-darknavy hover:bg-opacity-60'} rounded-md m-1`}
            onClick={() => {
              setSelected(v)
            }}
          >
            {v.name}
          </div>
        ))}
      </div>
      <div className=" px-5 py-7 border border-pf-purple rounded-md mt-2">
        {selected.content}
      </div>
    </>
  )
}
