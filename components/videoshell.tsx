"use client"
import { BarVisualizer, CarouselLayout, ParticipantTile, useTrackRefContext, VideoTrack } from '@livekit/components-react';
import '@livekit/components-styles';
import { useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { MicIcon, MicOffIcon, UserIcon, VideoOffIcon } from 'lucide-react';

export function CommsViewPanel() {
    const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
    return <div className="floating-panel" style={{
        position: "absolute",
        top: "30px",
        right: "30px",
        width: "250px",
        overflow: "hidden",
        zIndex: 1000,
        borderRadius: "15px",
        padding: "10px",
    }}>
        <CarouselLayout data-lk-theme="default" orientation="vertical" tracks={tracks}>
            <ParticipantItem />
        </CarouselLayout>
    </div>
}

function ParticipantItem() {
    const trackRef = useTrackRefContext();
    return <div className="participant-item">
        {(!trackRef?.publication?.isMuted && trackRef?.publication?.videoTrack) ? <VideoTrack trackRef={trackRef} /> : <div className="h-full w-full flex items-center justify-center">
            <VideoOffIcon size={50} opacity={0.5} />
        </div>}
        <div className="participant-name">
            {trackRef?.participant.isMicrophoneEnabled ? <MicIcon size={14} /> : <MicOffIcon size={14} />}
            {JSON.parse(trackRef?.participant?.metadata ?? "{}").name}
        </div>
    </div>
}