"use client"
import { ActionbarTitle, ActionBar, EditBar, ActionbarHolder, InspectorHolder } from "@/components/shell";
import { useWindowSize } from "@/lib/screensize";
import { BuildingProps, Building } from "@/lib/buildings";
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
    TilingSprite
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
    TilingSprite: TilingSprite,
});



export const MetaSpaceContext = createContext({
    isEditing: false,
    setIsEditing: (isEditing: boolean) => { },
    selectedBuilding: "",
    setSelectedBuilding: (selectedBuilding: string) => { },
    buildings: [] as BuildingProps[],
    setBuildings: (buildings: BuildingProps[]) => { },
});

export default function Home() {
    const [isEditing, setIsEditing] = useState(false);
    const background = useRef<Sprite>(null);
    const app = useRef<ApplicationRef>(null);
    const ref = useRef<HTMLDivElement>(null);
    const size = useWindowSize();
    const [buildings, setBuildings] = useState<BuildingProps[]>([
        { x: 100, y: 100, width: 100, height: 100, id: "0", type: "grassfloor" },
        { x: 200, y: 200, width: 100, height: 100, id: "1", type: "stonefloor" },
        { x: 300, y: 300, width: 100, height: 100, id: "2", type: "woodfloor" },
        { x: 400, y: 400, width: 100, height: 100, id: "3", type: "building" },
        { x: 500, y: 500, width: 100, height: 100, id: "4", type: "building" },
        { x: 600, y: 600, width: 100, height: 100, id: "5", type: "building" },
    ]);
    useEffect(() => {
        console.log(buildings);
    }, [buildings]);
    const [selectedBuilding, setSelectedBuilding] = useState(null as string | null);
    useEffect(() => {
        if (!background.current) return;
        background.current.width = size.width;
        background.current.height = size.height;
    }, [size, background.current]);
    return <MetaSpaceContext.Provider value={{ isEditing, setIsEditing, selectedBuilding, setSelectedBuilding, buildings, setBuildings }}><div ref={ref} className="w-full h-full bg-white" >
        <Application onInit={(app) => {
            globalThis.__PIXI_APP__ = app;
            registerPixiJSActionsMixin(Container);
            app.ticker.add(Action.tick);
        }} ref={app} resizeTo={ref} autoDensity={true} resolution={window.devicePixelRatio}>
            <pixiContainer>
                <pixiSprite ref={background} texture={Texture.WHITE} />
                {/* <BuildingContainer /> */}
                {buildings.map((building, index) => <Building key={index} {...building} />)}
                <Grid width={size.width} height={size.height} color={"#00000030"} lineThickness={1} pitch={{ x: gridsize, y: gridsize }} />
                <Player />
            </pixiContainer>
        </Application>
        <ActionbarTitle />
        <ActionbarHolder />
        {isEditing && selectedBuilding !== null && <InspectorHolder />}
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