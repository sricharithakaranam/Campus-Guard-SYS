import { useEffect, useRef, useState } from "react";
import Human from "@vladmandic/human";
import "./App.css";
import campusImage from "./assets/campus.jpg";
import collegeLogo from "./assets/gist-logo.jpg";
import campusVideo from "./assets/campus-video.mp4";

/* =========================================================
   REGISTERED PEOPLE
========================================================= */

const teamMembers = [
  {
    name: "Shaik Rahmate Nazia",
    rollNo: "232U1A3249",
    department: "CSE (Data Science)",
    photo: "/team/nazia.png",
  },
  {
    name: "Vanapalli Lahari",
    rollNo: "232U1A3262",
    department: "CSE (Data Science)",
    photo: "/team/lahari.png",
  },
  {
    name: "Karanam Sri Charitha",
    rollNo: "232U1A3221",
    department: "CSE (Data Science)",
    photo: "/team/charitha.png",
  },
  {
    name: "Pendem Kranthi",
    rollNo: "232U1A3237",
    department: "CSE (Data Science)",
    photo: "/team/kranthi.png",
  },
  {
    name: "Mamata",
    rollNo: "232U1A3240",
    department: "CSE (Data Science)",
    photo: "/team/mamata.png",
  },
];

/* =========================================================
   HUMAN AI CONFIGURATION
========================================================= */

const humanConfig = {
  backend: "webgl",

  modelBasePath:
    "https://cdn.jsdelivr.net/gh/vladmandic/human-models/models/",

  filter: {
    enabled: true,
    equalization: true,
    flip: false,
  },

  face: {
    enabled: true,

    detector: {
      enabled: true,
      rotation: true,
      maxDetected: 1,
      minConfidence: 0.5,
    },

    mesh: {
      enabled: true,
    },

    description: {
      enabled: true,
      minConfidence: 0.5,
    },

    iris: {
      enabled: false,
    },

    emotion: {
      enabled: false,
    },

    antispoof: {
      enabled: false,
    },

    liveness: {
      enabled: false,
    },
  },

  body: {
    enabled: false,
  },

  hand: {
    enabled: false,
  },

  object: {
    enabled: false,
  },

  segmentation: {
    enabled: false,
  },
};

/* =========================================================
   SETTINGS
========================================================= */

const MATCH_THRESHOLD = 0.50;
const UNKNOWN_LOG_KEY = "campusguard_unknown_access";
const ACTIVITY_LOG_KEY = "campusguard_activity_log";

/* =========================================================
   COSINE SIMILARITY
========================================================= */

function cosineSimilarity(a, b) {
  if (!a || !b) {
    return -1;
  }

  if (a.length !== b.length) {
    return -1;
  }

  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return -1;
  }

  return (
    dot /
    (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  );
}

/* =========================================================
   DATE / TIME HELPERS
========================================================= */

function getDateTime() {
  const now = new Date();

  return {
    date: now.toLocaleDateString("en-IN"),
    time: now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    timestamp: now.getTime(),
  };
}

/* =========================================================
   LOAD LOCAL STORAGE
========================================================= */

function loadUnknownLogs() {
  try {
    const data = localStorage.getItem(UNKNOWN_LOG_KEY);

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Could not load unknown logs:", error);
    return [];
  }
}

function loadActivityLogs() {
  try {
    const data = localStorage.getItem(ACTIVITY_LOG_KEY);

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Could not load activity logs:", error);
    return [];
  }
}

/* =========================================================
   SAVE UNKNOWN ACCESS
========================================================= */

function saveUnknownAccess(similarity) {
  const dateTime = getDateTime();

  const unknownRecord = {
    id: `unknown-${Date.now()}`,
    type: "UNKNOWN",
    status: "UNAUTHORIZED",
    date: dateTime.date,
    time: dateTime.time,
    timestamp: dateTime.timestamp,
    camera: "Main Gate - Camera 01",
    similarity:
      typeof similarity === "number"
        ? Number(similarity.toFixed(3))
        : null,
  };

  const previous = loadUnknownLogs();

  const updated = [unknownRecord, ...previous].slice(0, 100);

  localStorage.setItem(
    UNKNOWN_LOG_KEY,
    JSON.stringify(updated)
  );

  return unknownRecord;
}

/* =========================================================
   SAVE ACTIVITY
========================================================= */

function saveActivity(activity) {
  const previous = loadActivityLogs();

  const updated = [activity, ...previous].slice(0, 100);

  localStorage.setItem(
    ACTIVITY_LOG_KEY,
    JSON.stringify(updated)
  );

  return updated;
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  registeredCount,
  activityLogs,
  unknownLogs,
}) {
  const today = new Date().toLocaleDateString("en-IN");

  const todayEntries = activityLogs.filter(
    (item) =>
      item.date === today &&
      item.status === "AUTHORIZED"
  ).length;

  const todayUnknown = unknownLogs.filter(
    (item) => item.date === today
  ).length;

  return (
    <section className="dashboard-page">

      <div className="page-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            Campus security overview and activity summary
          </p>
        </div>

        <div className="dashboard-status">
          <span></span>
          System Online
        </div>
      </div>

      <div className="dashboard-cards">

        <div className="dashboard-card">
          <div className="card-icon">👥</div>

          <div>
            <span>Total Registered</span>
            <strong>{registeredCount}</strong>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🚪</div>

          <div>
            <span>Today's Entries</span>
            <strong>{todayEntries}</strong>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">⚠️</div>

          <div>
            <span>Security Alerts</span>
            <strong>{todayUnknown}</strong>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">👤</div>

          <div>
            <span>Unknown Attempts</span>
            <strong>{unknownLogs.length}</strong>
          </div>
        </div>

      </div>

      <div className="dashboard-grid">

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>Recent Activity</h2>

              <p>
                Latest campus security events
              </p>
            </div>

            <span className="live-badge">
              ● LIVE
            </span>

          </div>

          {activityLogs.length === 0 ? (

            <div className="empty-activity">

              <div>📋</div>

              <h3>No activity yet</h3>

              <p>
                Recognized entries and security events
                will appear here.
              </p>

            </div>

          ) : (

            <div className="activity-list">

              {activityLogs
                .slice(0, 8)
                .map((activity) => (

                  <div
                    className={`activity-row ${
                      activity.status ===
                      "UNAUTHORIZED"
                        ? "activity-unknown"
                        : "activity-authorized"
                    }`}
                    key={activity.id}
                  >

                    <div className="activity-icon">

                      {activity.status ===
                      "UNAUTHORIZED"
                        ? "⚠️"
                        : "✓"}

                    </div>

                    <div className="activity-info">

                      <strong>
                        {activity.name}
                      </strong>

                      <span>
                        {activity.status ===
                        "UNAUTHORIZED"
                          ? "Unauthorized access attempt"
                          : "Authorized entry"}
                      </span>

                    </div>

                    <div className="activity-time">

                      <strong>
                        {activity.time}
                      </strong>

                      <small>
                        {activity.date}
                      </small>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </div>

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>
              <h2>System Status</h2>

              <p>
                Current security system status
              </p>
            </div>

          </div>

          <div className="system-status-row">
            <span>AI Face Recognition</span>
            <strong>● ACTIVE</strong>
          </div>

          <div className="system-status-row">
            <span>Camera System</span>
            <strong>● READY</strong>
          </div>

          <div className="system-status-row">
            <span>Face Database</span>
            <strong>
              ● {registeredCount} LOADED
            </strong>
          </div>

          <div className="system-status-row">
            <span>Security Monitoring</span>
            <strong>● ACTIVE</strong>
          </div>

          <div className="security-summary">

            <div>
              <span>Unknown attempts</span>

              <strong>
                {unknownLogs.length}
              </strong>
            </div>

            <div>
              <span>Today's alerts</span>

              <strong>
                {todayUnknown}
              </strong>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

/* =========================================================
   REGISTERED PEOPLE PAGE
========================================================= */

function RegisteredPeople({
  registeredCount,
}) {
  return (
    <section className="content-page">

      <div className="page-header">

        <div>
          <h1>Registered People</h1>

          <p>
            Authorized people registered in CampusGuard
          </p>
        </div>

        <div className="count-badge">
          {registeredCount} Registered
        </div>

      </div>

      <div className="registered-grid">

        {teamMembers.map((member) => (

          <div
            className="registered-card"
            key={member.rollNo}
          >

            <img
              src={member.photo}
              alt={member.name}
            />

            <div className="registered-info">

              <span className="authorized-label">
                ✓ AUTHORIZED
              </span>

              <h2>{member.name}</h2>

              <p>{member.department}</p>

              <span>
                Roll No: {member.rollNo}
              </span>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}

/* =========================================================
   SECURITY ALERTS PAGE
========================================================= */

function SecurityAlerts({
  unknownLogs,
  clearUnknownLogs,
}) {
  return (
    <section className="content-page">

      <div className="page-header">

        <div>
          <h1>Security Alerts</h1>

          <p>
            Unauthorized and unknown access attempts
          </p>
        </div>

        {unknownLogs.length > 0 && (

          <button
            className="clear-alerts-button"
            onClick={clearUnknownLogs}
          >
            Clear Alerts
          </button>

        )}

      </div>

      {unknownLogs.length === 0 ? (

        <div className="no-alerts">

          <div className="no-alert-icon">
            ✓
          </div>

          <h2>No Security Alerts</h2>

          <p>
            No unauthorized access attempts have
            been recorded.
          </p>

        </div>

      ) : (

        <div className="alerts-list">

          {unknownLogs.map((alert) => (

            <div
              className="alert-card"
              key={alert.id}
            >

              <div className="alert-icon">
                ⚠️
              </div>

              <div className="alert-main">

                <div className="alert-title-row">

                  <h2>
                    Unknown Person
                  </h2>

                  <span>
                    UNAUTHORIZED
                  </span>

                </div>

                <p>
                  Unregistered face detected
                  at the main entrance.
                </p>

                <div className="alert-meta">

                  <span>
                    📅 {alert.date}
                  </span>

                  <span>
                    🕒 {alert.time}
                  </span>

                  <span>
                    📹 {alert.camera}
                  </span>

                  {alert.similarity !== null && (

                    <span>
                      Match score:{" "}
                      {alert.similarity}
                    </span>

                  )}

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </section>
  );
}

/* =========================================================
   HOME
========================================================= */

function Home({ setActivePage }) {
  return (
    <div className="home-page">

      <header className="home-header">

        <div className="home-brand">
          <img src={collegeLogo} alt="GIST Logo" />

          <div>
            <h2>CampusGuard</h2>
            <span>AI SMART SECURITY</span>
          </div>
        </div>

        <nav className="home-nav">

          <button
            className="home-nav-active"
            onClick={() => setActivePage("home")}
          >
            Home
          </button>

          <button
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActivePage("live")}
          >
            Live Monitoring
          </button>

          <button
            onClick={() => setActivePage("registered")}
          >
            Registered People
          </button>

          <button
            onClick={() => setActivePage("alerts")}
          >
            Security Alerts
          </button>

        </nav>

        <div className="home-status">
          <span></span>
          System Online
        </div>

      </header>

      <section className="home-hero">

        <div className="home-left">

          <div className="project-tag">
            <span></span>
            FINAL YEAR PROJECT
          </div>

          <h1>
            CAMPUS
            <br />
            <em>GUARD</em>
          </h1>

          <div className="title-line"></div>

          <h3>
            Face Recognition Based Attendance
            <br />
            and Security System
          </h3>

          <p className="home-description">
            An intelligent campus security platform combining
            AI-powered face recognition, automated attendance,
            and real-time monitoring to create a safer campus.
          </p>

          <div className="home-features">

            <div>
              <strong>01</strong>
              <span>SECURE CAMPUS</span>
            </div>

            <div>
              <strong>02</strong>
              <span>SMART ATTENDANCE</span>
            </div>

            <div>
              <strong>03</strong>
              <span>REAL-TIME MONITORING</span>
            </div>

          </div>

          <button
            className="enter-dashboard"
            onClick={() => setActivePage("dashboard")}
          >
            Enter CampusGuard
            <span>→</span>
          </button>

        </div>

        <div className="home-right">

          <div className="campus-image-wrapper">

            <video
              className="campus-video"
              src={campusVideo}
              autoPlay
              muted
              loop
              playsInline
            />

            <div className="campus-caption">

              <div className="live-campus">
                <span></span>
                CAMPUS
              </div>

              <strong>
                GEETHANJALI INSTITUTE
              </strong>

              <small>
                OF SCIENCE & TECHNOLOGY
              </small>

            </div>

          </div>

        </div>

      </section>

      <section className="home-bottom">

        <div>
          <span>AI</span>
          <h3>Face Recognition</h3>
          <p>
            Intelligent identification of registered people.
          </p>
        </div>

        <div>
          <span>ATT</span>
          <h3>Smart Attendance</h3>
          <p>
            Automated attendance through facial recognition.
          </p>
        </div>

        <div>
          <span>SEC</span>
          <h3>Security Monitoring</h3>
          <p>
            Detect and record unauthorized access attempts.
          </p>
        </div>

      </section>

      <footer className="home-footer">

        <div>
          GEETHANJALI INSTITUTE OF SCIENCE & TECHNOLOGY
        </div>

        <span>
          CAMPUSGUARD • 2025 — 2026
        </span>

      </footer>

    </div>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {

  const [activePage, setActivePage] =
    useState("home");

  const [cameraActive, setCameraActive] =
    useState(false);

  const [faceDetected, setFaceDetected] =
    useState(false);

  const [isScanning, setIsScanning] =
    useState(false);

  const [isRecognized, setIsRecognized] =
    useState(false);

  const [entryRecorded, setEntryRecorded] =
    useState(false);

  const [currentMember, setCurrentMember] =
    useState(null);

  const [cameraError, setCameraError] =
    useState("");

  const [recognitionMessage, setRecognitionMessage] =
    useState("AI system starting...");

  const [registeredCount, setRegisteredCount] =
    useState(0);

  const [similarityScore, setSimilarityScore] =
    useState(null);

  const [aiReady, setAiReady] =
    useState(false);

  const [unknownLogs, setUnknownLogs] =
    useState([]);

  const [activityLogs, setActivityLogs] =
    useState([]);

  /* =======================================================
     REFS
  ======================================================= */

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const humanRef = useRef(null);
  const animationRef = useRef(null);
  const referenceFacesRef = useRef([]);
  const detectingRef = useRef(false);

  /* =======================================================
     LOAD SAVED LOGS
  ======================================================= */

  useEffect(() => {

    setUnknownLogs(
      loadUnknownLogs()
    );

    setActivityLogs(
      loadActivityLogs()
    );

  }, []);

  /* =======================================================
     LOAD HUMAN AI
  ======================================================= */

  useEffect(() => {

    const initializeHuman = async () => {

      try {

        console.log("Starting Human AI...");

        setRecognitionMessage(
          "Loading AI models..."
        );

        const human =
          new Human(humanConfig);

        humanRef.current = human;

        await human.load();

        await human.warmup();

        console.log("Human AI ready");

        setAiReady(true);

        setRecognitionMessage(
          "Loading registered candidates..."
        );

        await loadReferenceFaces(human);

      } catch (error) {

        console.error(
          "Human AI initialization error:",
          error
        );

        setCameraError(
          "AI face recognition model could not be loaded."
        );

        setRecognitionMessage(
          "AI initialization failed"
        );

      }

    };

    initializeHuman();

    return () => {

      if (animationRef.current) {

        cancelAnimationFrame(
          animationRef.current
        );

      }

      if (streamRef.current) {

        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

      }

    };

  }, []);

  /* =======================================================
     LOAD REGISTERED FACE DATABASE
  ======================================================= */

  const loadReferenceFaces = async (human) => {

    const references = [];

    for (const member of teamMembers) {

      try {

        console.log(
          `Loading: ${member.name}`
        );

        const image =
          new Image();

        image.src =
          member.photo;

        await new Promise(
          (resolve, reject) => {

            image.onload =
              resolve;

            image.onerror =
              () =>
                reject(
                  new Error(
                    `Could not load ${member.photo}`
                  )
                );

          }
        );

        const result =
          await human.detect(image);

        if (
          !result.face ||
          result.face.length === 0
        ) {

          console.warn(
            `NO FACE: ${member.name}`
          );

          continue;
        }

        const face =
          result.face[0];

        if (!face.embedding) {

          console.warn(
            `NO EMBEDDING: ${member.name}`
          );

          continue;
        }

        references.push({
          member,
          embedding:
            face.embedding,
        });

        console.log(
          `REGISTERED: ${member.name}`
        );

      } catch (error) {

        console.error(
          `Error loading ${member.name}:`,
          error
        );

      }

    }

    referenceFacesRef.current =
      references;

    setRegisteredCount(
      references.length
    );

    console.log(
      `REGISTERED FACES: ${references.length}/${teamMembers.length}`
    );

    if (
      references.length ===
      teamMembers.length
    ) {

      setRecognitionMessage(
        "AI ready — start camera"
      );

    } else if (
      references.length > 0
    ) {

      setRecognitionMessage(
        `AI ready — ${references.length}/${teamMembers.length} faces loaded`
      );

    } else {

      setRecognitionMessage(
        "No registered faces loaded"
      );

    }

  };

  /* =======================================================
     START CAMERA
  ======================================================= */

  const startCamera = async () => {

    try {

      setCameraError("");

      if (!aiReady) {

        alert(
          "AI is still loading. Please wait."
        );

        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: {
            width: {
              ideal: 1280,
            },

            height: {
              ideal: 720,
            },

            facingMode: "user",
          },

          audio: false,

        });

      streamRef.current =
        stream;

      setCameraActive(true);

      setRecognitionMessage(
        "Starting camera..."
      );

    } catch (error) {

      console.error(
        "Camera error:",
        error
      );

      setCameraError(
        "Unable to access camera. Please allow camera permission."
      );

    }

  };

  /* =======================================================
     STOP CAMERA
  ======================================================= */

  const stopCamera = () => {

    if (streamRef.current) {

      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

    }

    streamRef.current = null;

    setCameraActive(false);

    setFaceDetected(false);

    setIsScanning(false);

    setIsRecognized(false);

    setEntryRecorded(false);

    setCurrentMember(null);

    setSimilarityScore(null);

    setRecognitionMessage(
      "Camera stopped"
    );

  };

  /* =======================================================
     CONNECT VIDEO
  ======================================================= */

  useEffect(() => {

    if (!cameraActive) {
      return;
    }

    const video =
      videoRef.current;

    if (
      !video ||
      !streamRef.current
    ) {
      return;
    }

    video.srcObject =
      streamRef.current;

    video.onloadedmetadata =
      async () => {

        try {

          await video.play();

          setRecognitionMessage(
            "Looking for a face..."
          );

          detectFace();

        } catch (error) {

          console.error(
            "Video error:",
            error
          );

        }

      };

    return () => {

      video.onloadedmetadata =
        null;

    };

  }, [cameraActive]);

  /* =======================================================
     CONTINUOUS FACE DETECTION
  ======================================================= */

  const detectFace = async () => {

    const video =
      videoRef.current;

    const human =
      humanRef.current;

    if (
      !video ||
      !human
    ) {

      animationRef.current =
        requestAnimationFrame(
          detectFace
        );

      return;

    }

    if (
      video.readyState >= 2 &&
      !detectingRef.current
    ) {

      detectingRef.current =
        true;

      try {

        const result =
          await human.detect(video);

        const faces =
          result.face || [];

        if (faces.length > 0) {

          setFaceDetected(true);

          if (!isScanning) {

            setRecognitionMessage(
              "Face detected — ready to scan"
            );

          }

        } else {

          setFaceDetected(false);

          if (!isScanning) {

            setRecognitionMessage(
              "Looking for a face..."
            );

          }

        }

      } catch (error) {

        console.error(
          "Detection error:",
          error
        );

      }

      detectingRef.current =
        false;

    }

    animationRef.current =
      requestAnimationFrame(
        detectFace
      );

  };

  /* =======================================================
     SCAN & RECOGNIZE
  ======================================================= */

  const scanPerson = async () => {

    const video =
      videoRef.current;

    const human =
      humanRef.current;

    if (
      !video ||
      !human
    ) {

      alert(
        "AI system is not ready yet."
      );

      return;
    }

    if (!faceDetected) {

      alert(
        "No face detected. Please look at the camera."
      );

      return;
    }

    if (
      referenceFacesRef.current.length ===
      0
    ) {

      alert(
        "Registered candidates are not loaded yet."
      );

      return;
    }

    try {

      setIsScanning(true);

      setIsRecognized(false);

      setEntryRecorded(false);

      setCurrentMember(null);

      setSimilarityScore(null);

      setRecognitionMessage(
        "Scanning face..."
      );

      const result =
        await human.detect(video);

      if (
        !result.face ||
        result.face.length === 0
      ) {

        setIsScanning(false);

        setRecognitionMessage(
          "No face found"
        );

        return;
      }

      const liveFace =
        result.face[0];

      if (!liveFace.embedding) {

        setIsScanning(false);

        setRecognitionMessage(
          "Face features unavailable"
        );

        return;
      }

      /* ---------------------------------------------------
         FIND BEST MATCH
      --------------------------------------------------- */

      let bestMatch = null;

      let bestSimilarity = -1;

      for (
        const reference
        of referenceFacesRef.current
      ) {

        const similarity =
          cosineSimilarity(
            liveFace.embedding,
            reference.embedding
          );

        console.log(
          `${reference.member.name} => ${similarity}`
        );

        if (
          similarity >
          bestSimilarity
        ) {

          bestSimilarity =
            similarity;

          bestMatch =
            reference.member;

        }

      }

      setSimilarityScore(
        bestSimilarity
      );

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1000
          )
      );

      setIsScanning(false);

      /* ===================================================
         AUTHORIZED PERSON
      =================================================== */

      if (
        bestMatch &&
        bestSimilarity >=
          MATCH_THRESHOLD
      ) {

        const dateTime =
          getDateTime();

        const activity = {
          id:
            `authorized-${Date.now()}`,

          name:
            bestMatch.name,

          rollNo:
            bestMatch.rollNo,

          status:
            "AUTHORIZED",

          date:
            dateTime.date,

          time:
            dateTime.time,

          timestamp:
            dateTime.timestamp,

          camera:
            "Main Gate - Camera 01",

          similarity:
            Number(
              bestSimilarity.toFixed(3)
            ),
        };

        const updatedActivities =
          saveActivity(
            activity
          );

        setActivityLogs(
          updatedActivities
        );

        setCurrentMember(
          bestMatch
        );

        setIsRecognized(
          true
        );

        setEntryRecorded(
          true
        );

        setRecognitionMessage(
          `Match found: ${bestMatch.name}`
        );

        console.log(
          "AUTHORIZED:",
          bestMatch.name
        );

      }

      /* ===================================================
         UNKNOWN PERSON
      =================================================== */

      else {

        const unknown =
          saveUnknownAccess(
            bestSimilarity
          );

        const unknownActivity = {
          id:
            unknown.id,

          name:
            "Unknown Person",

          rollNo:
            "N/A",

          status:
            "UNAUTHORIZED",

          date:
            unknown.date,

          time:
            unknown.time,

          timestamp:
            unknown.timestamp,

          camera:
            unknown.camera,

          similarity:
            unknown.similarity,
        };

        const updatedActivities =
          saveActivity(
            unknownActivity
          );

        setUnknownLogs(
          loadUnknownLogs()
        );

        setActivityLogs(
          updatedActivities
        );

        setCurrentMember(
          null
        );

        setIsRecognized(
          false
        );

        setEntryRecorded(
          false
        );

        setRecognitionMessage(
          "UNKNOWN PERSON — ACCESS DENIED"
        );

        console.warn(
          "UNAUTHORIZED ACCESS:",
          unknown
        );

        alert(
          `⚠️ UNAUTHORIZED ACCESS\n\nUnknown person detected.\n\nAccess has been denied and the event has been recorded.`
        );

      }

    } catch (error) {

      console.error(
        "Recognition error:",
        error
      );

      setIsScanning(false);

      setRecognitionMessage(
        "Recognition failed"
      );

    }

  };

  /* =======================================================
     CLEAR UNKNOWN LOGS
  ======================================================= */

  const clearUnknownLogs = () => {

    const confirmed =
      window.confirm(
        "Clear all security alerts?"
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      UNKNOWN_LOG_KEY
    );

    setUnknownLogs([]);

    const activities =
      loadActivityLogs();

    const remaining =
      activities.filter(
        (item) =>
          item.status !==
          "UNAUTHORIZED"
      );

    localStorage.setItem(
      ACTIVITY_LOG_KEY,
      JSON.stringify(
        remaining
      )
    );

    setActivityLogs(
      remaining
    );

  };

  /* =======================================================
     HOME
  ======================================================= */

  if (activePage === "home") {

    return (
      <Home
        setActivePage={
          setActivePage
        }
      />
    );

  }

  /* =======================================================
     MAIN LAYOUT
  ======================================================= */

  return (

    <div className="app">

      <aside className="sidebar">

        <div className="logo">

          <div className="logo-box">
            AI
          </div>

          <div>
            <h2>
              CampusGuard
            </h2>

            <p>
              Smart Security
            </p>
          </div>

        </div>

        <div className="menu">

          <button
            className={`menu-item ${
              activePage === "home"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("home")
            }
          >
            🏠 Home
          </button>

          <button
            className={`menu-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage(
                "dashboard"
              )
            }
          >
            🏠 Dashboard
          </button>

          <button
            className={`menu-item ${
              activePage === "live"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage(
                "live"
              )
            }
          >
            📹 Live Monitoring
          </button>

          <button
            className={`menu-item ${
              activePage === "registered"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage(
                "registered"
              )
            }
          >
            👥 Registered People
          </button>

          <button
            className={`menu-item ${
              activePage === "alerts"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage(
                "alerts"
              )
            }
          >
            ⚠️ Security Alerts

            {unknownLogs.length > 0 && (

              <span className="menu-alert-count">
                {unknownLogs.length}
              </span>

            )}

          </button>

        </div>

        <div className="sidebar-bottom">

          <div className="system-online">

            <span></span>

            System Online

          </div>

          <p>
            Campus Security
          </p>

        </div>

      </aside>

      <main className="main-content">

        {/* =================================================
            DASHBOARD
        ================================================= */}

        {activePage === "dashboard" && (

          <Dashboard
            registeredCount={
              registeredCount
            }
            activityLogs={
              activityLogs
            }
            unknownLogs={
              unknownLogs
            }
          />

        )}

        {/* =================================================
            REGISTERED PEOPLE
        ================================================= */}

        {activePage === "registered" && (

          <RegisteredPeople
            registeredCount={
              registeredCount
            }
          />

        )}

        {/* =================================================
            SECURITY ALERTS
        ================================================= */}

        {activePage === "alerts" && (

          <SecurityAlerts
            unknownLogs={
              unknownLogs
            }
            clearUnknownLogs={
              clearUnknownLogs
            }
          />

        )}

        {/* =================================================
            LIVE MONITORING
        ================================================= */}

        {activePage === "live" && (

          <section className="live-page">

            <div className="live-page-header">

              <div>

                <h1>
                  Live Campus Monitoring
                </h1>

                <p>
                  AI-powered monitoring at
                  the main campus entrance
                </p>

              </div>

              <div className="live-large">

                <span></span>

                LIVE

              </div>

            </div>

            <div className="monitoring-grid">

              {/* CAMERA */}

              <div className="monitor-camera-card">

                <div className="monitor-card-title">

                  <div>

                    <h2>
                      Main Entrance
                    </h2>

                    <p>
                      Camera 01 • Main Gate
                    </p>

                  </div>

                  <span>
                    1080P
                  </span>

                </div>

                <div className="large-camera">

                  <div className="camera-label">
                    CAMERA 01
                  </div>

                  {!cameraActive && (

                    <div className="camera-start">

                      <div className="monitor-camera-icon">
                        📹
                      </div>

                      <h2>
                        Camera Ready
                      </h2>

                      <p>
                        {aiReady
                          ? "Start the camera to monitor the campus entrance"
                          : "AI system is loading..."
                        }
                      </p>

                      <button
                        className="start-camera-button"
                        onClick={
                          startCamera
                        }
                        disabled={
                          !aiReady
                        }
                      >
                        🎥 Start Camera
                      </button>

                      {cameraError && (

                        <p className="camera-error">
                          {cameraError}
                        </p>

                      )}

                    </div>

                  )}

                  {cameraActive && (

                    <div className="live-video-container">

                      <video
                        ref={videoRef}
                        className="live-video"
                        autoPlay
                        playsInline
                        muted
                      />

                      <div className="live-camera-overlay">

                        <span className="camera-live-dot">
                          ● LIVE
                        </span>

                        <span>
                          1080P
                        </span>

                      </div>

                      <div
                        className={`face-detection-box ${
                          faceDetected
                            ? "face-found"
                            : ""
                        }`}
                      >

                        <span>

                          {faceDetected
                            ? "✓ FACE DETECTED"
                            : "FACE SCAN AREA"
                          }

                        </span>

                      </div>

                      {isScanning && (

                        <div className="scanning-overlay">

                          <div className="scan-circle">
                            🔍
                          </div>

                          <h2>
                            Scanning Face...
                          </h2>

                          <p>
                            Comparing with
                            registered candidates
                          </p>

                          <div className="scan-line"></div>

                        </div>

                      )}

                      {!isScanning &&
                        recognitionMessage.includes(
                          "UNKNOWN"
                        ) && (

                          <div className="unknown-overlay">

                            <div>
                              ⚠️
                            </div>

                            <h2>
                              ACCESS DENIED
                            </h2>

                            <p>
                              Unknown person detected
                            </p>

                          </div>

                        )}

                    </div>

                  )}

                </div>

                <div className="camera-controls">

                  {!cameraActive && (

                    <button
                      className="scan-button"
                      onClick={
                        startCamera
                      }
                      disabled={
                        !aiReady
                      }
                    >
                      🎥 Start Camera
                    </button>

                  )}

                  {cameraActive && (

                    <>

                      <button
                        className="scan-button"
                        onClick={
                          scanPerson
                        }
                        disabled={
                          isScanning ||
                          !faceDetected
                        }
                      >

                        {isScanning
                          ? "🔍 Scanning..."
                          : "🔍 Scan Face"
                        }

                      </button>

                      <button
                        className="stop-camera-button"
                        onClick={
                          stopCamera
                        }
                      >
                        ■ Stop Camera
                      </button>

                    </>

                  )}

                </div>

              </div>

              {/* AI STATUS */}

              <div className="ai-status-card">

                <h2>
                  AI Detection Status
                </h2>

                <p className="status-description">
                  Real-time monitoring
                  and recognition
                </p>

                <div className="ai-status-item">

                  <div>

                    <strong>
                      Person Detection
                    </strong>

                    <small>
                      Detecting people
                      at entrance
                    </small>

                  </div>

                  <span className="active-status">
                    ● ACTIVE
                  </span>

                </div>

                <div className="ai-status-item">

                  <div>

                    <strong>
                      Face Detection
                    </strong>

                    <small>
                      Detecting faces
                      from camera
                    </small>

                  </div>

                  <span
                    className={
                      faceDetected
                        ? "active-status"
                        : "waiting-status"
                    }
                  >
                    {faceDetected
                      ? "● DETECTED"
                      : "● WAITING"}
                  </span>

                </div>

                <div className="ai-status-item">

                  <div>

                    <strong>
                      Camera Connection
                    </strong>

                    <small>
                      Main entrance
                      camera
                    </small>

                  </div>

                  <span
                    className={
                      cameraActive
                        ? "active-status"
                        : "waiting-status"
                    }
                  >
                    {cameraActive
                      ? "● CONNECTED"
                      : "● OFFLINE"}
                  </span>

                </div>

                <div className="ai-status-item">

                  <div>

                    <strong>
                      Registered Database
                    </strong>

                    <small>
                      {registeredCount}
                      {" "}
                      faces loaded
                    </small>

                  </div>

                  <span
                    className={
                      registeredCount ===
                      teamMembers.length
                        ? "active-status"
                        : "waiting-status"
                    }
                  >
                    {registeredCount ===
                    teamMembers.length
                      ? "● CONNECTED"
                      : "● LOADING"}
                  </span>

                </div>

                {/* AUTHORIZED RESULT */}

                {isRecognized &&
                  currentMember && (

                    <div className="detection-result">

                      <img
                        src={
                          currentMember.photo
                        }
                        alt={
                          currentMember.name
                        }
                        className="result-photo"
                      />

                      <div className="result-details">

                        <small>
                          MATCH FOUND
                        </small>

                        <strong>
                          {
                            currentMember.name
                          }
                        </strong>

                        <p>
                          {
                            currentMember.rollNo
                          }
                        </p>

                        {similarityScore !==
                          null && (

                          <p>
                            Similarity:{" "}
                            {similarityScore.toFixed(
                              3
                            )}
                          </p>

                        )}

                      </div>

                      <div className="verified">
                        ✓ VERIFIED
                      </div>

                    </div>

                  )}

                {/* UNKNOWN RESULT */}

                {!isRecognized &&
                  !isScanning &&
                  recognitionMessage.includes(
                    "UNKNOWN"
                  ) && (

                    <div className="unknown-result">

                      <div className="unknown-result-icon">
                        ⚠️
                      </div>

                      <div>

                        <small>
                          ACCESS DENIED
                        </small>

                        <strong>
                          UNKNOWN PERSON
                        </strong>

                        <p>
                          Unauthorized access attempt
                          recorded
                        </p>

                      </div>

                      <div className="denied">
                        ✕ DENIED
                      </div>

                    </div>

                  )}

                {!isRecognized &&
                  !isScanning &&
                  !recognitionMessage.includes(
                    "UNKNOWN"
                  ) && (

                    <div className="waiting-result">

                      <div className="waiting-icon">
                        👤
                      </div>

                      <div>

                        <strong>
                          {recognitionMessage}
                        </strong>

                        <p>

                          {faceDetected
                            ? "Click Scan Face"
                            : "Stand in front of camera"}

                        </p>

                      </div>

                    </div>

                  )}

              </div>

            </div>

            {/* AUTHORIZED ENTRY */}

            {isRecognized &&
              currentMember && (

                <div className="person-entry-card">

                  <div className="person-entry-left">

                    <img
                      src={
                        currentMember.photo
                      }
                      alt={
                        currentMember.name
                      }
                      className="entry-person-photo"
                    />

                    <div>

                      <div className="recognized-label">
                        ✓ MATCH FOUND
                      </div>

                      <h2>
                        {
                          currentMember.name
                        }
                      </h2>

                      <p>
                        {
                          currentMember.department
                        }
                      </p>

                      <span>
                        Roll No:{" "}
                        {
                          currentMember.rollNo
                        }
                      </span>

                    </div>

                  </div>

                  <div className="entry-details">

                    <div>

                      <small>
                        STATUS
                      </small>

                      <strong className="authorized">
                        ✓ AUTHORIZED
                      </strong>

                    </div>

                    <div>

                      <small>
                        MOVEMENT
                      </small>

                      <strong className="entry-text">
                        ENTRY
                      </strong>

                    </div>

                    <div>

                      <small>
                        TIME
                      </small>

                      <strong>
                        {new Date().toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </strong>

                    </div>

                  </div>

                </div>

              )}

            {/* ENTRY RECORDED */}

            {entryRecorded &&
              currentMember && (

                <div className="entry-recorded">

                  <div className="entry-success-icon">
                    ✓
                  </div>

                  <div>

                    <strong>
                      Entry Recorded Successfully
                    </strong>

                    <p>
                      {
                        currentMember.name
                      }'s entry has been
                      added to the activity log.
                    </p>

                  </div>

                  <span>
                    MAIN GATE
                  </span>

                </div>

              )}

          </section>

        )}

      </main>

    </div>
  );
}

export default App;