import { Star } from "lucide-react";
import { pc, ti } from "@/constants/theme";

export default function PlayerModal({ player, favorites, toggleFav, onClose }) {
  if (!player) return null;

  return (
    <div
      onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(4px)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{width:"100%",maxWidth:600,maxHeight:"85vh",overflowY:"auto",borderRadius:20,background:"var(--modal-bg)",border:"1px solid var(--border)",boxShadow:"0 24px 64px rgba(0,0,0,0.5)"}}
      >
        {/* Header */}
        <div style={{padding:"20px 24px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <div style={{width:4,height:56,borderRadius:2,background:pc(player.position)}}/>
            <div>
              <h2 style={{margin:"0 0 6px",fontSize:26,fontWeight:900}}>{player.name}</h2>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{padding:"3px 10px",borderRadius:6,background:pc(player.position),color:"#fff",fontWeight:800,fontSize:12}}>{player.position}</span>
                <span style={{fontSize:13,fontFamily:"monospace"}}>{player.team} {player.number && player.number !== "0" && player.number !== 0 ? "#"+player.number : ""}</span>
                <span style={{fontSize:13}}>Age {player.age} · {player.yearsExp} YOE</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,padding:4}}>×</button>
        </div>

        {/* Stats grid */}
        <div style={{padding:24,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          {[
            {label:"Redraft Pts", value:player.redraftPoints.toFixed(1), color:"#34d399"},
            {label:"Dynasty Pts", value:player.dynastyPoints.toFixed(1), color:"#818cf8"},
            {label:"Auction $",   value:"$"+player.auctionValue,         color:"#fbbf24"},
            {label:"Dynasty $",  value:"$"+player.dynastyAuctionValue,   color:"#f472b6"},
            {label:"Tier",       value:ti(player.tier).label,            color:"#94a3b8"},
          ].map(item => (
            <div key={item.label} style={{borderRadius:12,padding:"12px 16px",border:"1px solid var(--border)"}}>
              <div style={{fontSize:11,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{item.label}</div>
              <div style={{fontSize:22,fontWeight:900,color:item.color}}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{padding:"0 24px 24px",display:"flex",gap:10}}>
          <button
            onClick={() => toggleFav(player.id)}
            style={{flex:1,padding:"12px",borderRadius:12,border:"none",cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:favorites.has(player.id)?"linear-gradient(135deg,#f59e0b,#d97706)":"#1e293b",color:favorites.has(player.id)?"#fff":"#94a3b8"}}
          >
            <Star size={16} fill={favorites.has(player.id) ? "#fff" : "none"}/>
            {favorites.has(player.id) ? "Remove Favorite" : "Add to Favorites"}
          </button>
          <button onClick={onClose} style={{padding:"12px 20px",borderRadius:12,border:"none",cursor:"pointer",fontWeight:700,background:"#1e293b",color:"#94a3b8"}}>Close</button>
        </div>
      </div>
    </div>
  );
}