import React, { useCallback, useEffect, useContext, useRef } from "react";
import { extend } from "@pixi/react";
import { MetaSpaceContext } from "@/app/app/page";
import * as PIXI from "pixi.js";
import { Action } from "pixijs-actions";

extend({ Graphics: PIXI.Graphics });

interface GridProps {
  width: number;
  height: number;
  color?: PIXI.ColorSource;
  lineThickness?: number;
  pitch?: { x: number; y: number };
}

export const Grid = ({ width, height, color, lineThickness, pitch }: GridProps) => {
  const gref = useRef<PIXI.Graphics>(null);
  const { isEditing } = useContext(MetaSpaceContext);

  useEffect(() => {
    if (!gref.current) return;
    if (isEditing == true) {
      gref.current.alpha = 1;
    } else {
      gref.current.alpha = 0;
    }
  }, [isEditing, gref.current]);

  const draw = useCallback((g) => {
    g.clear();
    g.lineStyle(lineThickness, color!);
    for (let x = 0; x < width; x += pitch!.x) {
      g.moveTo(x, 0);
      g.lineTo(x, height);
    }
    for (let y = 0; y < height; y += pitch!.y) {
      g.moveTo(0, y);
      g.lineTo(width, y);
    }
    g.endFill();
  }, []);

  return <pixiGraphics ref={gref} draw={draw} />;
};

Grid.defaultProps = {
  color: [1.0, 1.0, 1.0],
  lineThickness: 1,
  pitch: { x: 50, y: 50 }
};
