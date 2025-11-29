"use client"
import { MetaSpaceContext } from "@/app/space/[id]/app/page";
import { Action } from "pixijs-actions";
import { useContext, useEffect, useRef, useState } from "react";
import {
    extend,
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
    TilingSprite,
    Filter,
    TilingSpriteOptions,
} from 'pixi.js';
import { ArrowDownToLineIcon, FlowerIcon, HomeIcon, Icon, SnowflakeIcon, SpeakerIcon, TableIcon, TrashIcon, TreesIcon, TvIcon } from "lucide-react";
import { OutlineFilter } from 'pixi-filters';

const gridsize = 50;
let scale = 2;

extend({
    Container: Container,
    Graphics: Graphics,
    Sprite: Sprite,
    NineSliceSprite: NineSliceSprite,
    TilingSprite: TilingSprite,
});

type buildingInfo = {
    Icon: React.JSX.ElementType,
    texture: string;
    type: "9slice" | "tiling" | "sprite";
    options?: {
        topHeight: number;
        bottomHeight: number;
        leftWidth: number;
        rightWidth: number;
    };
    name: string;
    metadata: {
        name: string;
        description: string;
        category?: string;
    };
}


export const buildingTypes: Record<string, buildingInfo> = {
    "building": {
        Icon: HomeIcon,
        texture: "/newbuilding.png",
        type: "9slice",
        options: {
            topHeight: 100,
            bottomHeight: 100,
            leftWidth: 10,
            rightWidth: 10
        },
        name: "building",
        metadata: {
            name: "Building",
            description: "A basic building",
            category: "Buildings"
        }
    },
    rug: {
        Icon: ArrowDownToLineIcon,
        texture: "/rug.png",
        type: "9slice",
        options: {
            topHeight: 12,
            bottomHeight: 12,
            leftWidth: 12,
            rightWidth: 12
        },
        name: "rug",
        metadata: {
            name: "Rug",
            description: "A rug",
            category: "Floors"
        }
    },
    "stonefloor": {
        Icon: ArrowDownToLineIcon,
        texture: "/stonefloor.png",
        type: "tiling",
        name: "stonefloor",
        metadata: {
            name: "Stone Floor",
            description: "A stone floor",
            category: "Floors"
        }
    },
    "woodfloor": {
        Icon: TreesIcon,
        texture: "/woodfloor.png",
        type: "tiling",
        name: "woodfloor",
        metadata: {
            name: "Wood Floor",
            description: "A wooden floor",
            category: "Floors"
        }
    },
    "cabinet": {
        Icon: TableIcon,
        texture: "/cabinet1.png",
        type: "sprite",
        name: "cabinet",
        metadata: {
            name: "Cabinet",
            description: "A cabinet",
            category: "Furniture"
        }
    },
    "cabinet2": {
        Icon: TableIcon,
        texture: "/cabinet2.png",
        type: "sprite",
        name: "cabinet (Longer)",
        metadata: {
            name: "Cabinet (Longer)",
            description: "A longer cabinet",
            category: "Furniture"
        }
    },
    "grassfloor": {
        Icon: FlowerIcon,
        texture: "/grassfloor.png",
        type: "tiling",
        name: "grassfloor",
        metadata: {
            name: "Grass Floor",
            description: "A grass floor",
            category: "Floors"
        }
    },
    "snowfloor": {
        Icon: SnowflakeIcon,
        texture: "/snowfloor.png",
        type: "tiling",
        name: "snowfloor",
        metadata: {
            name: "Snow Floor",
            description: "A snow floor",
            category: "Floors"
        }
    },
    "trashcan": {
        Icon: TrashIcon,
        texture: "/trashcan.png",
        type: "sprite",
        name: "trashcan",
        metadata: {
            name: "Trashcan",
            description: "A trashcan",
            category: "Furniture"
        }
    },
    "TV": {
        Icon: TvIcon,
        texture: "/tv.png",
        type: "sprite",
        name: "TV",
        metadata: {
            name: "TV",
            description: "A TV",
            category: "Furniture"
        }
    },
    "speaker": {
        Icon: SpeakerIcon,
        texture: "/speaker.png",
        type: "sprite",
        name: "speaker",
        metadata: {
            name: "Speaker",
            description: "A speaker",
            category: "Furniture"
        }
    }
}

export type BuildingType = keyof typeof buildingTypes;

export type BuildingProps = {
    x: number;
    y: number;
    width: number;
    height: number;
    id: string;
    type: BuildingType;
    locked: boolean;
}

export function Building({ x, y, width, height, id, type, locked }: BuildingProps) {
    const sprite = useRef<Sprite>(null);
    const { isEditing, setSelectedBuilding, setBuildings, buildings, selectedBuilding, viewport } = useContext(MetaSpaceContext);
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
    const resizeHandle = useRef<Sprite>(null);
    useEffect(() => {
        if (!sprite.current) return;
        Assets.load(buildingTypes[type].texture).then((texture: Texture) => {
            if (buildingTypes[type].type === "9slice") {
                texture.source.wrapMode = 'repeat';
            }
            texture.source.scaleMode = 'nearest';
            sprite.current.texture = texture;
        });
    }, [sprite.current]);
    useEffect(() => {
        if (!sprite.current) return;
        const outline = new OutlineFilter({
            thickness: 4,
            color: "#257be3ff",
            alpha: 1,
            quality: 1
        });
        // Set resolution to match device pixel ratio and scale to prevent blurriness
        outline.resolution = window.devicePixelRatio * scale;

        if (selectedBuilding === id) {
            sprite.current.filters = [outline];
        } else {
            sprite.current.filters = [];
        }
    }, [selectedBuilding, sprite.current]);
    useEffect(() => {
        if (!sprite.current) return;
        const onMouseMove = (e: MouseEvent) => {
            if (!isEditing) return;
            let canvasx = e.clientX / scale;
            let canvasy = e.clientY / scale;
            // Convert screen coordinates to world coordinates using viewport
            if (viewport?.current) {
                const worldPoint = viewport.current.toWorld(e.clientX, e.clientY);
                canvasx = worldPoint.x;
                canvasy = worldPoint.y;
            }
            if (dragging) {
                sprite.current.run(Action.moveToX(Math.round((canvasx - mouseOffset.x) / gridsize) * gridsize, 0.075));
                sprite.current.run(Action.moveToY(Math.round((canvasy - mouseOffset.y) / gridsize) * gridsize, 0.075));
                // sprite.current.x = Math.round((e.clientX - mouseOffset.x) / gridsize) * gridsize;
                // sprite.current.y = Math.round((e.clientY - mouseOffset.y) / gridsize) * gridsize;
                if (resizeHandle.current) {
                    resizeHandle.current.x = sprite.current.x + sprite.current.width - 10;
                    resizeHandle.current.y = sprite.current.y + sprite.current.height - 10;
                }
            } else if (resizing && resizeHandle.current) {
                // sprite.current.run(Action.moveToX(Math.round((e.clientX - sprite.current.x) / gridsize) * gridsize, 0.1));
                // sprite.current.run(Action.moveToY(Math.round((e.clientY - sprite.current.y) / gridsize) * gridsize, 0.1));
                sprite.current.width = Math.round((canvasx - sprite.current.x) / gridsize) * gridsize;
                sprite.current.height = Math.round((canvasy - sprite.current.y) / gridsize) * gridsize;
                resizeHandle.current.x = sprite.current.x + sprite.current.width - 10;
                resizeHandle.current.y = sprite.current.y + sprite.current.height - 10;
            }
        };
        const onMouseDown = (e: MouseEvent) => {
            if (!isEditing) return;
            let canvasx = e.clientX / scale;
            let canvasy = e.clientY / scale;
            // Convert screen coordinates to world coordinates using viewport
            if (viewport?.current) {
                const worldPoint = viewport.current.toWorld(e.clientX, e.clientY);
                canvasx = worldPoint.x;
                canvasy = worldPoint.y;
            }
            const overlappingWithOtherBuildings = buildings.filter(building => (
                building.x < x + width &&
                building.x + building.width > x &&
                building.y < y + height &&
                building.y + building.height > y &&
                canvasx > building.x &&
                canvasx < building.x + building.width &&
                canvasy > building.y &&
                canvasy < building.y + building.height
            ));
            console.log(overlappingWithOtherBuildings);
            if (overlappingWithOtherBuildings.length > 0 && overlappingWithOtherBuildings[overlappingWithOtherBuildings.length - 1].id !== id) {
                console.log("Overlapping with other buildings");
                return;
            }
            if ((canvasx > x && canvasx < x + width && canvasy > y && canvasy < y + height) && !(canvasx > x + width - 10 && canvasy > y + height - 10)) {
                if (locked) {
                    setSelectedBuilding(id);
                    return;
                };
                console.log(id);
                setSelectedBuilding(id);
                setDragging(true);
                setMouseOffset({ x: canvasx - sprite.current.x, y: canvasy - sprite.current.y });
            } else if (canvasx > x + width - 10 && canvasy > y + height - 10 && canvasx < x + width && canvasy < y + height) {
                setResizing(true);
                setMouseOffset({ x: canvasx - sprite.current.x + width - 10, y: canvasy - sprite.current.y + height - 10 });
            }
        };
        const onMouseUp = (e: MouseEvent) => {
            if (!sprite.current || !resizeHandle.current) return;
            resizeHandle.current.x = sprite.current.x + sprite.current.width - 10;
            resizeHandle.current.y = sprite.current.y + sprite.current.height - 10;
            setDragging(false);
            setResizing(false);
            setBuildings(buildings.map((building) => {
                if (building.id === id) {
                    return { ...building, x: sprite.current.x, y: sprite.current.y, width: sprite.current.width, height: sprite.current.height };
                }
                return building;
            }));
        };
        document.querySelector('.appcanvas')?.addEventListener('mousemove', onMouseMove);
        document.querySelector('.appcanvas')?.addEventListener('mousedown', onMouseDown);
        document.querySelector('.appcanvas')?.addEventListener('mouseup', onMouseUp);
        return () => {
            document.querySelector('.appcanvas')?.removeEventListener('mousemove', onMouseMove);
            document.querySelector('.appcanvas')?.removeEventListener('mousedown', onMouseDown);
            document.querySelector('.appcanvas')?.removeEventListener('mouseup', onMouseUp);
        };
    }, [sprite.current, x, y, width, height, id, setBuildings, buildings, dragging, resizing, isEditing]);
    return <pixiContainer>
        {buildingTypes[type].type === "9slice" && <pixiNineSliceSprite ref={sprite} topHeight={buildingTypes[type].options.topHeight} bottomHeight={buildingTypes[type].options.bottomHeight} leftWidth={buildingTypes[type].options.leftWidth} rightWidth={buildingTypes[type].options.rightWidth} x={x} y={y} width={width} height={height} />}
        {buildingTypes[type].type === "tiling" && <pixiTilingSprite ref={sprite} x={x} y={y} width={width} height={height} />}
        {buildingTypes[type].type === "sprite" && <pixiSprite ref={sprite} x={x} y={y} width={width} height={height} />}
        {isEditing && <pixiSprite ref={resizeHandle} texture={Texture.WHITE} x={x + width - 10} y={y + height - 10} width={10} height={10} />}
    </pixiContainer>
}