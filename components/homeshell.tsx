"use client"
import { useAuth } from "keystone-lib";

export default function Header({ auth }: { auth: any }) {
    return <header>
        <img src="/MetaSpace.svg" className="header-logo" alt="" />
        <div className="header-title">
            <span className="quntem-text">Quntem</span><span className="metaspace-text"> MetaSpace</span>
        </div>
        <div style={{ flex: 1 }} />
        <div className="header-user">
            {auth?.data?.user ? <div className="header-user">{auth.data.user.name}</div> : <div className="header-user">Not logged in</div>}
        </div>
    </header>
}