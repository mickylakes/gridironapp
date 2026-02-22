"use client";

import { useState, useRef, useCallback } from "react";
import { X, Bug, Camera, Upload, Loader2, CheckCircle, ChevronDown, Trash2 } from "lucide-react";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase";

const CATEGORIES = [
  { value: "ui", label: "UI / Display issue" },
  { value: "player_data", label: "Wrong player data" },
  { value: "draft_saving", label: "Draft not saving" },
  { value: "cap_sheet", label: "Cap Sheet issue" },
  { value: "performance", label: "Performance / slow" },
  { value: "other", label: "Other" },
];

const DEVICES = [
  { value: "mobile",  label: "📱 Mobile"  },
  { value: "tablet",  label: "📲 Tablet"  },
  { value: "desktop", label: "🖥️ Desktop" },
];

function detectDevice() {
  const ua = navigator.userAgent;
  const isTablet = /iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua));
  const isMobile = /Android.*Mobile|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  if (isTablet) return "tablet";
  if (isMobile) return "mobile";
  return "desktop";
}

export default function BugReportModal({ C, user, onClose }) {
  const [category, setCategory]       = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot]   = useState(null); // { dataUrl, file }
  const [status, setStatus]           = useState("idle"); // idle | capturing | submitting | success | error
  const [errorMsg, setErrorMsg]       = useState("");
  const [catOpen, setCatOpen]         = useState(false);
  const [device, setDevice]           = useState(() => detectDevice());

  const fileInputRef = useRef(null);

  // ── Screenshot: capture via html2canvas-style canvas API ──────────────────
  const captureScreen = useCallback(async () => {
    setStatus("capturing");
    try {
      // Use the Screen Capture API where available; fall back gracefully
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      stream.getTracks().forEach(t => t.stop());

      const dataUrl = canvas.toDataURL("image/png");
      const blob    = await (await fetch(dataUrl)).blob();
      const file    = new File([blob], `screenshot-${Date.now()}.png`, { type: "image/png" });

      setScreenshot({ dataUrl, file });
      setStatus("idle");
    } catch (err) {
      // User cancelled or browser doesn't support — not a real error
      setStatus("idle");
    }
  }, []);

  // ── Screenshot: manual file upload ────────────────────────────────────────
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshot({ dataUrl: ev.target.result, file });
    reader.readAsDataURL(file);
  }, []);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!category || !description.trim()) {
      setErrorMsg("Please select a category and describe the issue.");
      return;
    }
    setErrorMsg("");
    setStatus("submitting");

    try {
      const supabase = createClient();
      let screenshotUrl = null;

      // 1. Upload screenshot to Supabase Storage if present
      if (screenshot?.file) {
        const path = `${user?.id ?? "anon"}/${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from("bug-screenshots")
          .upload(path, screenshot.file, { contentType: "image/png", upsert: false });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("bug-screenshots")
            .getPublicUrl(path);
          screenshotUrl = urlData?.publicUrl ?? null;
        } else {
          console.error("Screenshot upload error:", uploadError);
          // Non-fatal — proceed without screenshot
        }
      }

      // 2. Capture Sentry event ID so we can correlate manual reports to auto-captured errors
      const sentryEventId = Sentry.captureMessage(
        `[Bug Report] ${category}: ${description.substring(0, 120)}`,
        { level: "info", tags: { source: "manual_report", category } }
      );

      // 3. Persist to bug_reports table
      const metadata = {
        url:       window.location.href,
        userAgent: navigator.userAgent,
        viewport:  `${window.innerWidth}x${window.innerHeight}`,
        device,
        timestamp: new Date().toISOString(),
      };

      const { error: dbError } = await supabase.from("bug_reports").insert({
        user_id:         user?.id ?? null,
        user_email:      user?.email ?? null,
        category,
        description:     description.trim(),
        screenshot_url:  screenshotUrl,
        sentry_event_id: sentryEventId,
        metadata,
        status:          "open",
      });

      if (dbError) throw dbError;

      setStatus("success");
    } catch (err) {
      console.error("Bug report submission error:", err);
      setErrorMsg("Something went wrong submitting the report. Please try again.");
      setStatus("error");
    }
  }, [category, description, screenshot, user, device]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedLabel = CATEGORIES.find(c => c.value === category)?.label ?? "Select a category";
  const isSubmitting  = status === "submitting" || status === "capturing";

  // ─────────────────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle(C)} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign: "center", padding: "40px 24px" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <CheckCircle size={32} color="#34d399" />
            </div>
            <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 800, color: C.textPri }}>
              Report submitted!
            </h2>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)",
              borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700,
              color: "#fbbf24", marginBottom: 16,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fbbf24", display: "inline-block" }} />
              Status: Open
            </div>
            <p style={{ margin: "0 0 24px", color: C.textSec, fontSize: 14, lineHeight: 1.6 }}>
              Thanks for helping improve Grid Iron. We'll look into this as soon as possible.
            </p>
            <button onClick={onClose} style={primaryBtn}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle(C)} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bug size={18} color="#f87171" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.textPri }}>Report a Bug</h2>
              <p style={{ margin: 0, fontSize: 12, color: C.textSec, fontFamily: "monospace" }}>
                Help us squash it
              </p>
            </div>
          </div>
          <button onClick={onClose} style={iconBtn(C)}>
            <X size={18} />
          </button>
        </div>

        {/* Category dropdown */}
        <div style={{ marginBottom: 16, position: "relative" }}>
          <label style={labelStyle(C)}>Category *</label>
          <button
            onClick={() => setCatOpen(p => !p)}
            style={{
              width: "100%", padding: "10px 14px",
              background: C.inputBg, border: "1px solid " + (catOpen ? "#6366f1" : C.border),
              borderRadius: 10, color: category ? C.textPri : C.textSec,
              fontSize: 14, cursor: "pointer", display: "flex",
              justifyContent: "space-between", alignItems: "center",
              transition: "border-color 0.15s",
            }}
          >
            {selectedLabel}
            <ChevronDown size={16} style={{ transform: catOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          </button>
          {catOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
              background: C.inputBg, border: "1px solid #6366f1",
              borderRadius: 10, overflow: "hidden", zIndex: 100,
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => { setCategory(cat.value); setCatOpen(false); }}
                  style={{
                    width: "100%", padding: "10px 14px", background: "transparent",
                    border: "none", color: cat.value === category ? "#818cf8" : C.textPri,
                    fontSize: 14, cursor: "pointer", textAlign: "left",
                    background: cat.value === category ? "rgba(99,102,241,0.1)" : "transparent",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Device toggle */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle(C)}>
            Device
            <span style={{ fontWeight: 400, color: C.textSec, marginLeft: 6 }}>(auto-detected)</span>
          </label>
          <div style={{ display: "inline-flex", background: C.inputBg, border: "1px solid " + C.border, borderRadius: 10, padding: 3, gap: 2 }}>
            {DEVICES.map(d => (
              <button
                key={d.value}
                onClick={() => setDevice(d.value)}
                style={{
                  padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                  fontWeight: 700, fontSize: 12,
                  background: device === d.value ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
                  color: device === d.value ? "#fff" : C.textSec,
                  transition: "all 0.15s",
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle(C)}>Description *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What happened? What were you trying to do? What did you expect?"
            rows={4}
            style={{
              width: "100%", padding: "10px 14px", resize: "vertical",
              background: C.inputBg, border: "1px solid " + C.border,
              borderRadius: 10, color: C.textPri, fontSize: 14,
              lineHeight: 1.6, fontFamily: "system-ui, sans-serif",
              outline: "none", boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={e => e.target.style.borderColor = "#6366f1"}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <div style={{ textAlign: "right", fontSize: 11, color: C.textSec, marginTop: 4 }}>
            {description.length} / 2000
          </div>
        </div>

        {/* Screenshot */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle(C)}>Screenshot <span style={{ color: C.textSec, fontWeight: 400 }}>(optional)</span></label>

          {screenshot ? (
            <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid " + C.border }}>
              <img src={screenshot.dataUrl} alt="screenshot" style={{ width: "100%", display: "block", maxHeight: 200, objectFit: "cover" }} />
              <button
                onClick={() => setScreenshot(null)}
                style={{
                  position: "absolute", top: 8, right: 8,
                  background: "rgba(0,0,0,0.7)", border: "none", borderRadius: 8,
                  color: "#fff", padding: "6px 8px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4, fontSize: 12,
                }}
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              {/* Screen capture button — shows only if API is likely available */}
              <button
                onClick={captureScreen}
                disabled={isSubmitting}
                style={{
                  ...screenshotBtn(C),
                  flex: 1,
                  opacity: isSubmitting ? 0.5 : 1,
                }}
              >
                <Camera size={15} />
                {status === "capturing" ? "Capturing…" : "Capture Screen"}
              </button>

              {/* File upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                style={{ ...screenshotBtn(C), flex: 1, opacity: isSubmitting ? 0.5 : 1 }}
              >
                <Upload size={15} />
                Upload Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
            </div>
          )}
        </div>

        {/* Error */}
        {errorMsg && (
          <div style={{
            padding: "10px 14px", borderRadius: 10, marginBottom: 16,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171", fontSize: 13,
          }}>
            {errorMsg}
          </div>
        )}

        {/* User context note */}
        <div style={{
          padding: "8px 12px", borderRadius: 8, marginBottom: 16,
          background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)",
          fontSize: 12, color: C.textSec,
        }}>
          🔍 We'll automatically include your current page URL, browser info, and screen size to help us reproduce the issue.
          {user ? ` Submitted as ${user.email}.` : " You're not logged in — report will be anonymous."}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ ...secondaryBtn(C), flex: 1 }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !category || !description.trim()}
            style={{
              ...primaryBtn, flex: 2,
              opacity: isSubmitting || !category || !description.trim() ? 0.5 : 1,
              cursor: isSubmitting || !category || !description.trim() ? "not-allowed" : "pointer",
            }}
          >
            {status === "submitting" ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                Submitting…
              </span>
            ) : "Submit Report"}
          </button>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────
const overlayStyle = {
  position: "fixed", inset: 0, zIndex: 1000,
  background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "16px",
};

const modalStyle = (C) => ({
  background: C.modalBg,
  border: "1px solid " + C.border,
  borderRadius: 18,
  padding: 24,
  width: "100%",
  maxWidth: 480,
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
});

const labelStyle = (C) => ({
  display: "block", fontSize: 13, fontWeight: 700,
  color: C.textSec, marginBottom: 6, letterSpacing: "0.02em",
});

const iconBtn = (C) => ({
  background: C.btnBg, border: "1px solid " + C.border,
  borderRadius: 10, padding: "8px", cursor: "pointer",
  color: C.textSec, display: "flex", alignItems: "center",
});

const screenshotBtn = (C) => ({
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
  cursor: "pointer", border: "1px dashed " + C.border,
  background: "transparent", color: C.textSec,
  transition: "border-color 0.15s, color 0.15s",
});

const primaryBtn = {
  padding: "11px 20px", borderRadius: 10, border: "none",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
  transition: "opacity 0.15s",
};

const secondaryBtn = (C) => ({
  padding: "11px 20px", borderRadius: 10,
  border: "1px solid " + C.border,
  background: "transparent", color: C.textSec,
  fontSize: 14, fontWeight: 600, cursor: "pointer",
});
