import { useEffect, useRef, useState } from "react";
import { TaarWebRTC, CallMeta } from "@taarai/webrtc-client";
import axios from "axios";
import "./TaarWebRTCUI.css";

export interface AgentCredentials {
  agentCredentials: string;
}

export const Main = () => {
  const [registeredNumber, setRegisteredNumber] = useState("");
  const [isRegistered, setIsRegistered] = useState<boolean>();
  const [dialNumber, setDialNumber] = useState("");
  const [inCallWith, setInCallWith] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [nonce, setNonce] = useState<string>();
  const [status, setStatus] = useState("Disconnected");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const client = useRef<TaarWebRTC | null>(null);

  useEffect(() => {
    client.current = new TaarWebRTC({
      debug: true,
      onReady: (nonce) => {
        setNonce(nonce);
        setStatus("Ready");
      },
      onCallStarted: (meta: CallMeta) => {
        setInCallWith(meta.id);
      },
      onCallEnded: () => {
        setInCallWith(null);
        setIsMuted(false);
      },
      onError: (err) => {
        console.error(err);
        setStatus("Error");
      },
    });
  }, []);

  const handleRegister = async () => {
    if (!nonce || !registeredNumber) return;
    const res = await axios.post(
      "https://api.taar.ai/agent/ext/register",
      { agentId: registeredNumber, nonce },
      {
        headers: {
          Authorization: "c3f9a8d2e4a74b68917a7b10dfe6b94fba28c5de7c2c4f47a89e3b9c2fd8c5ea",
          "Content-Type": "application/json",
        },
      }
    );
    const creds = res.data as AgentCredentials;
    if (!audioRef.current) throw new Error("Missing audioRef");
    client.current?.register(creds.agentCredentials, audioRef.current);
    setIsRegistered(true);
  };

  const handleCall = () => {
    if (dialNumber) {
      client.current?.makeCall(dialNumber);
    }
  };

  const handleEndCall = () => {
    client.current?.endCall();
  };

  const toggleMute = () => {
    const shouldMute = !isMuted;
    setIsMuted(shouldMute);
    shouldMute ? client.current?.mute() : client.current?.unmute();
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Taar.AI WebRTC Agent</h2>
        <div className="status">● {status}</div>

        <div className="section">
          <label>Agent ID to Register</label>
          <div className="input-row">
            <input
              type="text"
              value={registeredNumber}
              onChange={(e) => setRegisteredNumber(e.target.value)}
              placeholder="agent-90312"
            />
            <button
              onClick={handleRegister}
              disabled={!nonce || isRegistered}
            >
              {isRegistered ? 'Registered' : 'Register Agent'}
            </button>
          </div>
        </div>

        <div className="section">
          <label>Number to Dial</label>
          <div className="input-row">
            <input
              type="text"
              value={dialNumber}
              onChange={(e) => setDialNumber(e.target.value)}
              placeholder="+911234567890"
            />
            <button
              onClick={handleCall}
              disabled={!dialNumber || inCallWith !== null}
            >
              Call
            </button>
          </div>
        </div>

        {inCallWith && (
          <div className="call-panel">
            <div>In call with {inCallWith}</div>
            <div className="button-row">
              <button onClick={handleEndCall}>End Call</button>
              <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>
            </div>
          </div>
        )}

        <audio autoPlay ref={audioRef} className="audio" />

        <div className="footer">
          Powered by <code>@taarai/webrtc-client</code>
        </div>
      </div>
    </div>
  );
}
