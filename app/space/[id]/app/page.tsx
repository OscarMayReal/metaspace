"use client"
import { ActionbarTitle, ActionBar, EditBar, ActionbarHolder, InspectorHolder } from "@/components/shell";
import { useWindowSize } from "@/lib/screensize";
import { BuildingProps, Building, buildingTypes } from "@/lib/buildings";
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
    TilingSprite,
    BitmapText,
    ParticleContainer,
    Particle
} from 'pixi.js';
import type { ApplicationRef, PixiReactElementProps } from "@pixi/react";
import { createContext, Usable, use, useContext, useEffect, useRef, useState } from "react";
import { registerPixiJSActionsMixin, Action } from 'pixijs-actions';
import { AnimatePresence } from "framer-motion";
import { Grid } from "@/components/pixi/Grid";
import { useAuth } from "keystone-lib";
const gridsize = 50;
let scale = 2;
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { Button } from "@/components/ui/button";
import { DoorOpenIcon } from "lucide-react";
import { CommsViewPanel } from "@/components/videoshell";
import { Viewport } from "pixi-viewport";

extend({
    Container: Container,
    Graphics: Graphics,
    Sprite: Sprite,
    NineSliceSprite: NineSliceSprite,
    TilingSprite: TilingSprite,
    BitmapText: BitmapText,
    Viewport: Viewport,
    ParticleContainer: ParticleContainer,
});



export const MetaSpaceContext = createContext({
    socket: null as Socket | null,
    isEditing: false,
    setIsEditing: (isEditing: boolean) => { },
    selectedBuilding: "" as string | null,
    setSelectedBuilding: (selectedBuilding: string | null) => { },
    buildings: [] as BuildingProps[],
    setBuildings: (buildings: BuildingProps[]) => { },
    auth: null as any,
    buildingLockedTo: null as string | null,
    commsToken: null as string | null,
    viewport: null as React.RefObject<Viewport | null> | null,
    playerRef: null as React.RefObject<Sprite | null> | null,
    players: [] as any[],
});

export default function HomePrejoin({ params }: { params: Usable<{ id: string }> }) {
    const [hasJoined, setHasJoined] = useState(false);
    if (!hasJoined) {
        return <div className="w-full h-full flex items-center justify-center">
            <Button onClick={() => setHasJoined(true)}>
                <DoorOpenIcon />
                Join
            </Button>
        </div>
    }
    return <Home params={params} />
}

export function Home({ params }: { params: Usable<{ id: string }> }) {
    const particleContainer = useRef<ParticleContainer>(null);
    const auth = useAuth({ keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!, appId: process.env.NEXT_PUBLIC_APPID! });
    const [socket, setSocket] = useState<Socket | null>(null);
    const { id } = use(params)
    const [players, setPlayers] = useState([] as any[]);
    const [commsToken, setCommsToken] = useState<string | null>(null);
    const [isAppReady, setIsAppReady] = useState(false);
    const viewport = useRef<Viewport>(null);
    const playerRef = useRef<Sprite>(null);
    const [hasFirstConnected, setHasFirstConnected] = useState(false);
    useEffect(() => {
        if (!auth.loaded || !id) return;
        const initdata = window.localStorage.getItem('initdata');
        const socket = io(process.env.NEXT_PUBLIC_API_URL, {
            auth: initdata && !hasFirstConnected ? {
                spaceId: id,
                token: auth.data?.sessionId,
                initdata: initdata
            } : {
                spaceId: id,
                token: auth.data?.sessionId,
            },
        });
        localStorage.removeItem('initdata');
        setSocket(socket);
        setHasFirstConnected(true);
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
        const buildingLockHandler = (buildingLockedTo: string | null) => {
            setBuildingLockedTo(buildingLockedTo);
        };
        const buildingReceivedHandler = (buildings: BuildingProps[]) => {
            setBuildings(buildings);
        };
        const commsTokenHandler = (token: string) => {
            setCommsToken(token);
        };
        socket.on("playerlist.recieved", playerlisthandler);
        socket.on("building.lock.changed", buildingLockHandler);
        socket.on("building.recieved", buildingReceivedHandler);
        socket.on("comms.token", commsTokenHandler);
        return () => {
            socket.off("playerlist.recieved", playerlisthandler);
            socket.off("building.lock.changed", buildingLockHandler);
            socket.off("building.recieved", buildingReceivedHandler);
            socket.off("comms.token", commsTokenHandler);
        }
    }, [socket]);
    useEffect(() => {
        if (!socket) return;
        const playerpositionmovehandler = (data: any) => {
            setPlayers((prevPlayers) => prevPlayers.map((player: any) => {
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
    }, [socket]);
    useEffect(() => {
        console.log("viewport", viewport.current);
        console.log("playerRef", playerRef.current);
        if (!viewport.current || !playerRef.current || !particleContainer.current) return;
        console.log("following");
        viewport.current.follow(playerRef.current);
        viewport.current.screenHeight = size.height / 2;
        viewport.current.screenWidth = size.width / 2;
        viewport.current.worldHeight = 5000;
        viewport.current.worldWidth = 5000;

        const particles: Particle[] = [];

        Assets.load("/snow.png").then((texture) => {
            const particleSpawner = setInterval(() => {
                const particle = new Particle({
                    texture,
                    x: Math.random() * 5000,
                    y: -50,
                });
                particles.push(particle);
                particleContainer.current?.addParticle(particle);
            }, 10);

            const tickFunction = () => {
                for (let i = particles.length - 1; i >= 0; i--) {
                    const particle = particles[i];
                    particle.y += 2;
                    particle.x += Math.sin(particle.y * 0.01) * 0.5;

                    if (particle.y > size.height) {
                        particleContainer.current?.removeParticle(particle);
                        particles.splice(i, 1);
                    }
                }
            };

            Ticker.shared.add(tickFunction);

            return () => {
                clearInterval(particleSpawner);
                Ticker.shared.remove(tickFunction);
                particles.forEach(p => particleContainer.current?.removeParticle(p));
                particles.length = 0;
            };
        });
    }, [isAppReady]);

    const [isEditing, setIsEditing] = useState(false);
    const background = useRef<Sprite>(null);
    const app = useRef<ApplicationRef>(null);
    const ref = useRef<HTMLDivElement>(null);
    const size = useWindowSize();
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [selectedBuilding, setSelectedBuilding] = useState(null as string | null);
    const [buildings, setBuildings] = useState<BuildingProps[]>([]);
    const [buildingLockedTo, setBuildingLockedTo] = useState(null as string | null);
    useEffect(() => {
        if (!isEditing) {
            setSelectedBuilding(null);
            // Send final building state before releasing lock
            if (socket && auth.data?.user?.id && buildingLockedTo === auth.data?.user?.id) {
                socket.emit("building.send", buildings);
            }
        }
        if (buildingLockedTo == null && isEditing && socket && auth.data?.user.id) {
            socket.emit("building.lock", auth.data?.user.id);
        } else if (buildingLockedTo != null && !isEditing && socket) {
            socket.emit("building.unlock");
        }
    }, [isEditing, socket, auth, buildingLockedTo, buildings]);
    useEffect(() => {
        // Only send building updates if we have the lock
        if (!socket || !auth.data?.user?.id || buildingLockedTo !== auth.data?.user?.id) return;

        // Debounce the sync to prevent rapid updates
        const timeout = setTimeout(() => {
            socket.emit("building.send", buildings);
        }, 100);

        return () => clearTimeout(timeout);
    }, [buildings, socket, buildingLockedTo, auth]);


    return <MetaSpaceContext.Provider value={{ socket, isEditing, setIsEditing, auth, selectedBuilding, setSelectedBuilding, buildings, setBuildings, buildingLockedTo, viewport, commsToken, playerRef, players }}><div ref={ref} className="w-full h-full bg-white" >
        <Application onInit={(app) => {
            globalThis.__PIXI_APP__ = app;
            registerPixiJSActionsMixin(Container);
            app.ticker.add(Action.tick);
            app.stage.scale.set(scale);
            setIsAppReady(true);
        }} ref={app} resizeTo={ref} className="appcanvas" autoDensity={true} resolution={window.devicePixelRatio}>
            {isAppReady && <pixiViewport ref={viewport} events={app.current?.getApplication().renderer.events}>
                <pixiContainer>
                    <pixiSprite ref={background} texture={Texture.WHITE} tint={0xFFFFFF} width={5000} height={5000} />
                    {/* <BuildingContainer /> */}
                    {buildings.map((building) => <Building key={building.id} {...building} />)}
                    <Grid width={5000} height={5000} color={"#00000030"} lineThickness={1} pitch={{ x: gridsize, y: gridsize }} />
                    <Player position={position} setPosition={setPosition} remote={false} remotePlayer={undefined} playerRef={playerRef} />
                    {players.map((player, index) => <Player key={index} position={player.position} remote={true} setPosition={player.setPosition} remotePlayer={player} />)}
                </pixiContainer>
            </pixiViewport>}
            <pixiParticleContainer x={0} y={0} ref={particleContainer} width={5000} height={5000} />
        </Application>
        {commsToken != null && <LiveKitRoom serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!} token={commsToken}>
            <ActionbarTitle />
            <ActionbarHolder />
            {isEditing && selectedBuilding !== null && <InspectorHolder />}
            <CommsViewPanel />
            <RoomAudioRenderer />
        </LiveKitRoom>}
    </div></MetaSpaceContext.Provider>
}

function Player({ position, setPosition, remote, remotePlayer, playerRef }: { position: { x: number, y: number }, setPosition: (position: { x: number, y: number }) => void, remote: boolean, remotePlayer?: { id: string, name: string, position: { x: number, y: number }, setPosition: (position: { x: number, y: number }) => void }, playerRef?: RefObject<Sprite> }) {
    const sprite = useRef<Sprite>(null);
    const { auth, buildings, players } = useContext(MetaSpaceContext);
    const name = useRef<BitmapText>(null);
    const [keys, setKeys] = useState({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });
    const playerspeed = 3;

    // Collision detection helper function with layering support
    const checkCollision = (newX: number, newY: number, playerWidth: number = 37, playerHeight: number = 75) => {
        const sideWallThickness = 10; // Thickness for left/right walls
        const topBottomWallThickness = 100; // Thickness for top/bottom walls

        // Find all buildings that overlap with the player's position
        const overlappingBuildings = buildings.filter(building => {
            return (
                newX < building.x + building.width &&
                newX + playerWidth > building.x &&
                newY < building.y + building.height &&
                newY + playerHeight > building.y
            );
        });

        // Check all overlapping buildings for collision
        for (let i = 0; i < overlappingBuildings.length; i++) {
            const building = overlappingBuildings[i];
            const category = buildingTypes[building.type]?.metadata?.category;

            // Skip floors - they're always walkable
            if (category === "Floors") {
                continue;
            }

            // Check if this building is covered by a floor that's above it in z-order
            const hasCoveringFloor = overlappingBuildings.slice(i + 1).some(upperBuilding => {
                return buildingTypes[upperBuilding.type]?.metadata?.category === "Floors";
            });

            // If a floor is on top of this building (in the overlapping area), skip collision check
            if (hasCoveringFloor) {
                continue;
            }

            // For buildings, only walls should be solid (hollow interior)
            if (category === "Buildings") {
                const { x, y, width, height } = building;

                // Check if player is inside the building bounds
                const insideHorizontal = newX >= x && newX + playerWidth <= x + width;
                const insideVertical = newY >= y && newY + playerHeight <= y + height;

                // If completely inside, check if hitting any walls
                if (insideHorizontal && insideVertical) {
                    // Check each wall with appropriate thickness
                    const hitLeftWall = newX < x + sideWallThickness;
                    const hitRightWall = newX + playerWidth > x + width - sideWallThickness;
                    const hitTopWall = newY < y + topBottomWallThickness;
                    const hitBottomWall = newY + playerHeight > y + height - topBottomWallThickness;

                    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
                        return true; // Colliding with a wall
                    }
                } else {
                    // Player is entering from outside - check which walls they're crossing
                    const crossingLeft = newX < x + sideWallThickness && newX + playerWidth > x;
                    const crossingRight = newX < x + width && newX + playerWidth > x + width - sideWallThickness;
                    const crossingTop = newY < y + topBottomWallThickness && newY + playerHeight > y;
                    const crossingBottom = newY < y + height && newY + playerHeight > y + height - topBottomWallThickness;

                    if (crossingLeft || crossingRight || crossingTop || crossingBottom) {
                        return true; // Colliding with a wall from outside
                    }
                }

                // Inside building interior, not hitting walls - continue checking other buildings
                continue;
            }

            // For furniture and other solid objects, full collision
            return true;
        }

        // Check collision with other players (only for local player)
        if (!remote) {
            for (const player of players) {
                const otherPlayerWidth = 37;
                const otherPlayerHeight = 75;
                if (
                    newX < player.position.x + otherPlayerWidth &&
                    newX + playerWidth > player.position.x &&
                    newY < player.position.y + otherPlayerHeight &&
                    newY + playerHeight > player.position.y
                ) {
                    return true; // Collision detected
                }
            }
        }

        return false; // No collision
    };

    useEffect(() => {
        if (!sprite.current || remote || !name.current) return;
        Assets.load('/red.png').then((texture) => {
            if (sprite.current) {
                sprite.current.texture = texture;
            }
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
            let localpos = { ...position };
            const playerWidth = 37;
            const playerHeight = 75;

            if (keys.ArrowUp) {
                const newY = Math.max(0, localpos.y - playerspeed);
                if (!checkCollision(localpos.x, newY, playerWidth, playerHeight)) {
                    localpos.y = newY;
                }
            }
            if (keys.ArrowDown) {
                const newY = Math.min(5000 - playerHeight, localpos.y + playerspeed);
                if (!checkCollision(localpos.x, newY, playerWidth, playerHeight)) {
                    localpos.y = newY;
                }
            }
            if (keys.ArrowLeft) {
                const newX = Math.max(0, localpos.x - playerspeed);
                if (!checkCollision(newX, localpos.y, playerWidth, playerHeight)) {
                    localpos.x = newX;
                }
            }
            if (keys.ArrowRight) {
                const newX = Math.min(5000 - playerWidth, localpos.x + playerspeed);
                if (!checkCollision(newX, localpos.y, playerWidth, playerHeight)) {
                    localpos.x = newX;
                }
            }
            sprite.current?.position.set(localpos.x, localpos.y);
            name.current?.position.set(localpos.x, localpos.y - 30);
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
    }, [sprite.current, position, keys, name.current, buildings, players]);
    useEffect(() => {
        if (!sprite.current || !remote) return;
        Assets.load('/blue.png').then((texture) => {
            sprite.current.texture = texture;
        });
    }, [sprite.current]);
    useEffect(() => {
        if (!name.current) return;
        Assets.load('/font.fnt').then((texture) => {
            name.current.style.fontFamily = "Pixelify Sans";
            name.current.style.fontSize = 10;
            name.current.style.fill = 0x000000;
            if (remote) {
                name.current.text = remotePlayer?.name || "";
            } else {
                name.current.text = auth.data?.user?.name || "";
            }
        });
    }, [name.current]);
    useEffect(() => {
        if (!sprite.current || !remote) return;
        sprite.current.run(Action.moveToX(position.x, 0.1));
        sprite.current.run(Action.moveToY(position.y, 0.1));
    }, [position, sprite.current]);
    // if (remote) return <pixiSprite width={50} height={100} ref={sprite} />;
    return <pixiContainer><pixiSprite width={37} height={75} ref={(Element) => {
        sprite.current = Element;
        if (!remote) {
            playerRef.current = Element;
        }
    }} /><pixiBitmapText text="Hello World" ref={name} x={position.x} y={position.y - 30} /></pixiContainer>
}