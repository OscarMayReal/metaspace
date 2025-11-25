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
    Ticker,
} from 'pixi.js';
import type { ApplicationRef, PixiReactElementProps } from "@pixi/react";
import { useEffect, useRef } from "react";
import { registerPixiJSActionsMixin, Action } from 'pixijs-actions';

extend({
    Container,
    Graphics,
    Sprite,
});

export default function Home() {
    const app = useRef<ApplicationRef>(null);
    const ref = useRef<HTMLDivElement>(null);
    return <div ref={ref} className="w-full h-full bg-[#75eba4]" >
        <Application onInit={(app) => {
            globalThis.__PIXI_APP__ = app;
            registerPixiJSActionsMixin(Container);
            app.ticker.add(Action.tick);
        }} ref={app} resizeTo={ref}>
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
        // if (sprite.current) {
        //     sprite.current.run(Action.repeatForever(Action.rotateBy(100, 10)))
        // }
        const mouseDown = (e: MouseEvent) => {
            if (sprite.current) {
                sprite.current.run(Action.scaleToSize(200, 200, 0.1).easeInOut())
            }
        }
        const mouseUp = (e: MouseEvent) => {
            if (sprite.current) {
                sprite.current.run(Action.scaleToSize(100, 100, 0.1).easeInOut())
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
    }, [sprite.current]);
    return <pixiSprite x={100} y={100} texture={Texture.WHITE} width={100} height={100} ref={sprite} />
}