"use client"
import { ActionbarTitle, ActionBar, EditBar, ActionbarHolder } from "@/components/shell";
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
    NineSliceSprite,
    SCALE_MODES,
} from 'pixi.js';
import type { ApplicationRef, PixiReactElementProps } from "@pixi/react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { registerPixiJSActionsMixin, Action } from 'pixijs-actions';
import { AnimatePresence } from "framer-motion";
import { Grid } from "@/components/pixi/Grid";

const gridsize = 50;

extend({
    Container: Container,
    Graphics: Graphics,
    Sprite: Sprite,
    NineSliceSprite: NineSliceSprite,
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
    const { isEditing } = useContext(MetaSpaceContext);
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
    const resizeHandle = useRef<Sprite>(null);
    useEffect(() => {
        if (!sprite.current) return;
        Assets.load('/building.png').then((texture) => {
            texture.baseTexture.scaleMode = 'nearest';
            sprite.current.texture = texture;
        });
    }, [sprite.current]);
    useEffect(() => {
        if (!sprite.current) return;
        const onMouseMove = (e: MouseEvent) => {
            if (dragging) {
                sprite.current.x = Math.round((e.clientX - mouseOffset.x) / gridsize) * gridsize;
                sprite.current.y = Math.round((e.clientY - mouseOffset.y) / gridsize) * gridsize;
                resizeHandle.current.x = sprite.current.x + sprite.current.width - 10;
                resizeHandle.current.y = sprite.current.y + sprite.current.height - 10;
            } else if (resizing) {
                sprite.current.width = Math.round((e.clientX - sprite.current.x) / gridsize) * gridsize;
                sprite.current.height = Math.round((e.clientY - sprite.current.y) / gridsize) * gridsize;
                resizeHandle.current.x = sprite.current.x + sprite.current.width - 10;
                resizeHandle.current.y = sprite.current.y + sprite.current.height - 10;
            }
        };
        const onMouseDown = (e: MouseEvent) => {
            if (!isEditing) return;
            if ((e.clientX > x && e.clientX < x + width && e.clientY > y && e.clientY < y + height) && !(e.clientX > x + width - 10 && e.clientY > y + height - 10)) {
                setDragging(true);
                setMouseOffset({ x: e.clientX - sprite.current.x, y: e.clientY - sprite.current.y });
            } else if (e.clientX > x + width - 10 && e.clientY > y + height - 10 && e.clientX < x + width && e.clientY < y + height) {
                setResizing(true);
                setMouseOffset({ x: e.clientX - sprite.current.x + width - 10, y: e.clientY - sprite.current.y + height - 10 });
            }
        };
        const onMouseUp = (e: MouseEvent) => {
            setDragging(false);
            setResizing(false);
            setBuildings(buildings.map((building) => {
                if (building.id === id) {
                    return { ...building, x: sprite.current.x, y: sprite.current.y, width: sprite.current.width, height: sprite.current.height };
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
    }, [sprite.current, x, y, width, height, id, setBuildings, buildings, dragging, resizing]);
    return <pixiContainer>
        <pixiNineSliceSprite ref={sprite} topHeight={10} bottomHeight={10} leftWidth={10} rightWidth={10} x={x} y={y} width={width} height={height} />
        {isEditing && <pixiSprite ref={resizeHandle} texture={Texture.WHITE} x={x + width - 10} y={y + height - 10} width={10} height={10} />}
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

export const MetaSpaceContext = createContext({
    isEditing: false,
    setIsEditing: (isEditing: boolean) => { },
});

export default function Home() {
    const [isEditing, setIsEditing] = useState(false);
    const background = useRef<Sprite>(null);
    const app = useRef<ApplicationRef>(null);
    const ref = useRef<HTMLDivElement>(null);
    const size = useWindowSize();
    useEffect(() => {
        if (!background.current) return;
        background.current.width = size.width;
        background.current.height = size.height;
    }, [size, background.current]);
    return <MetaSpaceContext.Provider value={{ isEditing, setIsEditing }}><div ref={ref} className="w-full h-full bg-white" >
        <Application onInit={(app) => {
            globalThis.__PIXI_APP__ = app;
            registerPixiJSActionsMixin(Container);
            app.ticker.add(Action.tick);
        }} ref={app} resizeTo={ref} autoDensity={true} resolution={window.devicePixelRatio}>
            <pixiContainer>
                <pixiSprite ref={background} texture={Texture.WHITE} />
                <BuildingContainer />
                <Player />
                <Grid width={size.width} height={size.height} color={"#00000030"} lineThickness={1} pitch={{ x: gridsize, y: gridsize }} />
            </pixiContainer>
        </Application>
        <ActionbarTitle />
        <ActionbarHolder />
    </div></MetaSpaceContext.Provider>
}

function Player() {
    const sprite = useRef<Sprite>(null);
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [keys, setKeys] = useState({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });
    const playerspeed = 5;
    useEffect(() => {
        if (!sprite.current) return;
        Assets.load('/red.png').then((texture) => {
            sprite.current.texture = texture;
        });
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
        const tickFuncion = () => {
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
        }
        window.addEventListener("keydown", keyDownHandler);
        window.addEventListener("keyup", keyUpHandler);
        Ticker.shared.add(tickFuncion);
        return () => {
            window.removeEventListener("keydown", keyDownHandler);
            window.removeEventListener("keyup", keyUpHandler);
            Ticker.shared.remove(tickFuncion);
        }

    }, [sprite.current, position, keys]);
    return <pixiSprite width={50} height={100} ref={sprite} />
}