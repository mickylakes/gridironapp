"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function AuthModal({ C, onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const supabase = createClient();

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else { onSuccess?.(); onClose(); }
    } else if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account!");
    } else if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setError(error.message);
      else setMessage("Password reset email sent!");
    }

    setLoading(false);
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  }

  return (
    <div
      onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(4px)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{width:"100%",maxWidth:400,borderRadius:20,background:C.modalBg,border:"1px solid "+C.border,boxShadow:"0 24px 64px rgba(0,0,0,0.5)",padding:28}}
      >
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{margin:0,fontSize:22,fontWeight:900}}>
            {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Reset Password"}
          </h2>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:C.textSec}}>×</button>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Google sign in */}
          {mode !== "reset" && (
            <button
              onClick={handleGoogle}
              style={{width:"100%",padding:"12px",borderRadius:12,border:"1px solid "+C.border,cursor:"pointer",background:C.btnBg,color:C.textPri,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          )}

          {mode !== "reset" && (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{flex:1,height:1,background:C.border}}/>
              <span style={{fontSize:12,color:C.textSec}}>or</span>
              <div style={{flex:1,height:1,background:C.border}}/>
            </div>
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{padding:"12px 14px",borderRadius:12,border:"1px solid "+C.border,background:C.inputBg,color:C.textPri,fontSize:14,outline:"none"}}
          />

          {/* Password */}
          {mode !== "reset" && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{padding:"12px 14px",borderRadius:12,border:"1px solid "+C.border,background:C.inputBg,color:C.textPri,fontSize:14,outline:"none"}}
            />
          )}

          {/* Error / success messages */}
          {error && <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",color:"#ef4444",fontSize:13}}>{error}</div>}
          {message && <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)",color:"#34d399",fontSize:13}}>{message}</div>}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{padding:"12px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontWeight:700,fontSize:14,opacity:loading?0.7:1}}
          >
            {loading ? "Loading..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Email"}
          </button>

          {/* Mode switchers */}
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.textSec}}>
            {mode === "login" && (
              <>
                <button onClick={() => setMode("signup")} style={{background:"none",border:"none",cursor:"pointer",color:"#818cf8",fontSize:13}}>Create account</button>
                <button onClick={() => setMode("reset")} style={{background:"none",border:"none",cursor:"pointer",color:C.textSec,fontSize:13}}>Forgot password?</button>
              </>
            )}
            {mode === "signup" && (
              <button onClick={() => setMode("login")} style={{background:"none",border:"none",cursor:"pointer",color:"#818cf8",fontSize:13}}>Already have an account?</button>
            )}
            {mode === "reset" && (
              <button onClick={() => setMode("login")} style={{background:"none",border:"none",cursor:"pointer",color:"#818cf8",fontSize:13}}>Back to sign in</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}