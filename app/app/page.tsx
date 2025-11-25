"use client"
import { ActionbarTitle, ActionBar } from "@/components/shell";
import { useWindowSize } from "@/lib/screensize";
import {
    Application,
    extend,
    PixiElements,
} from '@pixi/react';
import {
    Assets,
    Container,
    Graphics,
    Sprite,
    Texture,
    Ticker,
} from 'pixi.js';
import type { ApplicationRef, PixiReactElementProps } from "@pixi/react";
import { useEffect, useRef, useState } from "react";
import { registerPixiJSActionsMixin, Action } from 'pixijs-actions';

const gridsize = 50;

extend({
    Container,
    Graphics,
    Sprite,
});

type BuildingProps = {
    x: number;
    y: number;
    width: number;
    height: number;
    id: number;
}

function Building({ x, y, width, height, setBuildings, id, buildings }: BuildingProps & { setBuildings: (buildings: BuildingProps[]) => void, buildings: BuildingProps[] }) {
    const sprite = useRef<Sprite>(null);
    const [dragging, setDragging] = useState(false);
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
    useEffect(() => {
        if (!sprite.current) return;
        Assets.load('/building.png').then((texture) => {
            sprite.current.texture = texture;
        });
    }, [sprite.current]);
    useEffect(() => {
        if (!sprite.current) return;
        const onMouseMove = (e: MouseEvent) => {
            if (dragging) {
                sprite.current.x = Math.round((e.clientX - mouseOffset.x) / gridsize) * gridsize;
                sprite.current.y = Math.round((e.clientY - mouseOffset.y) / gridsize) * gridsize;
            }
        };
        const onMouseDown = (e: MouseEvent) => {
            if (e.clientX > x && e.clientX < x + width && e.clientY > y && e.clientY < y + height) {
                setDragging(true);
                setMouseOffset({ x: e.clientX - sprite.current.x, y: e.clientY - sprite.current.y });
            }
        };
        const onMouseUp = (e: MouseEvent) => {
            setDragging(false);
            setBuildings(buildings.map((building) => {
                if (building.id === id) {
                    return { ...building, x: sprite.current.x, y: sprite.current.y };
                }
                return building;
            }));
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [sprite.current, x, y, width, height, id, setBuildings, buildings, dragging]);
    return <pixiContainer>
        <pixiSprite ref={sprite} x={x} y={y} width={width} height={height} />
    </pixiContainer>
}

function BuildingContainer() {
    const [buildings, setBuildings] = useState<BuildingProps[]>([
        { x: 100, y: 100, width: 100, height: 100, id: 1 },
        { x: 200, y: 200, width: 100, height: 100, id: 2 },
        { x: 300, y: 300, width: 100, height: 100, id: 3 },
    ]);
    return <pixiContainer>
        {buildings.map((building, index) => <Building key={index} {...building} setBuildings={setBuildings} buildings={buildings} />)}
    </pixiContainer>
}

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
                <BuildingContainer />
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