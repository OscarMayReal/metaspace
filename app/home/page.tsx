"use client"
import Header from "@/components/homeshell";
import { useAuth } from "keystone-lib";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowUpFromLineIcon, DoorOpenIcon, PlusIcon, SquareDashedIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
export default function Home() {
    const auth = useAuth({ keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!, appId: process.env.NEXT_PUBLIC_APPID! });
    const [spaceId, setSpaceId] = useState('');
    return <div className="homeshell">
        <Header auth={auth} />
        <div className="homeshell-main">
            <div className="homeshell-main-title">
                Welcome back to MetaSpace, {auth?.data?.user?.name}
            </div>
            <div className="homeshell-button-row">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline"><PlusIcon />Start a Space</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                            const spaceid = Math.random().toString(36).substring(2, 8);
                            window.location.href = '/space/' + spaceid + '/app';
                        }}><SquareDashedIcon />Empty Space</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            const file = document.createElement('input');
                            file.type = 'file';
                            file.accept = '.json';
                            file.onchange = (event) => {
                                const file = (event.target as HTMLInputElement).files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        const data = (event.target as FileReader).result as string;
                                        window.localStorage.setItem('initdata', data);
                                        window.location.href = '/space/' + Math.random().toString(36).substring(2, 8) + '/app';
                                    };
                                    reader.readAsText(file);
                                }
                            };
                            file.click();
                        }}><ArrowUpFromLineIcon />Import from File</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline"><DoorOpenIcon />Join a Space</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Join a Space</DialogTitle>
                            <DialogDescription>
                                Enter the ID of the space you want to join.
                            </DialogDescription>
                        </DialogHeader>
                        <Input
                            placeholder="Space ID"
                            value={spaceId}
                            onChange={(e) => setSpaceId(e.target.value)}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="submit" onClick={() => window.location.href = '/space/' + spaceId + '/app'}>Join</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    </div>
}