"use client";

import { toast } from "sonner";
import { checkURL } from "@/lib/actions";
import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Page() {
  const formRef = useRef<HTMLFormElement>(null); 

  async function handleCheckURL(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const url = formData.get("url") as string;

    const result = await checkURL(url);

    if (!result.exists) {
      toast.error("❌ URL이 존재하지 않습니다.");
    } else {
      formRef.current?.submit();
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-20">
      <div className="flex flex-col items-center gap-2 mt-8">
        <Image alt="logo" src="/logo.png" height={70} width={70} />
        <h1 className="text-3xl font-bold">Performance For You</h1>
      </div>

      <div className="flex-1 flex flex-col justify-center max-h-[600px] gap-8 sm:gap-12 lg:gap-16">
        <form
          ref={formRef}
          method="GET"
          action="/result"
          onSubmit={handleCheckURL} 
          className="flex flex-col gap-4"
        >
          <div className="text-sm">Please enter the URL below</div>
          <Input
            name="url"
            className="w-96 h-14"
            placeholder="https://example.com"
            required
          />
          <Button
            size="lg"
            type="submit"
            className="w-96 bg-pf-purple text-pf-white border-2 hover:bg-pf-purple hover:bg-opacity-70 tracking-wider text-base py-5"
          >
            Analyze
          </Button>
        </form>
      </div>
    </div>
  );
}
