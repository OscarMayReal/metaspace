"use client";
import { Button } from "@/components/ui/button";
import { CameraIcon, CameraOffIcon, EyeClosedIcon, EyeIcon, MicIcon, MicOffIcon, XIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export function ActionBar() {
    const [mic, setMic] = useState(false);
    const [camera, setCamera] = useState(false);
    const [hidden, setHidden] = useState(false);
    return <motion.div initial={{ opacity: 0, bottom: -60 }} animate={{ opacity: 1, bottom: 30 }} transition={{ duration: 0.2 }} className="actionbar">
        <ToggleButton state={mic && !hidden} setState={setMic} Icon={MicOffIcon} ActiveIcon={MicIcon} />
        <ToggleButton state={camera && !hidden} setState={setCamera} Icon={CameraOffIcon} ActiveIcon={CameraIcon} />
        {/* <div className="flex-grow" /> */}
        {/* <ActionButton Icon={XIcon} style={{ backgroundColor: "#eb4034" }} /> */}
        <ToggleButton state={hidden} setState={setHidden} Icon={EyeIcon} ActiveIcon={EyeClosedIcon} />
    </motion.div>
}

export function ActionbarTitle() {
    return <motion.div initial={{ opacity: 0, top: -60 }} animate={{ opacity: 1, top: 30 }} transition={{ duration: 0.2 }} className="actionbar-header">
        <ActionButton Icon={XIcon} style={{ backgroundColor: "#eb4034" }} />
        <div style={{

        }}>
            <div className="actionbar-header-title">Room Name</div>
            <div className="actionbar-header-text"><UserIcon size={12} /> Username</div>
        </div>
    </motion.div>
}

function ToggleButton({ state, setState, Icon, ActiveIcon }: { state: boolean, setState: (state: boolean) => void, Icon: React.JSX.ElementType, ActiveIcon: React.JSX.ElementType }) {
    return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className={"toggle-button" + (state ? " toggle-button-active" : "")} onClick={() => setState(!state)}>
        {state ? <ActiveIcon size={20} /> : <Icon size={20} />}
    </motion.div>
}

function ActionButton({ Icon, style }: { Icon: React.JSX.ElementType, style?: React.CSSProperties }) {
    return <div className="action-button" style={style}>
        <Icon size={20} />
    </div>
}