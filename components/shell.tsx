"use client";
import { Button } from "@/components/ui/button";
import { CameraIcon, CameraOffIcon, EyeClosedIcon, EyeIcon, MicIcon, MicOffIcon, XIcon, UserIcon, PencilLineIcon, PencilIcon, CheckIcon, PlusIcon, MousePointerIcon, MoveIcon } from "lucide-react";
import { useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MetaSpaceContext } from "../app/app/page";
import { Input } from "./ui/input";
import Link from "next/link";

export function ActionbarHolder() {
    const { isEditing, setIsEditing } = useContext(MetaSpaceContext);
    return <div className="actionbar-holder">
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
    return <div className="actionbar-holder" style={{
        left: "unset",
        right: 30,
        alignItems: "flex-end",
    }}>
        <AnimatePresence>
            <InspectorBar key="inspectorbar" />
            <InspectorSizes key="inspectorsizes" />
            <InspectorPosition key="inspectorposition" />
        </AnimatePresence>
    </div>
}

export function InspectorBar() {
    const { selectedBuilding, buildings, setBuildings } = useContext(MetaSpaceContext);
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="actionbar">
        <ActionButton Icon={XIcon} style={{ backgroundColor: "#eb4034" }} />
        <div style={{

        }}>
            <div className="actionbar-header-title">Selected Building</div>
            <div className="actionbar-header-text">id: {selectedBuilding}</div>
        </div>
    </motion.div>
}

export function InspectorSizes() {
    const { selectedBuilding, buildings, setBuildings } = useContext(MetaSpaceContext);
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="floating-panel">
        <div className="flex flex-row gap-[10px] items-center">
            <div className="text-3xl">Sizing</div>

        </div>
        <Input type="number" value={buildings[selectedBuilding].width / 50} onChange={(e) => setBuildings(buildings.map((building) => building.id === selectedBuilding ? { ...building, width: parseFloat(e.target.value) * 50 } : building))} placeholder="Width" />
        <Input type="number" value={buildings[selectedBuilding].height / 50} onChange={(e) => setBuildings(buildings.map((building) => building.id === selectedBuilding ? { ...building, height: parseFloat(e.target.value) * 50 } : building))} placeholder="Height" />
    </motion.div>
}

export function InspectorPosition() {
    const { selectedBuilding, buildings, setBuildings } = useContext(MetaSpaceContext);
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="floating-panel">
        <div className="flex flex-row gap-[10px] items-center">
            <div className="text-3xl">Position</div>

        </div>
        <Input type="number" value={buildings[selectedBuilding].x / 50} onChange={(e) => setBuildings(buildings.map((building) => building.id === selectedBuilding ? { ...building, x: parseFloat(e.target.value) * 50 } : building))} placeholder="X" />
        <Input type="number" value={buildings[selectedBuilding].y / 50} onChange={(e) => setBuildings(buildings.map((building) => building.id === selectedBuilding ? { ...building, y: parseFloat(e.target.value) * 50 } : building))} placeholder="Y" />
    </motion.div>
}

export function EditActionbar() {
    const [tool, setTool] = useState("cursor");
    return <motion.div initial={{ opacity: 0, width: 0, paddingLeft: 0, paddingRight: 0 }} animate={{ opacity: 1, width: "auto", paddingLeft: 10, paddingRight: 10 }} exit={{ opacity: 0, width: 0, paddingLeft: 0, paddingRight: 0 }} transition={{ duration: 0.2 }} className="actionbar">
        <ActionButton style={{ backgroundColor: "rgba(37, 123, 227, 1)" }} Icon={PlusIcon} />
        <ToggleButton state={tool === "cursor"} onClick={() => setTool("cursor")} Icon={MousePointerIcon} ActiveIcon={MousePointerIcon} />
        <ToggleButton state={tool === "move"} onClick={() => setTool("move")} Icon={MoveIcon} ActiveIcon={MoveIcon} />
    </motion.div>
}

export function ActionBar() {
    const { isEditing, setIsEditing } = useContext(MetaSpaceContext);
    const [mic, setMic] = useState(false);
    const [camera, setCamera] = useState(false);
    const [hidden, setHidden] = useState(false);
    return <motion.div layout initial={{ opacity: 0, bottom: -60 }} animate={{ opacity: 1, bottom: 30 }} exit={{ opacity: 0, bottom: -60 }} transition={{ duration: 0.2 }} className="actionbar">
        <AnimatePresence mode="wait">
            {!isEditing && <ToggleButton key="micToggle" state={mic && !hidden} setState={setMic} Icon={MicOffIcon} ActiveIcon={MicIcon} />}
            {!isEditing && <ToggleButton key="cameraToggle" state={camera && !hidden} setState={setCamera} Icon={CameraOffIcon} ActiveIcon={CameraIcon} />}
            {!isEditing && <ToggleButton key="hiddenToggle" state={hidden} setState={setHidden} Icon={EyeIcon} ActiveIcon={EyeClosedIcon} />}
            <ToggleButton key="editToggle" state={isEditing} setState={setIsEditing} Icon={PencilIcon} ActiveIcon={CheckIcon} />
        </AnimatePresence>
    </motion.div>
}

export function EditBar() {
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="actionbar" style={{
        paddingRight: 30,

    }}>
        <ActionButton Icon={PencilIcon} style={{ backgroundColor: "#eb403400" }} />
        <div style={{

        }}>
            <div className="actionbar-header-title">Edit Mode</div>
            <div className="actionbar-header-text">You are editing this room</div>
        </div>
    </motion.div>
}

export function ActionbarTitle() {
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="actionbar-header">
        <Link href="/home"><ActionButton Icon={XIcon} style={{ backgroundColor: "#eb4034" }} /></Link>
        <div style={{

        }}>
            <div className="actionbar-header-title">Room Name</div>
            <div className="actionbar-header-text"><UserIcon size={12} /> Username</div>
        </div>
    </motion.div>
}

function ToggleButton({ state, setState, Icon, ActiveIcon, onClick }: { state: boolean, setState?: (state: boolean) => void, Icon: React.JSX.ElementType, ActiveIcon: React.JSX.ElementType, onClick?: () => void }) {
    return <motion.div className={"toggle-button" + (state ? " toggle-button-active" : "")} onClick={onClick ? onClick : () => setState?.(!state)}>
        {state ? <ActiveIcon size={20} /> : <Icon size={20} />}
    </motion.div>
}

function ActionButton({ Icon, style }: { Icon: React.JSX.ElementType, style?: React.CSSProperties }) {
    return <div className="action-button" style={style}>
        <Icon size={20} />
    </div>
}