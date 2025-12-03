"use client"
import { Button } from "@/components/ui/button";
import { LogInIcon } from "lucide-react";
import Image from "next/image";
import { useAuth } from "keystone-lib";

export default function Home() {
  const auth = useAuth({ keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!, appId: process.env.NEXT_PUBLIC_APPID! });
  return (
    <div>
      <header>
        <img src="/MetaSpace.svg" className="header-logo" alt="" />
        <div className="header-title">
          <span className="quntem-text">Quntem</span><span className="metaspace-text"> MetaSpace</span>
        </div>
        <div className="flex-1" />
        <a href={auth.data?.sessionId ? "/home" : "https://keystone.qplus.cloud/appflow/" + process.env.NEXT_PUBLIC_APPID + "/acquire?redirect=https://metaspace.quntem.co.uk/home"}><Button variant="outline" size="sm">
          <LogInIcon /> Sign In With Quntem
        </Button></a>
      </header>
      <main className="flex flex-col items-center justify-center h-screen gap-4">
        <img src="/MetaSpace.svg" className="homepage-logo" alt="" />
        <h1 className="text-4xl">MetaSpace</h1>
        <p className="text-lg">MetaSpace is a social platform, a fun place to hang out with friends while you talk.</p>
        <div className="flex gap-2">
          <a href={auth.data?.sessionId ? "/home" : "https://keystone.qplus.cloud/appflow/" + process.env.NEXT_PUBLIC_APPID + "/acquire?redirect=https://metaspace.quntem.co.uk/home"}><Button variant="outline" size="sm">
            <LogInIcon /> Sign In With Quntem
          </Button></a>
        </div>
      </main>
    </div>
  );
}
