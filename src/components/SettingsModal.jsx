import { Settings } from "lucide-react";
import { btn } from "@/utils/styleHelpers";

export default function SettingsModal({ C, budget, setBudget, numTeams, setNumTeams, onClose, showSettings }) {
  if (!C || !showSettings) return null;

  return (
    <div
      onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(4px)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{width:"100%",maxWidth:420,borderRadius:20,background:C.modalBg,border:"1px solid "+C.border,boxShadow:"0 24px 64px rgba(0,0,0,0.5)",padding:24}}
      >
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{margin:0,fontSize:22,fontWeight:900,display:"flex",alignItems:"center",gap:8}}>
            <Settings size={20} color="#818cf8"/> League Settings
          </h2>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:C.textSec}}>×</button>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          {/* Budget */}
          <div>
            <label style={{display:"block",fontWeight:700,fontSize:13,color:C.textSec,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Auction Budget</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[100,150,200,250,300].map(n => (
                <button key={n} onClick={() => setBudget(n)} style={btn(budget===n, C)}>${n}</button>
              ))}
            </div>
          </div>

          {/* Teams */}
          <div>
            <label style={{display:"block",fontWeight:700,fontSize:13,color:C.textSec,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Number of Teams</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {[8,10,12,14,16].map(n => (
                <button key={n} onClick={() => setNumTeams(n)} style={btn(numTeams===n, C)}>{n}</button>
              ))}
            </div>
          </div>

          {/* Total budget display */}
          <div style={{padding:14,borderRadius:12,background:C.tabDraftBg,border:"1px solid rgba(99,102,241,0.2)"}}>
            <div style={{fontSize:11,fontFamily:"monospace",color:C.textSec,marginBottom:4}}>Total League Budget</div>
            <div style={{fontSize:28,fontWeight:900,background:"linear-gradient(90deg,#fbbf24,#f59e0b)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>${(budget*numTeams).toLocaleString()}</div>
            <div style={{fontSize:11,color:C.textSec}}>${budget} × {numTeams} teams</div>
          </div>

          <button
            onClick={onClose}
            style={{padding:"12px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontWeight:700,fontSize:14}}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}