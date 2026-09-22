import { useEffect, useRef, useState } from "react";
import { human } from "./humanConfig";

function FaceTest() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("Starting camera...");

  useEffect(() => {
    let stream;
    let animationId;

    const start = async () => {
      try {
        setStatus("Loading face model...");

        await human.load();
        await human.warmup();

        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        setStatus("Camera ready — looking for a face...");

        const detect = async () => {
          if (videoRef.current) {
            const result = await human.detect(videoRef.current);

            if (result.face && result.face.length > 0) {
              setStatus(`Face detected ✅ (${result.face.length})`);
            } else {
              setStatus("Camera ready — looking for a face...");
            }
          }

          animationId = requestAnimationFrame(detect);
        };

        detect();
      } catch (error) {
        console.error(error);
        setStatus("Error: " + error.message);
      }
    };

    start();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h2>CampusGuard Face Test</h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "500px",
          maxWidth: "100%",
          borderRadius: "12px",
        }}
      />

      <p>{status}</p>
    </div>
  );
}

export default FaceTest;