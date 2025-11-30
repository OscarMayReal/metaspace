"use client";
import { Button } from "@/components/ui/button";
import { CameraIcon, CameraOffIcon, EyeClosedIcon, EyeIcon, MicIcon, MicOffIcon, XIcon, UserIcon, PencilLineIcon, PencilIcon, CheckIcon, PlusIcon, MousePointerIcon, MoveIcon, LockIcon } from "lucide-react";
import { useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MetaSpaceContext } from "@/app/space/[id]/app/page";
import { Input } from "./ui/input";
import Link from "next/link";
import { buildingTypes } from "@/lib/buildings";
import { Field, FieldContent, FieldLabel } from "./ui/field";
import { Checkbox } from "./ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useTrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useParams } from "next/navigation";

export function ActionbarHolder() {
    const { isEditing, setIsEditing } = useContext(MetaSpaceContext);
    return <div className="actionbar-holder" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence>
            {isEditing && <EditBar key="editbar" />}
            <div className="flex flex-row gap-[10px] items-center">
                <AnimatePresence>
                    <ActionBar key="actionbar" />
                    {isEditing && <EditActionbar key="editactionbar" />}
                </AnimatePresence>
            </div>
        </AnimatePresence>
    </div>
}

export function InspectorHolder() {
    return <div className="actionbar-holder" onClick={(e) => e.stopPropagation()} style={{
        left: "unset",
        right: 30,
        alignItems: "stretch",
    }}>
        <AnimatePresence>
            <InspectorBar key="inspectorbar" />
            <InspectorOverview key="inspectoroverview" />
            <InspectorSizes key="inspectorsizes" />
            <InspectorPosition key="inspectorposition" />
        </AnimatePresence>
    </div>
}

export function InspectorBar() {
    const { selectedBuilding, buildings, setBuildings } = useContext(MetaSpaceContext);
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="actionbar" onClick={(e) => e.stopPropagation()}>
        <ActionButton onClick={() => setBuildings(buildings.filter((building) => building.id !== selectedBuilding))} Icon={XIcon} style={{ backgroundColor: "#eb4034" }} />
        <div style={{

        }}>
            <div className="actionbar-header-title">Selected Building</div>
            <div className="actionbar-header-text">id: {selectedBuilding}</div>
        </div>
    </motion.div>
}

export function InspectorSizes() {
    const { selectedBuilding, buildings, setBuildings } = useContext(MetaSpaceContext);
    const building = buildings.find(b => b.id === selectedBuilding);
    if (!building) return null;
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="floating-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-row gap-[10px] items-center">
            <div className="text-3xl">Sizing</div>

        </div>
        <Input type="number" value={building.width / 50} onChange={(e) => setBuildings(buildings.map((b) => b.id === selectedBuilding ? { ...b, width: parseFloat(e.target.value) * 50 } : b))} placeholder="Width" />
        <Input type="number" value={building.height / 50} onChange={(e) => setBuildings(buildings.map((b) => b.id === selectedBuilding ? { ...b, height: parseFloat(e.target.value) * 50 } : b))} placeholder="Height" />
    </motion.div>
}

export function InspectorPosition() {
    const { selectedBuilding, buildings, setBuildings } = useContext(MetaSpaceContext);
    const building = buildings.find(b => b.id === selectedBuilding);
    if (!building) return null;
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="floating-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-row gap-[10px] items-center">
            <div className="text-3xl">Position</div>

        </div>
        <Input type="number" value={building.x / 50} onChange={(e) => setBuildings(buildings.map((b) => b.id === selectedBuilding ? { ...b, x: parseFloat(e.target.value) * 50 } : b))} placeholder="X" />
        <Input type="number" value={building.y / 50} onChange={(e) => setBuildings(buildings.map((b) => b.id === selectedBuilding ? { ...b, y: parseFloat(e.target.value) * 50 } : b))} placeholder="Y" />
    </motion.div>
}

export function InspectorOverview() {
    const { selectedBuilding, buildings, setBuildings } = useContext(MetaSpaceContext);
    const building = buildings.find(b => b.id === selectedBuilding);
    if (!building) return null;
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="floating-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-row gap-[10px] items-center">
            <div className="text-3xl">Overview</div>
        </div>
        <div>
            <div>{buildingTypes[building.type].metadata.name}</div>
            <div>{buildingTypes[building.type].metadata.description}</div>
        </div>
        <Field className="flex flex-row gap-[10px] items-center">
            <FieldLabel><LockIcon size={20} /> Locked</FieldLabel>
            <FieldContent>
                <Checkbox checked={building.locked} onCheckedChange={(checked) => setBuildings(buildings.map((b) => b.id === selectedBuilding ? { ...b, locked: checked } : b))} />
            </FieldContent>
        </Field>
    </motion.div>
}

export function EditActionbar() {
    const { buildings, setBuildings, playerRef } = useContext(MetaSpaceContext);
    const [tool, setTool] = useState("cursor");
    return <motion.div initial={{ opacity: 0, width: 0, paddingLeft: 0, paddingRight: 0 }} animate={{ opacity: 1, width: "auto", paddingLeft: 10, paddingRight: 10 }} exit={{ opacity: 0, width: 0, paddingLeft: 0, paddingRight: 0 }} transition={{ duration: 0.2 }} className="actionbar">
        <DropdownMenu>
            <DropdownMenuTrigger>
                <ActionButton style={{ backgroundColor: "hsla(213, 77%, 52%, 1.00)" }} Icon={PlusIcon} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {Object.entries(buildingTypes).map(([key, value]) => <DropdownMenuItem key={key} onClick={() => {
                    setBuildings([...buildings, {
                        x: Math.round((playerRef.current?.position.x || 0) / 50) * 50,
                        y: Math.round((playerRef.current?.position.y || 0) / 50) * 50,
                        type: key,
                        width: 100,
                        height: 100,
                        locked: false,
                        id: crypto.randomUUID()
                    }])
                }}><value.Icon size={20} /> {value.metadata?.name}</DropdownMenuItem>)}
            </DropdownMenuContent>
        </DropdownMenu>
        <ToggleButton state={tool === "cursor"} onClick={() => setTool("cursor")} Icon={MousePointerIcon} ActiveIcon={MousePointerIcon} />
        <ToggleButton state={tool === "move"} onClick={() => setTool("move")} Icon={MoveIcon} ActiveIcon={MoveIcon} />
    </motion.div>
}

export function ActionBar() {
    var { toggle: toggleCam, enabled: camEnabled } = useTrackToggle({ source: Track.Source.Camera });
    var { toggle: toggleMic, enabled: micEnabled } = useTrackToggle({ source: Track.Source.Microphone });
    const { isEditing, setIsEditing, buildingLockedTo, auth } = useContext(MetaSpaceContext);
    // const [mic, setMic] = useState(false);
    // const [camera, setCamera] = useState(false);
    const [hidden, setHidden] = useState(false);
    return <motion.div layout initial={{ opacity: 0, bottom: -60 }} animate={{ opacity: 1, bottom: 30 }} exit={{ opacity: 0, bottom: -60 }} transition={{ duration: 0.2 }} className="actionbar">
        <AnimatePresence>
            {!isEditing && <ToggleButton key="micToggle" state={micEnabled && !hidden} setState={toggleMic} Icon={MicOffIcon} ActiveIcon={MicIcon} />}
            {!isEditing && <ToggleButton key="cameraToggle" state={camEnabled && !hidden} setState={toggleCam} Icon={CameraOffIcon} ActiveIcon={CameraIcon} />}
            {/* {!isEditing && <ToggleButton key="hiddenToggle" state={hidden} setState={setHidden} Icon={EyeIcon} ActiveIcon={EyeClosedIcon} />} */}
            {(buildingLockedTo === null || buildingLockedTo === auth.data?.user?.id) && <ToggleButton key="editToggle" state={isEditing} setState={setIsEditing} Icon={PencilIcon} ActiveIcon={CheckIcon} />}
        </AnimatePresence>
    </motion.div>
}

export function EditBar() {
    const { buildings } = useContext(MetaSpaceContext);
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="actionbar" style={{
        paddingRight: 30,

    }}>
        <ActionButton onClick={() => {
            const file = new File([JSON.stringify(buildings)], "buildings.json", { type: "application/json" });
            const url = URL.createObjectURL(file);
            const a = document.createElement("a");
            a.href = url;
            a.download = "buildings.json";
            a.click();
            URL.revokeObjectURL(url);
        }} Icon={PencilIcon} style={{ backgroundColor: "#eb403400" }} />
        <div style={{

        }}>
            <div className="actionbar-header-title">Edit Mode</div>
            <div className="actionbar-header-text">You are editing this room</div>
        </div>
    </motion.div>
}

export function ActionbarTitle() {
    const { auth } = useContext(MetaSpaceContext);
    const params = useParams();
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="actionbar-header">
        <Link href="/home"><ActionButton Icon={XIcon} style={{ backgroundColor: "#eb4034" }} /></Link>
        <div style={{

        }}>
            <div className="actionbar-header-title">{params.id}</div>
            <div className="actionbar-header-text"><UserIcon size={12} /> {auth?.data?.user?.name}</div>
        </div>
    </motion.div>
}

function ToggleButton({ state, setState, Icon, ActiveIcon, onClick }: { state: boolean, setState?: (state: boolean) => void, Icon: React.JSX.ElementType, ActiveIcon: React.JSX.ElementType, onClick?: () => void }) {
    return <motion.div className={"toggle-button" + (state ? " toggle-button-active" : "")} onClick={onClick ? onClick : () => setState?.(!state)}>
        {state ? <ActiveIcon size={20} /> : <Icon size={20} />}
    </motion.div>
}

function ActionButton({ Icon, style, onClick }: { Icon: React.JSX.ElementType, style?: React.CSSProperties, onClick?: () => void }) {
    return <div className="action-button" style={style} onClick={onClick}>
        <Icon size={20} />
    </div>
}