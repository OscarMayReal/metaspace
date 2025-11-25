"use client"
import { ActionbarTitle, ActionBar } from "@/components/shell";
import { useWindowSize } from "@/lib/screensize";
import {
    Application,
    extend,
    PixiElements,

} from '@pixi/react';
import {
    Container,
    Graphics,
    Sprite,
    Texture,
} from 'pixi.js';
import type { PixiReactElementProps } from "@pixi/react";
import { useEffect, useRef } from "react";

extend({
    Container,
    Graphics,
    Sprite,
});

export default function Home() {
    const ref = useRef<HTMLDivElement>(null);
    return <div ref={ref} className="w-full h-full bg-[#75eba4]" >
        <Application resizeTo={ref}>
            <pixiContainer>
                <GreenSquare />
            </pixiContainer>
        </Application>
        <ActionbarTitle />
        <ActionBar />
    </div>
}

function GreenSquare() {
    const sprite = useRef<Sprite>(null);
    useEffect(() => {
        const moveToMouse = (e: MouseEvent) => {
            if (sprite.current) {
                sprite.current.x = e.clientX;
                sprite.current.y = e.clientY;
            }
        }
        const mouseDown = (e: MouseEvent) => {
            if (sprite.current) {
                sprite.current.scale.x *= 2;
                sprite.current.scale.y *= 2;
            }
        }
        const mouseUp = (e: MouseEvent) => {
            if (sprite.current) {
                sprite.current.scale.x /= 2;
                sprite.current.scale.y /= 2;
            }
        }
        window.addEventListener("mousemove", moveToMouse);
        window.addEventListener("mousedown", mouseDown);
        window.addEventListener("mouseup", mouseUp);
        return () => {
            window.removeEventListener("mousemove", moveToMouse);
            window.removeEventListener("mousedown", mouseDown);
            window.removeEventListener("mouseup", mouseUp);
        };
    }, []);
    return <pixiSprite texture={Texture.WHITE} width={100} height={100} ref={sprite} />
}