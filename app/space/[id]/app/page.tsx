"use client"
import { ActionbarTitle, ActionBar, EditBar, ActionbarHolder, InspectorHolder } from "@/components/shell";
import { useWindowSize } from "@/lib/screensize";
import { BuildingProps, Building } from "@/lib/buildings";
import {
    Application,
    extend,
    PixiElements,
} from '@pixi/react';
import { io, Socket } from "socket.io-client";
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
import { createContext, Usable, use, useContext, useEffect, useRef, useState } from "react";
import { registerPixiJSActionsMixin, Action } from 'pixijs-actions';
import { AnimatePresence } from "framer-motion";
import { Grid } from "@/components/pixi/Grid";
import { useAuth } from "keystone-lib";
const gridsize = 50;

extend({
    Container: Container,
    Graphics: Graphics,
    Sprite: Sprite,
    NineSliceSprite: NineSliceSprite,
    TilingSprite: TilingSprite,
});



export const MetaSpaceContext = createContext({
    socket: null as Socket | null,
    isEditing: false,
    setIsEditing: (isEditing: boolean) => { },
    selectedBuilding: "",
    setSelectedBuilding: (selectedBuilding: string) => { },
    buildings: [] as BuildingProps[],
    setBuildings: (buildings: BuildingProps[]) => { },
    auth: null as any,
});

export default function Home({ params }: Usable<{ id: string }>) {
    const auth = useAuth({ keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!, appId: process.env.NEXT_PUBLIC_APPID! });
    const [socket, setSocket] = useState<Socket | null>(null);
    const { id } = use(params)
    const [players, setPlayers] = useState([] as any[]);
    useEffect(() => {
        if (!auth.loaded || !id) return;
        const socket = io(process.env.NEXT_PUBLIC_API_URL, {
            auth: {
                spaceId: id,
                token: auth.data?.sessionId
            }
        });
        setSocket(socket);
        setInterval(() => {
            socket.emit("position.send", position);
        }, 100);
        return () => {
            socket.disconnect();
        }
    }, [auth.loaded, id]);
    useEffect(() => {
        if (!socket) return;
        const playerlisthandler = (players: any[]) => {
            const newplayers = players.filter((player: any) => player.id !== auth.data?.user.id);
            setPlayers(newplayers);
        };
        socket.on("playerlist.recieved", playerlisthandler);
        return () => {
            socket.off("playerlist.recieved", playerlisthandler);
        }
    }, [socket, players]);
    useEffect(() => {
        if (!socket) return;
        const playerpositionmovehandler = (data: any) => {
            setPlayers(players.map((player: any) => {
                if (player.id === data.id) {
                    player.position = data.position;
                }
                return player;
            }));
        };
        socket.on("player.position.move", playerpositionmovehandler);
        return () => {
            socket.off("player.position.move", playerpositionmovehandler);
        }
    }, [socket, players]);
    useEffect(() => {
        console.log(players);
    }, [players]);
    const [isEditing, setIsEditing] = useState(false);
    const background = useRef<Sprite>(null);
    const app = useRef<ApplicationRef>(null);
    const ref = useRef<HTMLDivElement>(null);
    const size = useWindowSize();
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [selectedBuilding, setSelectedBuilding] = useState(null as string | null);
    const [buildings, setBuildings] = useState<BuildingProps[]>([
        { x: 0, y: 0, width: 10000, height: 10000, id: "0", type: "grassfloor", locked: true },
        // { x: 200, y: 200, width: 100, height: 100, id: "1", type: "stonefloor", locked: false },
        // { x: 300, y: 300, width: 100, height: 100, id: "2", type: "woodfloor", locked: false },
        // { x: 400, y: 400, width: 100, height: 100, id: "3", type: "building", locked: false },
        // { x: 500, y: 500, width: 100, height: 100, id: "4", type: "building", locked: false },
        // { x: 600, y: 600, width: 100, height: 100, id: "5", type: "building", locked: false },
    ]);
    useEffect(() => {
        if (!isEditing) {
            setSelectedBuilding(null);
        }
    }, [isEditing]);
    useEffect(() => {
        if (!background.current) return;
        background.current.width = size.width;
        background.current.height = size.height;
    }, [size, background.current]);
    return <MetaSpaceContext.Provider value={{ socket, isEditing, setIsEditing, auth, selectedBuilding, setSelectedBuilding, buildings, setBuildings }}><div ref={ref} className="w-full h-full bg-white" >
        <Application onInit={(app) => {
            globalThis.__PIXI_APP__ = app;
            registerPixiJSActionsMixin(Container);
            app.ticker.add(Action.tick);
            app.renderer.canvas.getContext("2d").imageSmoothingEnabled = false;
        }} ref={app} resizeTo={ref} className="appcanvas" autoDensity={true} resolution={window.devicePixelRatio}>
            <pixiContainer>
                <pixiSprite ref={background} texture={Texture.WHITE} />
                {/* <BuildingContainer /> */}
                {buildings.map((building, index) => <Building key={index} {...building} />)}
                <Grid width={size.width} height={size.height} color={"#00000030"} lineThickness={1} pitch={{ x: gridsize, y: gridsize }} />
                <Player position={position} setPosition={setPosition} remote={false} />
                {players.map((player, index) => <Player key={index} position={player.position} remote={true} setPosition={player.setPosition} />)}
            </pixiContainer>
        </Application>
        <ActionbarTitle />
        <ActionbarHolder />
        {isEditing && selectedBuilding !== null && <InspectorHolder />}
    </div></MetaSpaceContext.Provider>
}

function Player({ position, setPosition, remote }: { position: { x: number, y: number }, setPosition: (position: { x: number, y: number }) => void, remote: boolean }) {
    const sprite = useRef<Sprite>(null);
    const [keys, setKeys] = useState({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });
    const playerspeed = 3;
    useEffect(() => {
        if (!sprite.current || remote) return;
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
    useEffect(() => {
        if (!sprite.current || !remote) return;
        Assets.load('/blue.png').then((texture) => {
            sprite.current.texture = texture;
        });
    }, [sprite.current]);
    useEffect(() => {
        if (!sprite.current || !remote) return;
        sprite.current.run(Action.moveToX(position.x, 0.1));
        sprite.current.run(Action.moveToY(position.y, 0.1));
    }, [position, sprite.current]);
    // if (remote) return <pixiSprite width={50} height={100} ref={sprite} />;
    return <pixiSprite width={50} height={100} ref={sprite} />
}