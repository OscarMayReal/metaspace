import { Button } from "@/components/ui/button";
import { LogInIcon } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <a href={"https://keystone.qplus.cloud/appflow/" + process.env.NEXT_PUBLIC_APPID + "/acquire?redirect=https://localhost:3000/app"}><Button>
        <LogInIcon /> Sign In With Quntem
      </Button></a>
    </div>
  );
}
