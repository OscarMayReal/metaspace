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
import { useEffect, useRef, useState } from "react";
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
                <Player />
            </pixiContainer>
        </Application>
        <ActionbarTitle />
        <ActionBar />
    </div>
}

function Player() {
    const sprite = useRef<Sprite>(null);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [keys, setKeys] = useState({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });
    const playerspeed = 5;
    useEffect(() => {
        const keyDownHandler = (e: KeyboardEvent) => {
            var localkeys = keys;
            localkeys[e.key] = true;
            setKeys(localkeys);
        };
        const keyUpHandler = (e: KeyboardEvent) => {
            var localkeys = keys;
            localkeys[e.key] = false;
            setKeys(localkeys);
        };
        window.addEventListener("keydown", keyDownHandler);
        window.addEventListener("keyup", keyUpHandler);
        Ticker.shared.add(() => {
            let localpos = position;
            if (keys.ArrowUp) {
                localpos.y -= playerspeed;
            }
            if (keys.ArrowDown) {
                localpos.y += playerspeed;
            }
            if (keys.ArrowLeft) {
                localpos.x -= playerspeed;
            }
            if (keys.ArrowRight) {
                localpos.x += playerspeed;
            }
            sprite.current?.position.set(localpos.x, localpos.y);
            setPosition(localpos);
        });
        return () => {
            window.removeEventListener("keydown", keyDownHandler);
            window.removeEventListener("keyup", keyUpHandler);
            Ticker.shared.remove(() => {
                let localpos = position;
                if (keys.ArrowUp) {
                    localpos.y -= playerspeed;
                }
                if (keys.ArrowDown) {
                    localpos.y += playerspeed;
                }
                if (keys.ArrowLeft) {
                    localpos.x -= playerspeed;
                }
                if (keys.ArrowRight) {
                    localpos.x += playerspeed;
                }
                sprite.current?.position.set(localpos.x, localpos.y);
                setPosition(localpos);
            });
        }

    }, [sprite.current, position, keys]);
    return <pixiSprite texture={Texture.WHITE} width={50} height={100} ref={sprite} />
}