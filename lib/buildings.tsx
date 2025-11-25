"use client"
import { MetaSpaceContext } from "@/app/app/page";
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
    TilingSprite
} from 'pixi.js';

const gridsize = 50;

extend({
    Container: Container,
    Graphics: Graphics,
    Sprite: Sprite,
    NineSliceSprite: NineSliceSprite,
    TilingSprite: TilingSprite,
});


export const buildingTypes = {
    "building": {
        texture: "/building.png",
        type: "9slice",
        options: {
            topHeight: 10,
            bottomHeight: 10,
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
    "stonefloor": {
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
        texture: "/woodfloor.png",
        type: "tiling",
        name: "woodfloor",
        metadata: {
            name: "Wood Floor",
            description: "A wooden floor",
            category: "Floors"
        }
    },
    "grassfloor": {
        texture: "/grassfloor.png",
        type: "tiling",
        name: "grassfloor",
        metadata: {
            name: "Grass Floor",
            description: "A grass floor",
            category: "Floors"
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
}

export function Building({ x, y, width, height, id, type }: BuildingProps) {
    const sprite = useRef<Sprite>(null);
    const { isEditing, setSelectedBuilding, setBuildings, buildings } = useContext(MetaSpaceContext);
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState(false);
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
    const resizeHandle = useRef<Sprite>(null);
    useEffect(() => {
        if (!sprite.current) return;
        Assets.load(buildingTypes[type].texture).then((texture) => {
            texture.baseTexture.scaleMode = 'nearest';
            sprite.current.texture = texture;
        });
    }, [sprite.current]);
    useEffect(() => {
        if (!sprite.current) return;
        const onMouseMove = (e: MouseEvent) => {
            if (dragging) {
                sprite.current.run(Action.moveToX(Math.round((e.clientX - mouseOffset.x) / gridsize) * gridsize, 0.075));
                sprite.current.run(Action.moveToY(Math.round((e.clientY - mouseOffset.y) / gridsize) * gridsize, 0.075));
                // sprite.current.x = Math.round((e.clientX - mouseOffset.x) / gridsize) * gridsize;
                // sprite.current.y = Math.round((e.clientY - mouseOffset.y) / gridsize) * gridsize;
                resizeHandle.current.x = sprite.current.x + sprite.current.width - 10;
                resizeHandle.current.y = sprite.current.y + sprite.current.height - 10;
            } else if (resizing) {
                // sprite.current.run(Action.moveToX(Math.round((e.clientX - sprite.current.x) / gridsize) * gridsize, 0.1));
                // sprite.current.run(Action.moveToY(Math.round((e.clientY - sprite.current.y) / gridsize) * gridsize, 0.1));
                sprite.current.width = Math.round((e.clientX - sprite.current.x) / gridsize) * gridsize;
                sprite.current.height = Math.round((e.clientY - sprite.current.y) / gridsize) * gridsize;
                resizeHandle.current.x = sprite.current.x + sprite.current.width - 10;
                resizeHandle.current.y = sprite.current.y + sprite.current.height - 10;
            }
        };
        const onMouseDown = (e: MouseEvent) => {
            if (!isEditing) return;
            if ((e.clientX > x && e.clientX < x + width && e.clientY > y && e.clientY < y + height) && !(e.clientX > x + width - 10 && e.clientY > y + height - 10)) {
                console.log(id);
                setSelectedBuilding(id);
                setDragging(true);
                setMouseOffset({ x: e.clientX - sprite.current.x, y: e.clientY - sprite.current.y });
            } else if (e.clientX > x + width - 10 && e.clientY > y + height - 10 && e.clientX < x + width && e.clientY < y + height) {
                setResizing(true);
                setMouseOffset({ x: e.clientX - sprite.current.x + width - 10, y: e.clientY - sprite.current.y + height - 10 });
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
        {buildingTypes[type].type === "9slice" && <pixiNineSliceSprite ref={sprite} topHeight={buildingTypes[type].options.topHeight} bottomHeight={buildingTypes[type].options.bottomHeight} leftWidth={buildingTypes[type].options.leftWidth} rightWidth={buildingTypes[type].options.rightWidth} x={x} y={y} width={width} height={height} />}
        {buildingTypes[type].type === "tiling" && <pixiTilingSprite ref={sprite} x={x} y={y} width={width} height={height} />}
        {isEditing && <pixiSprite ref={resizeHandle} texture={Texture.WHITE} x={x + width - 10} y={y + height - 10} width={10} height={10} />}
    </pixiContainer>
}