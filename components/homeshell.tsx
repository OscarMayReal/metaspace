"use client"
import { useAuth } from "keystone-lib";

export default function Header() {
    const auth = useAuth({ keystoneUrl: process.env.NEXT_PUBLIC_KEYSTONE_URL!, appId: process.env.NEXT_PUBLIC_APPID! });
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