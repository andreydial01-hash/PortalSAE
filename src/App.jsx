// PARTE 1/3 — Imports · Constantes · Componentes compartidos · HomeAdmin · InventarioPanel
import { useState, useEffect, useRef, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Building2, LogOut, Users, DollarSign, BarChart2, Home, Plus, Eye, EyeOff,
  ChevronRight, TrendingUp, TrendingDown, AlertCircle, Wallet, ClipboardList,
  Trash2, ChevronDown, ChevronUp, Timer, Play, Pause, CheckCircle2,
  Warehouse, Package, Search, ArrowUpCircle, ArrowDownCircle, X, Car, Bell } from "lucide-react";
import { supabase, db } from './lib/db.js';

const COMPANIES = {
  ubuntu:{ id:"ubuntu", name:"Ubuntu",             color:"#C2440A", bg:"linear-gradient(135deg,#E95420,#C2440A)", logo:"U", desc:"Constructora Ubuntu S.A. de C.V." },
  sae:   { id:"sae",    name:"SAE & CO MARKETING",  color:"#1557A0", bg:"linear-gradient(135deg,#1A73E8,#1557A0)", logo:"S", desc:"SAE & Co Marketing S.A. de C.V." },
};
const USERS_INIT = {
  ubuntu:[ { id:1, name:"Admin Ubuntu", email:"admin@ubuntu.mx", pw:"admin123", role:"admin" } ],
  sae:   [ { id:1, name:"Admin SAE",    email:"admin@saeco.mx",  pw:"admin123", role:"admin" } ],
};
const OBRAS_INIT = {
  ubuntu:[
    { id:1, nombre:"Torre Residencial Polanco",  cliente:"Inmobiliaria Del Valle",  presupuesto:45000000, avance:78,  estado:"En progreso", inicio:"2024-03-01", fin:"2025-08-30", movimientos:[{id:1,concepto:"Anticipo contrato",tipo:"ingreso",monto:18000000,fecha:"2024-03-10"},{id:2,concepto:"Materiales estructura",tipo:"egreso",monto:12000000,fecha:"2024-04-01"},{id:3,concepto:"Estimación 1",tipo:"ingreso",monto:11000000,fecha:"2024-06-15"},{id:4,concepto:"Mano de obra Q1",tipo:"egreso",monto:8500000,fecha:"2024-06-20"}] },
    { id:2, nombre:"Centro Comercial Satélite",  cliente:"Grupo Comercial Norte",   presupuesto:82000000, avance:100, estado:"Completada",  inicio:"2023-06-01", fin:"2024-12-15", movimientos:[{id:1,concepto:"Anticipo inicial",tipo:"ingreso",monto:40000000,fecha:"2023-06-10"},{id:2,concepto:"Cimentación",tipo:"egreso",monto:22000000,fecha:"2023-08-01"},{id:3,concepto:"Estimación final",tipo:"ingreso",monto:42000000,fecha:"2024-10-20"},{id:4,concepto:"Acabados y cierre",tipo:"egreso",monto:39400000,fecha:"2024-11-15"}] },
    { id:3, nombre:"Puente Vehicular Ecatepec",  cliente:"Gob. EDOMEX",             presupuesto:120000000, avance:45, estado:"En progreso", inicio:"2024-09-01", fin:"2026-03-30", movimientos:[{id:1,concepto:"Anticipo gobierno",tipo:"ingreso",monto:30000000,fecha:"2024-09-05"},{id:2,concepto:"Excavación y pilotes",tipo:"egreso",monto:22000000,fecha:"2024-10-01"}] },
    { id:4, nombre:"Planta Industrial Toluca",   cliente:"Manufactura Global S.A.", presupuesto:35000000,  avance:0,  estado:"Licitación",  inicio:"2025-02-01", fin:"2025-12-30", movimientos:[] },
  ],
  sae:[
    { id:1, nombre:"Rebranding Bimbo",        cliente:"Grupo Bimbo",    presupuesto:8500000,  avance:85,  estado:"En progreso", inicio:"2024-08-01", fin:"2025-05-30", movimientos:[{id:1,concepto:"Anticipo estrategia",tipo:"ingreso",monto:3500000,fecha:"2024-08-10"},{id:2,concepto:"Producción creativa",tipo:"egreso",monto:2800000,fecha:"2024-09-01"}] },
    { id:2, nombre:"Estrategia Digital OXXO", cliente:"FEMSA Comercio", presupuesto:12000000, avance:100, estado:"Completada",  inicio:"2024-01-01", fin:"2024-10-31", movimientos:[{id:1,concepto:"Anticipo",tipo:"ingreso",monto:6000000,fecha:"2024-01-10"},{id:2,concepto:"Equipo y producción",tipo:"egreso",monto:4500000,fecha:"2024-03-01"},{id:3,concepto:"Cierre proyecto",tipo:"ingreso",monto:6000000,fecha:"2024-09-20"},{id:4,concepto:"Campaña paid media",tipo:"egreso",monto:3900000,fecha:"2024-10-01"}] },
    { id:3, nombre:"Lanzamiento Nestlé",      cliente:"Nestlé México",  presupuesto:6200000,  avance:40,  estado:"En progreso", inicio:"2024-11-01", fin:"2025-07-30", movimientos:[{id:1,concepto:"Anticipo",tipo:"ingreso",monto:2480000,fecha:"2024-11-10"},{id:2,concepto:"Investigación de mercado",tipo:"egreso",monto:1860000,fecha:"2024-12-01"}] },
  ],
};
const FINANZAS = {
  ubuntu:{ mov:[{m:"Oct",i:12500000,e:9800000},{m:"Nov",i:15200000,e:11300000},{m:"Dic",i:8900000,e:7200000},{m:"Ene",i:18400000,e:13100000},{m:"Feb",i:22100000,e:16800000},{m:"Mar",i:19700000,e:14500000}] },
  sae:   { mov:[{m:"Oct",i:2800000,e:2100000},{m:"Nov",i:3400000,e:2600000},{m:"Dic",i:1900000,e:1500000},{m:"Ene",i:4200000,e:3100000},{m:"Feb",i:5100000,e:3800000},{m:"Mar",i:4600000,e:3400000}] },
};
const ESTADOS = ["En progreso","Completada","Pendiente","En pausa","Licitación"];

const T = co => co?.id==="sae"
  ? {obra:"pedido",Obra:"Pedido",obras:"pedidos",Obras:"Pedidos",NombreObra:"Nombre del pedido",GuardarObra:"Guardar pedido",EliminarObra:"¿Eliminar este pedido?",AvanceObra:"Avance del pedido",ObrasProyectos:"Pedidos"}
  : {obra:"obra",Obra:"Obra",obras:"obras",Obras:"Obras",NombreObra:"Nombre de la obra",GuardarObra:"Guardar obra",EliminarObra:"¿Eliminar esta obra?",AvanceObra:"Avance de obra",ObrasProyectos:"Obras y Proyectos"};

const roleLabel = r =>
  r==="admin"          ?"Director General"     :
  r==="administrativo" ?"Administrativo General":
  r==="logistica"      ?"Logística"             :
  r==="operativo"      ?"Administrativo"        : r;
const fmt  = n => new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0}).format(n);
const fmtM = n => `$${(Math.abs(n)/1e6).toFixed(1)}M`;
const pct  = n => `${n.toFixed(1)}%`;
const now  = () => new Date().toLocaleString("es-MX",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
const getI = o => (o.movimientos||[]).filter(m=>m.tipo==="ingreso").reduce((s,m)=>s+m.monto,0);
const getE = o => (o.movimientos||[]).filter(m=>m.tipo==="egreso").reduce((s,m)=>s+m.monto,0)+(o.inventario||[]).reduce((s,it)=>s+it.subtotal,0);
const getM = (i,e) => i>0?((i-e)/i)*100:0;
const getU = (i,e) => i-e;

// Storage manejado por Supabase — ver src/lib/db.js

// ── COMPONENTES UI ────────────────────────────────────────────────────────────
const Badge = ({text}) => {
  const map={"Completada":"#D1FAE5;#065F46","En progreso":"#DBEAFE;#1E40AF","Pendiente":"#F3F4F6;#374151","En pausa":"#FEF3C7;#92400E","Licitación":"#FEF3C7;#92400E"};
  const [bg,color]=(map[text]||map["Pendiente"]).split(";");
  return <span style={{background:bg,color,fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20,whiteSpace:"nowrap"}}>{text}</span>;
};
const KPICard = ({label,value,icon:Icon,color,sub}) => (
  <div style={{background:"#fff",borderRadius:16,padding:"14px 16px",border:"1px solid #F0F0F0"}}>
    <div style={{background:color+"18",borderRadius:10,padding:6,display:"inline-flex",marginBottom:8}}><Icon size={16} color={color}/></div>
    <div style={{fontSize:20,fontWeight:700,color:"#111",lineHeight:1.2}}>{value}</div>
    <div style={{fontSize:12,color:"#6B7280",marginTop:3}}>{label}</div>
    {sub&&<div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>{sub}</div>}
  </div>
);
const ProgressBar = ({value,color}) => (
  <div style={{height:6,background:"#F3F4F6",borderRadius:99,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${Math.min(value,100)}%`,background:color,borderRadius:99}}/>
  </div>
);
const FiltroFecha = ({desde,setDesde,hasta,setHasta}) => (
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
    <div><div style={{fontSize:10,color:"#6B7280",marginBottom:4}}>Desde</div>
      <input type="date" value={desde} onChange={e=>setDesde(e.target.value)} style={{border:"1px solid #E5E7EB",borderRadius:9,padding:"7px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/></div>
    <div><div style={{fontSize:10,color:"#6B7280",marginBottom:4}}>Hasta</div>
      <input type="date" value={hasta} onChange={e=>setHasta(e.target.value)} style={{border:"1px solid #E5E7EB",borderRadius:9,padding:"7px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/></div>
    {(desde||hasta)&&<button onClick={()=>{setDesde("");setHasta("");}} style={{gridColumn:"1/-1",background:"#F3F4F6",border:"none",borderRadius:8,padding:"6px",fontSize:11,color:"#6B7280",cursor:"pointer"}}>Limpiar filtro</button>}
  </div>
);

// ── HOME ADMIN ────────────────────────────────────────────────────────────────
function HomeAdmin({co,obras}){
  const ti=obras.reduce((s,o)=>s+getI(o),0), te=obras.reduce((s,o)=>s+getE(o),0);
  const barData=obras.filter(o=>getI(o)>0).map(o=>({n:o.nombre.split(" ").slice(0,2).join(" "),m:parseFloat(getM(getI(o),getE(o)).toFixed(1))}));
  const trendData=FINANZAS[co.id].mov.map(r=>({mes:r.m,ingresos:r.i,egresos:r.e,utilidad:r.i-r.e}));
  return(
    <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{fontSize:17,fontWeight:700,color:"#111"}}>Resumen General</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <KPICard label="Ingreso Total" value={fmtM(ti)} icon={TrendingUp}   color={co.color}/>
        <KPICard label="Egreso Total"  value={fmtM(te)} icon={TrendingDown} color="#EF4444"/>
        <KPICard label="Utilidad Neta" value={fmtM(getU(ti,te))} icon={DollarSign} color="#10B981" sub="Acumulada"/>
        <KPICard label="Margen Global" value={pct(getM(ti,te))} icon={BarChart2} color="#8B5CF6" sub={`${obras.filter(o=>o.estado==="En progreso").length} ${T(co).obras} activas`}/>
      </div>
      <div style={{background:"#fff",borderRadius:20,padding:"18px 16px 10px",border:"1px solid #F0F0F0",overflow:"hidden"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#111",marginBottom:2}}>Tendencia financiera</div>
        <div style={{fontSize:11,color:"#9CA3AF",marginBottom:14}}>Últimos 6 meses</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={trendData} margin={{top:4,right:4,left:-28,bottom:0}}>
            <defs>
              {[["gI","#059669",0.2],["gE","#EF4444",0.15],["gU","#8B5CF6",0.2]].map(([id,c,o])=>(
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={o}/><stop offset="100%" stopColor={c} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="0" stroke="#F3F4F6" vertical={false}/>
            <XAxis dataKey="mes" tick={{fontSize:10,fill:"#9CA3AF"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:"#9CA3AF"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1e6).toFixed(0)}M`}/>
            <Tooltip contentStyle={{background:"#1F2937",border:"none",borderRadius:12,padding:"10px 14px"}}
              labelStyle={{color:"#F9FAFB",fontSize:11,fontWeight:700,marginBottom:6}}
              itemStyle={{fontSize:11,fontWeight:500,padding:"2px 0"}}
              formatter={(v,n)=>[fmt(v),n==="ingresos"?"Ingreso":n==="egresos"?"Egreso":"Utilidad"]}
              cursor={{stroke:"#E5E7EB",strokeWidth:1}}/>
            <Area type="monotone" dataKey="ingresos" stroke="#059669" strokeWidth={2} fill="url(#gI)" dot={false} activeDot={{r:4,fill:"#059669",strokeWidth:0}} name="ingresos"/>
            <Area type="monotone" dataKey="egresos"  stroke="#EF4444" strokeWidth={2} fill="url(#gE)" dot={false} activeDot={{r:4,fill:"#EF4444",strokeWidth:0}} name="egresos"/>
            <Area type="monotone" dataKey="utilidad" stroke="#8B5CF6" strokeWidth={2} fill="url(#gU)" dot={false} activeDot={{r:4,fill:"#8B5CF6",strokeWidth:0}} name="utilidad"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{background:"#fff",borderRadius:16,padding:"18px 16px",border:"1px solid #F0F0F0"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#111",marginBottom:2}}>Margen por {T(co).Obra}</div>
        <div style={{fontSize:11,color:"#9CA3AF",marginBottom:16}}>Rentabilidad % sobre ingresos</div>
        {barData.length===0
          ?<div style={{textAlign:"center",padding:"24px 0",color:"#9CA3AF",fontSize:12}}>Sin datos suficientes</div>
          :<div style={{display:"flex",flexDirection:"column",gap:12}}>
            {barData.map((item,idx)=>{
              const clamp=Math.min(Math.max(item.m,0),100);
              const color=item.m>=25?"#059669":item.m>=15?"#0EA5E9":item.m>=0?"#F59E0B":"#EF4444";
              return(
                <div key={idx}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <span style={{fontSize:11,fontWeight:500,color:"#374151",flex:1,paddingRight:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.n}</span>
                    <span style={{fontSize:13,fontWeight:800,color}}>{item.m}%</span>
                  </div>
                  <div style={{height:8,background:"#F3F4F6",borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${clamp}%`,background:`linear-gradient(90deg,${color}66,${color})`,borderRadius:99}}/>
                  </div>
                </div>
              );
            })}
          </div>
        }
      </div>
    </div>
  );
}

// ── INVENTARIO PANEL (dentro de obra) ────────────────────────────────────────
const CATEGORIAS_INV_BY_CO = co => co?.id==="sae"
  ? ["Mobiliario","Papelería","Tecnología","Ferretería","Otros"]
  : ["Estructura","Acabados","Instalaciones","Herramienta","Equipo","Material general","Otro"];
const UNIDADES = ["pza","kg","ton","m","m²","m³","lt","saco","rollo","caja","juego"];

function InventarioPanel({obra,setObras,co,canEdit}){
  const CATS = CATEGORIAS_INV_BY_CO(co);
  // FIX: función para obtener el form inicial siempre con la categoría correcta
  const initForm = () => ({nombre:"",categoria:CATS[0],cantidad:"",unidad:"pza",precioUnitario:"",fecha:new Date().toISOString().slice(0,10),proveedor:""});
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState(initForm);
  const [err,setErr]=useState("");
  const [buscar,setBuscar]=useState("");
  const [catFiltro,setCatFiltro]=useState("todas");
  const [confirmDel,setConfirmDel]=useState(null);
  const inv=obra.inventario||[];

  const guardar=()=>{
    if(!form.nombre||!form.cantidad||!form.precioUnitario){setErr("Nombre, cantidad y precio son obligatorios.");return;}
    const cant=parseFloat(String(form.cantidad).replace(/,/g,""));
    const precio=parseFloat(String(form.precioUnitario).replace(/,/g,""));
    if(isNaN(cant)||cant<=0||isNaN(precio)||precio<0){setErr("Cantidad o precio inválidos.");return;}
    const item={id:Date.now(),nombre:form.nombre,categoria:form.categoria,cantidad:cant,unidad:form.unidad,precioUnitario:precio,subtotal:cant*precio,fecha:form.fecha,proveedor:form.proveedor,registrado:now()};
    setObras(prev=>prev.map(o=>o.id===obra.id?{...o,inventario:[...(o.inventario||[]),item]}:o));
    setForm(initForm()); // FIX: reset correcto por empresa
    setShowForm(false); setErr("");
  };
  const eliminar=id=>{
    setObras(prev=>prev.map(o=>o.id===obra.id?{...o,inventario:(o.inventario||[]).filter(it=>it.id!==id)}:o));
    setConfirmDel(null);
  };

  const filtrados=inv.filter(it=>{
    const okCat=catFiltro==="todas"||it.categoria===catFiltro;
    const okBus=!buscar||it.nombre.toLowerCase().includes(buscar.toLowerCase())||it.proveedor?.toLowerCase().includes(buscar.toLowerCase());
    return okCat&&okBus;
  });
  const totalFiltrado=filtrados.reduce((s,it)=>s+it.subtotal,0);
  const totalGeneral=inv.reduce((s,it)=>s+it.subtotal,0);
  const porCat={};
  inv.forEach(it=>{porCat[it.categoria]=(porCat[it.categoria]||0)+it.subtotal;});
  const catKeys=Object.keys(porCat).sort((a,b)=>porCat[b]-porCat[a]);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {inv.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[[inv.length,"Artículos","#374151"],[fmt(totalGeneral),"Gasto total","#DC2626"],[catKeys.length,"Categorías",co.color]].map(([v,l,c])=>(
            <div key={l} style={{background:"#F9FAFB",borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
              <div style={{fontSize:13,fontWeight:700,color:c,wordBreak:"break-all"}}>{v}</div>
              <div style={{fontSize:9,color:"#9CA3AF",marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      )}
      {catKeys.length>0&&(
        <div style={{background:"#F9FAFB",borderRadius:12,padding:"10px 12px",display:"flex",flexDirection:"column",gap:6}}>
          <div style={{fontSize:11,fontWeight:600,color:"#374151",marginBottom:4}}>Gasto por categoría</div>
          {catKeys.map(cat=>{
            const p=totalGeneral>0?(porCat[cat]/totalGeneral)*100:0;
            return(
              <div key={cat}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#6B7280",marginBottom:3}}>
                  <span>{cat}</span><span style={{fontWeight:600}}>{fmt(porCat[cat])} · {p.toFixed(0)}%</span>
                </div>
                <div style={{height:5,background:"#E5E7EB",borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${p}%`,background:co.color,borderRadius:99}}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {canEdit&&<button onClick={()=>{setShowForm(!showForm);setErr("");}} style={{background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Plus size={13}/> Agregar material / gasto</button>}
      {showForm&&(
        <div style={{background:"#fff",borderRadius:14,padding:"14px",border:"1.5px solid "+co.color,display:"flex",flexDirection:"column",gap:9}}>
          <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>Nuevo ítem de inventario</div>
          <input placeholder="Nombre del material / concepto *" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:9,padding:"8px 11px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          <input placeholder="Proveedor (opcional)" value={form.proveedor} onChange={e=>setForm({...form,proveedor:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:9,padding:"8px 11px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Categoría</div>
              <select value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:9,padding:"8px 10px",fontSize:12,outline:"none",width:"100%"}}>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Fecha</div>
              <input type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:9,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <div><div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Cantidad *</div>
              <input placeholder="0" value={form.cantidad} onChange={e=>setForm({...form,cantidad:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:9,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
            </div>
            <div><div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Unidad</div>
              <select value={form.unidad} onChange={e=>setForm({...form,unidad:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:9,padding:"8px 10px",fontSize:12,outline:"none",width:"100%"}}>
                {UNIDADES.map(u=><option key={u}>{u}</option>)}
              </select>
            </div>
            <div><div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Precio unitario *</div>
              <input placeholder="$0.00" value={form.precioUnitario} onChange={e=>setForm({...form,precioUnitario:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:9,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
            </div>
          </div>
          {form.cantidad&&form.precioUnitario&&(()=>{const s=parseFloat(form.cantidad)*parseFloat(form.precioUnitario);return isNaN(s)?null:(
            <div style={{background:"#F0FDF4",borderRadius:9,padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#6B7280"}}>Subtotal calculado</span>
              <span style={{fontSize:14,fontWeight:700,color:"#059669"}}>{fmt(s)}</span>
            </div>
          );})()}
          {err&&<div style={{fontSize:11,color:"#DC2626",background:"#FEF2F2",padding:"7px 10px",borderRadius:8}}>{err}</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={guardar} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:9,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Guardar ítem</button>
            <button onClick={()=>{setShowForm(false);setErr("");}} style={{padding:"9px 14px",border:"1px solid #E5E7EB",borderRadius:9,background:"#fff",fontSize:12,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
          </div>
        </div>
      )}
      {inv.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          <input placeholder="🔍 Buscar material o proveedor…" value={buscar} onChange={e=>setBuscar(e.target.value)} style={{border:"1px solid #E5E7EB",borderRadius:9,padding:"8px 12px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
            {["todas",...CATS].filter(c=>c==="todas"||porCat[c]).map(c=>(
              <button key={c} onClick={()=>setCatFiltro(c)} style={{padding:"4px 11px",borderRadius:20,fontSize:10,fontWeight:600,border:"none",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,background:catFiltro===c?co.color:"#F3F4F6",color:catFiltro===c?"#fff":"#6B7280"}}>
                {c==="todas"?"Todas":c}
              </button>
            ))}
          </div>
          {(buscar||catFiltro!=="todas")&&(
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6B7280",padding:"4px 2px"}}>
              <span>{filtrados.length} resultado{filtrados.length!==1?"s":""}</span>
              <span style={{fontWeight:700,color:"#DC2626"}}>Total filtrado: {fmt(totalFiltrado)}</span>
            </div>
          )}
        </div>
      )}
      {filtrados.length===0&&inv.length===0&&<div style={{textAlign:"center",padding:"24px 0",color:"#9CA3AF",fontSize:12}}>Sin materiales registrados aún</div>}
      {filtrados.length===0&&inv.length>0&&<div style={{textAlign:"center",padding:"16px 0",color:"#9CA3AF",fontSize:12}}>Sin resultados</div>}
      {filtrados.map(it=>(
        <div key={it.id} style={{background:"#F9FAFB",borderRadius:12,padding:"11px 13px",border:"1px solid #F0F0F0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                <span style={{fontSize:12,fontWeight:600,color:"#111"}}>{it.nombre}</span>
                <span style={{fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:20,background:co.color+"18",color:co.color}}>{it.categoria}</span>
              </div>
              {it.proveedor&&<div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>Proveedor: {it.proveedor}</div>}
              <div style={{fontSize:10,color:"#6B7280",marginTop:4}}>{it.cantidad} {it.unidad} × {fmt(it.precioUnitario)} · {it.fecha}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
              <span style={{fontSize:13,fontWeight:700,color:"#DC2626"}}>{fmt(it.subtotal)}</span>
              {canEdit&&<button onClick={()=>setConfirmDel(confirmDel===it.id?null:it.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:0}}><X size={12} color="#9CA3AF"/></button>}
            </div>
          </div>
          {confirmDel===it.id&&(
            <div style={{marginTop:8,background:"#FEF2F2",borderRadius:8,padding:"8px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
              <span style={{fontSize:11,color:"#DC2626"}}>¿Eliminar este ítem?</span>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>eliminar(it.id)} style={{background:"#DC2626",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Eliminar</button>
                <button onClick={()=>setConfirmDel(null)} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:6,padding:"4px 8px",fontSize:11,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      ))}
      {inv.length>0&&(
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#FEF2F2",borderRadius:11}}>
          <span style={{fontSize:12,fontWeight:600,color:"#374151"}}>Total general inventario</span>
          <span style={{fontSize:15,fontWeight:700,color:"#DC2626"}}>{fmt(totalGeneral)}</span>
        </div>
      )}
    </div>
  );
}

// ── OBRA DETALLE ──────────────────────────────────────────────────────────────
function ObraDetalleView({obra,setObras,co,onBack}){
  const [tab,setTab]=useState("resumen");
  const [showEstados,setShowEstados]=useState(false);
  const [movForm,setMovForm]=useState({show:false,tipo:"ingreso",concepto:"",monto:"",fecha:new Date().toISOString().slice(0,10),notas:""});
  const [movErr,setMovErr]=useState("");
  const [dragging,setDragging]=useState(false);
  const [localAvance,setLocalAvance]=useState(obra.avance);
  const barRef=useRef(null);
  // FIX: refs para evitar stale closure en drag handlers
  const localAvanceRef=useRef(localAvance);
  const draggingRef=useRef(false);

  useEffect(()=>{ setLocalAvance(obra.avance); },[obra.avance]);
  useEffect(()=>{ localAvanceRef.current=localAvance; },[localAvance]);

  const calcPct=useCallback((clientX)=>{
    if(!barRef.current)return 0;
    const rect=barRef.current.getBoundingClientRect();
    return Math.round(Math.min(Math.max((clientX-rect.left)/rect.width*100,0),100));
  },[]);

  // FIX: handlers estables con refs → no stale closure
  const onBarMove=useCallback((ev)=>{
    if(!draggingRef.current)return;
    setLocalAvance(calcPct(ev.touches?ev.touches[0].clientX:ev.clientX));
  },[calcPct]);

  const onBarEnd=useCallback(()=>{
    if(!draggingRef.current)return;
    draggingRef.current=false;
    setDragging(false);
    setObras(prev=>prev.map(o=>o.id===obra.id?{...o,avance:localAvanceRef.current}:o));
  },[obra.id,setObras]);

  const onBarStart=(ev)=>{
    ev.preventDefault();
    draggingRef.current=true;
    setDragging(true);
    setLocalAvance(calcPct(ev.touches?ev.touches[0].clientX:ev.clientX));
  };

  // FIX: efecto solo corre cuando dragging cambia, no en cada movimiento
  useEffect(()=>{
    if(!dragging)return;
    window.addEventListener("mousemove",onBarMove);
    window.addEventListener("mouseup",onBarEnd);
    window.addEventListener("touchmove",onBarMove,{passive:false});
    window.addEventListener("touchend",onBarEnd);
    return()=>{
      window.removeEventListener("mousemove",onBarMove);
      window.removeEventListener("mouseup",onBarEnd);
      window.removeEventListener("touchmove",onBarMove);
      window.removeEventListener("touchend",onBarEnd);
    };
  },[dragging,onBarMove,onBarEnd]);

  const inv=obra.inventario||[], movs=obra.movimientos||[];
  const i=getI(obra),e=getE(obra),invTotal=inv.reduce((s,it)=>s+it.subtotal,0);
  const pctUsado=obra.presupuesto>0?(e/obra.presupuesto)*100:0;
  const CAT_COLORS=["#7C3AED","#C2440A","#1557A0","#059669","#D97706","#DC2626","#6B7280"];

  const cambiarEstado=s=>{setObras(prev=>prev.map(o=>o.id===obra.id?{...o,estado:s}:o));setShowEstados(false);};
  const guardarMov=()=>{
    if(!movForm.concepto||!movForm.monto){setMovErr("Completa concepto y monto.");return;}
    const monto=parseFloat(String(movForm.monto).replace(/,/g,""));
    if(isNaN(monto)||monto<=0){setMovErr("Monto inválido.");return;}
    setObras(prev=>prev.map(o=>o.id===obra.id?{...o,movimientos:[...o.movimientos,{id:Date.now(),concepto:movForm.concepto,tipo:movForm.tipo,monto,fecha:movForm.fecha,notas:movForm.notas,registrado:now()}]}:o));
    setMovForm(f=>({...f,show:false,concepto:"",monto:"",fecha:new Date().toISOString().slice(0,10),notas:""}));
    setMovErr("");
  };
  const abrirMov=(tipo)=>{ setMovForm({show:true,tipo,concepto:"",monto:"",fecha:new Date().toISOString().slice(0,10),notas:""}); setMovErr(""); setShowEstados(false); };

  const movPorMes=(()=>{
    const map={};
    movs.forEach(m=>{
      const key=(m.fecha||"").slice(0,7)||"Sin fecha";
      if(!map[key])map[key]={mes:key,ingresos:0,egresos:0};
      if(m.tipo==="ingreso")map[key].ingresos+=m.monto; else map[key].egresos+=m.monto;
    });
    return Object.values(map).sort((a,b)=>a.mes.localeCompare(b.mes)).map(r=>({
      ...r,mes:r.mes.length===7?new Date(r.mes+"-01").toLocaleDateString("es-MX",{month:"short",year:"2-digit"}):r.mes
    }));
  })();

  const porCat=(()=>{
    const map={};
    inv.forEach(it=>{map[it.categoria]=(map[it.categoria]||0)+it.subtotal;});
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}));
  })();

  return(
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh",background:"#F5F6FA"}}>
      <div style={{background:co.bg,padding:"16px 20px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.18)",border:"none",borderRadius:20,padding:"5px 12px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:14,display:"inline-flex",alignItems:"center",gap:5}}>← Volver</button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:18,fontWeight:700,color:"#fff",lineHeight:1.2}}>{obra.nombre}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.75)",marginTop:4}}>{obra.cliente}</div>
            <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
              {obra.inicio&&<span style={{fontSize:10,color:"rgba(255,255,255,.7)"}}>Inicio: {obra.inicio}</span>}
              {obra.fin&&<span style={{fontSize:10,color:"rgba(255,255,255,.7)"}}>· Fin: {obra.fin}</span>}
            </div>
          </div>
          <button onClick={()=>{setShowEstados(!showEstados);setMovForm(f=>({...f,show:false}));}} style={{background:"none",border:"none",cursor:"pointer",padding:0,flexShrink:0}}>
            <Badge text={obra.estado}/>
          </button>
        </div>
        {showEstados&&(
          <div style={{marginTop:12,background:"rgba(255,255,255,0.95)",borderRadius:14,padding:"12px 14px"}}>
            <div style={{fontSize:11,color:"#6B7280",fontWeight:600,marginBottom:8}}>Cambiar estado</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {ESTADOS.map(s=><button key={s} onClick={()=>cambiarEstado(s)} style={{padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:"none",background:s===obra.estado?co.color:"#F3F4F6",color:s===obra.estado?"#fff":"#374151"}}>{s}</button>)}
            </div>
          </div>
        )}
        <div style={{marginTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,.75)",marginBottom:5}}>
            <span>{T(co).AvanceObra} <span style={{fontSize:9,opacity:.7}}>(arrastra para editar)</span></span>
            <span style={{fontWeight:700,color:"#fff",fontSize:14}}>{localAvance}%</span>
          </div>
          <div ref={barRef} onMouseDown={onBarStart} onTouchStart={onBarStart}
            style={{height:16,background:"rgba(255,255,255,.25)",borderRadius:99,overflow:"visible",cursor:"pointer",position:"relative",userSelect:"none",touchAction:"none"}}>
            <div style={{height:"100%",width:`${localAvance}%`,background:"#fff",borderRadius:99,transition:dragging?"none":"width .2s"}}/>
            <div style={{position:"absolute",top:"50%",left:`${localAvance}%`,transform:"translate(-50%,-50%)",width:22,height:22,borderRadius:"50%",background:"#fff",boxShadow:"0 2px 8px rgba(0,0,0,0.25)",border:`3px solid ${co.color}`,cursor:"grab",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:co.color}}/>
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:"14px 16px 0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <button onClick={()=>abrirMov("ingreso")} style={{background:"#F0FDF4",color:"#059669",border:"1.5px solid #BBF7D0",borderRadius:12,padding:"11px",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><ArrowUpCircle size={14}/> + Ingreso</button>
        <button onClick={()=>abrirMov("egreso")}  style={{background:"#FEF2F2",color:"#DC2626",border:"1.5px solid #FECACA",borderRadius:12,padding:"11px",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><ArrowDownCircle size={14}/> + Egreso</button>
      </div>

      {movForm.show&&(
        <div style={{margin:"10px 16px 0",background:movForm.tipo==="ingreso"?"#F0FDF4":"#FEF2F2",borderRadius:16,padding:"14px",border:`1.5px solid ${movForm.tipo==="ingreso"?"#BBF7D0":"#FECACA"}`,display:"flex",flexDirection:"column",gap:9}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:13,fontWeight:700,color:movForm.tipo==="ingreso"?"#059669":"#DC2626"}}>{movForm.tipo==="ingreso"?"Registrar Ingreso":"Registrar Egreso"}</div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {["ingreso","egreso"].map(t=>(
                <button key={t} onClick={()=>setMovForm(f=>({...f,tipo:t}))} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:"none",background:movForm.tipo===t?(t==="ingreso"?"#059669":"#DC2626"):"rgba(0,0,0,0.06)",color:movForm.tipo===t?"#fff":"#6B7280"}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
              ))}
              <button onClick={()=>setMovForm(f=>({...f,show:false}))} style={{background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",display:"flex",padding:0}}><X size={15}/></button>
            </div>
          </div>
          <input placeholder="Concepto *" value={movForm.concepto} onChange={e=>setMovForm(f=>({...f,concepto:e.target.value}))} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",background:"#fff"}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <input placeholder="Monto ($) *" value={movForm.monto} onChange={e=>setMovForm(f=>({...f,monto:e.target.value}))} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",background:"#fff"}}/>
            <input type="date" value={movForm.fecha} onChange={e=>setMovForm(f=>({...f,fecha:e.target.value}))} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 10px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",background:"#fff"}}/>
          </div>
          <textarea placeholder="Notas opcionales…" value={movForm.notas} onChange={e=>setMovForm(f=>({...f,notas:e.target.value}))} rows={2} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit",background:"#fff"}}/>
          {movErr&&<div style={{fontSize:11,color:"#DC2626",background:"#FEF2F2",padding:"6px 10px",borderRadius:8}}>{movErr}</div>}
          <button onClick={guardarMov} style={{background:movForm.tipo==="ingreso"?"#059669":"#DC2626",color:"#fff",border:"none",borderRadius:10,padding:"11px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Guardar {movForm.tipo}</button>
        </div>
      )}

      <div style={{padding:"14px 16px 0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[["Presupuesto",fmt(obra.presupuesto),"#374151","#F9FAFB"],["Ingresos",fmt(i),"#059669","#F0FDF4"],["Egresos",fmt(e),"#DC2626","#FEF2F2"],["Utilidad",fmt(getU(i,e)),getU(i,e)>=0?"#059669":"#DC2626",getU(i,e)>=0?"#F0FDF4":"#FEF2F2"],["Margen",pct(getM(i,e)),getM(i,e)>=20?"#059669":getM(i,e)>=10?"#D97706":"#DC2626","#fff"],["Inventario",fmt(invTotal),"#7C3AED","#F5F3FF"]].map(([l,v,c,bg])=>(
          <div key={l} style={{background:bg,borderRadius:14,padding:"12px 14px",border:"1px solid #F0F0F0"}}>
            <div style={{fontSize:10,color:"#9CA3AF",marginBottom:4,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{l}</div>
            <div style={{fontSize:16,fontWeight:700,color:c,lineHeight:1}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{margin:"12px 16px 0",background:"#fff",borderRadius:14,padding:"12px 14px",border:"1px solid #F0F0F0"}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6B7280",marginBottom:6}}>
          <span>Presupuesto consumido</span>
          <span style={{fontWeight:700,color:pctUsado>=100?"#DC2626":pctUsado>=80?"#D97706":"#059669"}}>{pctUsado.toFixed(1)}%</span>
        </div>
        <div style={{height:10,background:"#F3F4F6",borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.min(pctUsado,100)}%`,background:pctUsado>=100?"#DC2626":pctUsado>=80?"#D97706":"#059669",borderRadius:99}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#9CA3AF",marginTop:4}}>
          <span>Egresos: {fmt(e)}</span><span>Presupuesto: {fmt(obra.presupuesto)}</span>
        </div>
      </div>

      <div style={{padding:"14px 16px 0"}}>
        <div style={{display:"flex",gap:4,background:"#F3F4F6",borderRadius:12,padding:4}}>
          {[["resumen","Resumen"],["movimientos",`Movs${movs.length>0?" ("+movs.length+")":""}`],["inventario",`Inv${inv.length>0?" ("+inv.length+")":""}`]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"8px 4px",borderRadius:9,fontSize:11,fontWeight:600,cursor:"pointer",border:"none",background:tab===k?"#fff":"transparent",color:tab===k?"#111":"#9CA3AF",boxShadow:tab===k?"0 1px 4px rgba(0,0,0,0.08)":"none",whiteSpace:"nowrap"}}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"14px 16px 40px",display:"flex",flexDirection:"column",gap:14}}>
        {tab==="resumen"&&(
          <>
            {movPorMes.length>0?(
              <div style={{background:"#fff",borderRadius:16,padding:"16px 16px 8px",border:"1px solid #F0F0F0"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#111",marginBottom:14}}>Flujo financiero</div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={movPorMes} margin={{top:4,right:4,left:-28,bottom:0}}>
                    <defs>
                      <linearGradient id="gradI" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#059669" stopOpacity={0.25}/><stop offset="100%" stopColor="#059669" stopOpacity={0}/></linearGradient>
                      <linearGradient id="gradE" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={0.2}/><stop offset="100%" stopColor="#EF4444" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="#F3F4F6" vertical={false}/>
                    <XAxis dataKey="mes" tick={{fontSize:10,fill:"#9CA3AF"}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:9,fill:"#9CA3AF"}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1e6).toFixed(1)}M`}/>
                    <Tooltip contentStyle={{background:"#1F2937",border:"none",borderRadius:10,padding:"10px 14px"}} labelStyle={{color:"#fff",fontSize:11,fontWeight:700,marginBottom:6}} itemStyle={{fontSize:11,fontWeight:600,padding:"1px 0"}} formatter={(v,n)=>[fmt(v),n==="ingresos"?"Ingreso":"Egreso"]} cursor={{stroke:"rgba(255,255,255,0.08)",strokeWidth:1}}/>
                    <Area type="monotone" dataKey="ingresos" stroke="#059669" strokeWidth={2.5} fill="url(#gradI)" dot={false} activeDot={{r:5,fill:"#059669",strokeWidth:0}} name="ingresos"/>
                    <Area type="monotone" dataKey="egresos"  stroke="#EF4444" strokeWidth={2.5} fill="url(#gradE)" dot={false} activeDot={{r:5,fill:"#EF4444",strokeWidth:0}} name="egresos"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ):(
              <div style={{background:"#fff",borderRadius:16,padding:"28px 16px",border:"1px solid #F0F0F0",textAlign:"center",color:"#9CA3AF",fontSize:12}}>
                Sin movimientos para graficar.<br/>
                <button onClick={()=>abrirMov("ingreso")} style={{marginTop:10,background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer"}}>+ Agregar primer movimiento</button>
              </div>
            )}
            {porCat.length>0&&(
              <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1px solid #F0F0F0"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:12}}>Gasto de inventario por categoría</div>
                {porCat.map(({name,value},idx)=>{
                  const p=invTotal>0?(value/invTotal)*100:0;
                  return(
                    <div key={name} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#374151",marginBottom:4}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:10,height:10,borderRadius:3,background:CAT_COLORS[idx%CAT_COLORS.length],flexShrink:0}}/><span>{name}</span></div>
                        <span style={{fontWeight:700,color:CAT_COLORS[idx%CAT_COLORS.length]}}>{fmt(value)} <span style={{color:"#9CA3AF",fontWeight:400}}>({p.toFixed(0)}%)</span></span>
                      </div>
                      <div style={{height:7,background:"#F3F4F6",borderRadius:99,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${p}%`,background:CAT_COLORS[idx%CAT_COLORS.length],borderRadius:99}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1px solid #F0F0F0"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:600,color:"#374151"}}>Últimos movimientos</div>
                {movs.length>0&&<button onClick={()=>setTab("movimientos")} style={{background:"none",border:"none",fontSize:11,color:co.color,fontWeight:600,cursor:"pointer",padding:0}}>Ver todos →</button>}
              </div>
              {[...movs].reverse().slice(0,5).map(m=>(
                <div key={m.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderBottom:"1px solid #F9FAFB"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:m.tipo==="ingreso"?"#D1FAE5":"#FEE2E2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                    {m.tipo==="ingreso"?<ArrowUpCircle size={13} color="#059669"/>:<ArrowDownCircle size={13} color="#DC2626"/>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,color:"#374151",fontWeight:500}}>{m.concepto}</div>
                    {m.notas&&<div style={{fontSize:10,color:"#6B7280",fontStyle:"italic",marginTop:1}}>"{m.notas}"</div>}
                    <div style={{fontSize:10,color:"#9CA3AF",marginTop:1}}>{m.fecha||m.registrado}</div>
                  </div>
                  <div style={{fontSize:12,fontWeight:700,color:m.tipo==="ingreso"?"#059669":"#DC2626",flexShrink:0}}>{fmt(m.monto)}</div>
                </div>
              ))}
              {movs.length===0&&<div style={{textAlign:"center",padding:"16px 0",color:"#9CA3AF",fontSize:12}}>Sin movimientos aún</div>}
            </div>
          </>
        )}
        {tab==="movimientos"&&(
          <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1px solid #F0F0F0"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              <div style={{background:"#F0FDF4",borderRadius:11,padding:"10px 12px"}}><div style={{fontSize:10,color:"#6B7280"}}>Total ingresos</div><div style={{fontSize:14,fontWeight:700,color:"#059669",marginTop:2}}>{fmt(i)}</div></div>
              <div style={{background:"#FEF2F2",borderRadius:11,padding:"10px 12px"}}><div style={{fontSize:10,color:"#6B7280"}}>Egresos (sin inventario)</div><div style={{fontSize:14,fontWeight:700,color:"#DC2626",marginTop:2}}>{fmt(e-invTotal)}</div></div>
            </div>
            {movs.length===0&&<div style={{textAlign:"center",padding:"28px 0",color:"#9CA3AF",fontSize:12}}>Sin movimientos.<br/><button onClick={()=>{setTab("resumen");abrirMov("ingreso");}} style={{marginTop:10,background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:600,cursor:"pointer"}}>+ Agregar</button></div>}
            {[...movs].reverse().map(m=>(
              <div key={m.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:"1px solid #F9FAFB"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:m.tipo==="ingreso"?"#D1FAE5":"#FEE2E2",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                  {m.tipo==="ingreso"?<ArrowUpCircle size={14} color="#059669"/>:<ArrowDownCircle size={14} color="#DC2626"/>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#111"}}>{m.concepto}</div>
                  {m.notas&&<div style={{fontSize:11,color:"#6B7280",fontStyle:"italic",marginTop:2}}>"{m.notas}"</div>}
                  <div style={{fontSize:10,color:"#9CA3AF",marginTop:1}}>{m.fecha}{m.registrado?` · ${m.registrado}`:""}</div>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:m.tipo==="ingreso"?"#059669":"#DC2626",flexShrink:0}}>{fmt(m.monto)}</div>
              </div>
            ))}
          </div>
        )}
        {tab==="inventario"&&<InventarioPanel obra={obra} setObras={setObras} co={co} canEdit={true}/>}
      </div>
    </div>
  );
}

// ── OBRAS ADMIN ───────────────────────────────────────────────────────────────
function ObrasAdmin({obras,setObras,co}){
  const [detalleId,setDetalleId]=useState(null);
  const [editStatus,setEditStatus]=useState(null);
  const [confirmDel,setConfirmDel]=useState(null);
  const [newForm,setNewForm]=useState(false);
  const [obraForm,setObraForm]=useState({nombre:"",cliente:"",presupuesto:"",inicio:"",fin:"",estado:"En progreso"});
  const [err,setErr]=useState("");

  // FIX: evitar setState durante render → useEffect
  useEffect(()=>{
    if(detalleId&&!obras.find(o=>o.id===detalleId)) setDetalleId(null);
  },[detalleId,obras]);

  const saveObra=()=>{
    if(!obraForm.nombre||!obraForm.cliente||!obraForm.presupuesto){setErr("Nombre, cliente y presupuesto son obligatorios.");return;}
    const p=parseFloat(String(obraForm.presupuesto).replace(/,/g,""));
    if(isNaN(p)||p<=0){setErr("Presupuesto inválido.");return;}
    setObras(prev=>[...prev,{id:Date.now(),...obraForm,presupuesto:p,avance:0,movimientos:[],inventario:[]}]);
    setNewForm(false);setObraForm({nombre:"",cliente:"",presupuesto:"",inicio:"",fin:"",estado:"En progreso"});setErr("");
  };

  if(detalleId){
    const obra=obras.find(o=>o.id===detalleId);
    if(!obra)return null; // useEffect limpiará el ID
    return <ObraDetalleView obra={obra} setObras={setObras} co={co} onBack={()=>setDetalleId(null)}/>;
  }

  return(
    <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:17,fontWeight:700,color:"#111"}}>{T(co).ObrasProyectos}</div>
        <button onClick={()=>{setNewForm(!newForm);setErr("");}} style={{background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><Plus size={13}/> Nueva {T(co).obra}</button>
      </div>
      {newForm&&(
        <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1.5px solid "+co.color,display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:13,fontWeight:600,color:"#374151"}}>Nueva {T(co).obra}</div>
          {[["nombre",T(co).NombreObra,"text"],["cliente","Cliente","text"],["presupuesto","Presupuesto ($)","text"],["inicio","Fecha inicio","date"],["fin","Fecha fin","date"]].map(([k,ph,t])=>(
            <input key={k} type={t} placeholder={ph} value={obraForm[k]} onChange={e=>setObraForm({...obraForm,[k]:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          ))}
          <select value={obraForm.estado} onChange={e=>setObraForm({...obraForm,estado:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none"}}>{ESTADOS.map(s=><option key={s}>{s}</option>)}</select>
          {err&&<div style={{fontSize:12,color:"#DC2626",background:"#FEF2F2",padding:"8px 12px",borderRadius:8}}>{err}</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={saveObra} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{T(co).GuardarObra}</button>
            <button onClick={()=>{setNewForm(false);setErr("");}} style={{padding:"10px 16px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff",fontSize:13,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
          </div>
        </div>
      )}
      {obras.map(o=>{
        const i=getI(o),e=getE(o),invTotal=(o.inventario||[]).reduce((s,it)=>s+it.subtotal,0);
        return(
          <div key={o.id} style={{background:"#fff",borderRadius:16,padding:"14px 16px",border:"1px solid #F0F0F0",cursor:"pointer"}} onClick={()=>setDetalleId(o.id)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{flex:1,paddingRight:8}}><div style={{fontSize:13,fontWeight:600,color:"#111"}}>{o.nombre}</div><div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>{o.cliente}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:6}} onClick={ev=>ev.stopPropagation()}>
                <button onClick={()=>setEditStatus(editStatus===o.id?null:o.id)} style={{background:"none",border:"none",cursor:"pointer",padding:0}}><Badge text={o.estado}/></button>
                <button onClick={()=>setConfirmDel(confirmDel===o.id?null:o.id)} style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"4px 7px",cursor:"pointer",display:"flex"}}><X size={13} color="#DC2626"/></button>
              </div>
            </div>
            {editStatus===o.id&&(
              <div style={{marginBottom:10,padding:"10px 12px",background:"#F9FAFB",borderRadius:12}} onClick={ev=>ev.stopPropagation()}>
                <div style={{fontSize:11,color:"#6B7280",marginBottom:8,fontWeight:600}}>Cambiar estado</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {ESTADOS.map(s=><button key={s} onClick={()=>{setObras(prev=>prev.map(x=>x.id===o.id?{...x,estado:s}:x));setEditStatus(null);}} style={{padding:"5px 11px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:s===o.estado?"none":"1px solid #E5E7EB",background:s===o.estado?co.color:"#fff",color:s===o.estado?"#fff":"#374151"}}>{s}</button>)}
                </div>
              </div>
            )}
            {confirmDel===o.id&&(
              <div style={{marginBottom:10,background:"#FEF2F2",borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}} onClick={ev=>ev.stopPropagation()}>
                <span style={{fontSize:12,color:"#DC2626",fontWeight:500}}>{T(co).EliminarObra}</span>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{setObras(prev=>prev.filter(x=>x.id!==o.id));setConfirmDel(null);}} style={{background:"#DC2626",color:"#fff",border:"none",borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Eliminar</button>
                  <button onClick={()=>setConfirmDel(null)} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
                </div>
              </div>
            )}
            <div style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#9CA3AF",marginBottom:4}}><span>Avance</span><span style={{fontWeight:600,color:"#374151"}}>{o.avance}%</span></div>
              <ProgressBar value={o.avance} color={co.color}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,textAlign:"center"}}>
              {[["Presupuesto",fmt(o.presupuesto),"#374151"],["Utilidad",fmt(getU(i,e)),getU(i,e)>=0?"#059669":"#DC2626"],["Margen",pct(getM(i,e)),getM(i,e)>=20?"#059669":getM(i,e)>=10?"#D97706":"#DC2626"],["Inventario",fmt(invTotal),"#7C3AED"]].map(([l,v,c])=>(
                <div key={l} style={{background:"#F9FAFB",borderRadius:10,padding:"8px 4px"}}><div style={{fontSize:10,color:"#9CA3AF",marginBottom:3}}>{l}</div><div style={{fontSize:11,fontWeight:700,color:c,wordBreak:"break-all"}}>{v}</div></div>
              ))}
            </div>
            <div style={{marginTop:10,fontSize:11,color:co.color,fontWeight:600,textAlign:"right"}}>Ver detalle →</div>
          </div>
        );
      })}
    </div>
  );
}

// ── OBRAS ADMINISTRATIVO ──────────────────────────────────────────────────────
function ObrasAdministrativo({obras,setObras,co}){
  const [detalleId,setDetalleId]=useState(null);
  const [movForm,setMovForm]=useState({obraId:null,tipo:"ingreso",concepto:"",monto:"",fecha:new Date().toISOString().slice(0,10),notas:""});
  const [obraForm,setObraForm]=useState({nombre:"",cliente:"",presupuesto:"",inicio:"",fin:"",estado:"En progreso"});
  const [newObraForm,setNewObraForm]=useState(false);
  const [err,setErr]=useState("");

  // FIX: evitar setState durante render
  useEffect(()=>{
    if(detalleId&&!obras.find(o=>o.id===detalleId)) setDetalleId(null);
  },[detalleId,obras]);

  const openMov=(o,tipo,ev)=>{ ev.stopPropagation(); setMovForm({obraId:o.id,tipo,concepto:"",monto:"",fecha:new Date().toISOString().slice(0,10),notas:""}); };
  const saveMov=()=>{
    if(!movForm.concepto||!movForm.monto){setErr("Completa concepto y monto.");return;}
    const monto=parseFloat(String(movForm.monto).replace(/,/g,""));
    if(isNaN(monto)||monto<=0){setErr("Monto inválido.");return;}
    setObras(prev=>prev.map(o=>o.id===movForm.obraId?{...o,movimientos:[...o.movimientos,{id:Date.now(),concepto:movForm.concepto,tipo:movForm.tipo,monto,fecha:movForm.fecha,notas:movForm.notas,registrado:now()}]}:o));
    setErr("");setMovForm(f=>({...f,obraId:null}));
  };
  const saveObra=()=>{
    if(!obraForm.nombre||!obraForm.cliente||!obraForm.presupuesto){setErr("Nombre, cliente y presupuesto son obligatorios.");return;}
    const p=parseFloat(String(obraForm.presupuesto).replace(/,/g,""));
    if(isNaN(p)||p<=0){setErr("Presupuesto inválido.");return;}
    setObras(prev=>[...prev,{id:Date.now(),...obraForm,presupuesto:p,avance:0,movimientos:[],inventario:[]}]);
    setNewObraForm(false);setObraForm({nombre:"",cliente:"",presupuesto:"",inicio:"",fin:"",estado:"En progreso"});setErr("");
  };

  if(detalleId){
    const obra=obras.find(o=>o.id===detalleId);
    if(!obra)return null;
    return <ObraDetalleView obra={obra} setObras={setObras} co={co} onBack={()=>setDetalleId(null)}/>;
  }

  return(
    <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:17,fontWeight:700,color:"#111"}}>{T(co).Obras}</div>
        <button onClick={()=>{setNewObraForm(!newObraForm);setErr("");}} style={{background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><Plus size={13}/> Nueva {T(co).obra}</button>
      </div>
      {newObraForm&&(
        <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1.5px solid "+co.color,display:"flex",flexDirection:"column",gap:10}}>
          {[["nombre",T(co).NombreObra,"text"],["cliente","Cliente","text"],["presupuesto","Presupuesto ($)","text"],["inicio","Fecha inicio","date"],["fin","Fecha fin","date"]].map(([k,ph,t])=>(
            <input key={k} type={t} placeholder={ph} value={obraForm[k]} onChange={e=>setObraForm({...obraForm,[k]:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          ))}
          <select value={obraForm.estado} onChange={e=>setObraForm({...obraForm,estado:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none"}}>{ESTADOS.map(s=><option key={s}>{s}</option>)}</select>
          {err&&<div style={{fontSize:12,color:"#DC2626",background:"#FEF2F2",padding:"8px 12px",borderRadius:8}}>{err}</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={saveObra} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>{T(co).GuardarObra}</button>
            <button onClick={()=>{setNewObraForm(false);setErr("");}} style={{padding:"10px 16px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff",fontSize:13,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
          </div>
        </div>
      )}
      {obras.map(o=>{
        const showMov=movForm.obraId===o.id;
        const invTotal=(o.inventario||[]).reduce((s,it)=>s+it.subtotal,0);
        return(
          <div key={o.id} style={{background:"#fff",borderRadius:16,padding:"14px 16px",border:"1px solid #F0F0F0",cursor:"pointer"}} onClick={()=>setDetalleId(o.id)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{flex:1,paddingRight:8}}><div style={{fontSize:13,fontWeight:600,color:"#111"}}>{o.nombre}</div><div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>{o.cliente}</div></div>
              <Badge text={o.estado}/>
            </div>
            <div style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#9CA3AF",marginBottom:4}}><span>Avance</span><span style={{fontWeight:600,color:"#374151"}}>{o.avance}%</span></div>
              <ProgressBar value={o.avance} color={co.color}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <div style={{background:"#F9FAFB",borderRadius:10,padding:"8px",textAlign:"center"}}><div style={{fontSize:10,color:"#9CA3AF",marginBottom:2}}>Presupuesto</div><div style={{fontSize:11,fontWeight:700,color:"#374151"}}>{fmt(o.presupuesto)}</div></div>
              <div style={{background:"#F9FAFB",borderRadius:10,padding:"8px",textAlign:"center"}}><div style={{fontSize:10,color:"#9CA3AF",marginBottom:2}}>Movimientos</div><div style={{fontSize:11,fontWeight:700,color:"#374151"}}>{o.movimientos.length}</div></div>
              <div style={{background:"#F9FAFB",borderRadius:10,padding:"8px",textAlign:"center"}}><div style={{fontSize:10,color:"#9CA3AF",marginBottom:2}}>Inventario</div><div style={{fontSize:11,fontWeight:700,color:"#7C3AED"}}>{fmt(invTotal)}</div></div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:10}} onClick={ev=>ev.stopPropagation()}>
              <button onClick={ev=>openMov(o,"ingreso",ev)} style={{flex:1,background:"#F0FDF4",color:"#059669",border:"1px solid #BBF7D0",borderRadius:10,padding:"8px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><ArrowUpCircle size={13}/> + Ingreso</button>
              <button onClick={ev=>openMov(o,"egreso",ev)}  style={{flex:1,background:"#FEF2F2",color:"#DC2626",border:"1px solid #FECACA",borderRadius:10,padding:"8px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><ArrowDownCircle size={13}/> + Egreso</button>
            </div>
            {showMov&&(
              <div style={{marginTop:12,background:movForm.tipo==="ingreso"?"#F0FDF4":"#FEF2F2",borderRadius:12,padding:"12px",display:"flex",flexDirection:"column",gap:8}} onClick={ev=>ev.stopPropagation()}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div style={{fontSize:12,fontWeight:600,color:movForm.tipo==="ingreso"?"#059669":"#DC2626"}}>{movForm.tipo==="ingreso"?"Registrar Ingreso":"Registrar Egreso"}</div>
                  <button onClick={()=>setMovForm(f=>({...f,obraId:null}))} style={{background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",display:"flex",padding:0}}><X size={14}/></button>
                </div>
                <input placeholder="Concepto" value={movForm.concepto} onChange={e=>setMovForm({...movForm,concepto:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
                <input placeholder="Monto ($)" value={movForm.monto} onChange={e=>setMovForm({...movForm,monto:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
                <input type="date" value={movForm.fecha} onChange={e=>setMovForm({...movForm,fecha:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
                <textarea placeholder="Notas opcionales…" value={movForm.notas} onChange={e=>setMovForm({...movForm,notas:e.target.value})} rows={2} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}}/>
                {err&&<div style={{fontSize:11,color:"#DC2626"}}>{err}</div>}
                <button onClick={saveMov} style={{background:movForm.tipo==="ingreso"?"#059669":"#DC2626",color:"#fff",border:"none",borderRadius:8,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Guardar {movForm.tipo}</button>
              </div>
            )}
            <div style={{marginTop:10,fontSize:11,color:co.color,fontWeight:600,textAlign:"right"}}>Ver detalle →</div>
          </div>
        );
      })}
    </div>
  );
}

// ── FINANZAS ──────────────────────────────────────────────────────────────────
function FinanzasView({co,obras,cuentas}){
  const [tab,setTab]=useState("obras");
  const [desdeObra,setDesdeObra]=useState(""),[hastaObra,setHastaObra]=useState("");
  const [desdeCaja,setDesdeCaja]=useState(""),[hastaCaja,setHastaCaja]=useState("");

  const inRangoObra=f=>{
    if(!f)return true;
    const d=new Date(f);
    if(desdeObra&&d<new Date(desdeObra))return false;
    if(hastaObra&&d>new Date(hastaObra+"T23:59:59"))return false;
    return true;
  };
  // FIX: usar fechaISO (formato YYYY-MM-DD guardado en abrir()) para que sea válido en todos los navegadores
  const inRangoCaja=isoFecha=>{
    if(!isoFecha)return true;
    const d=new Date(isoFecha);
    if(isNaN(d))return true;
    if(desdeCaja&&d<new Date(desdeCaja))return false;
    if(hastaCaja&&d>new Date(hastaCaja+"T23:59:59"))return false;
    return true;
  };

  const cajasVisibles=cuentas.filter(c=>inRangoCaja(c.fechaISO||c.fecha));
  const totalCajasI=cajasVisibles.reduce((s,c)=>(c.movimientos||[]).filter(m=>m.tipo==="ingreso").reduce((a,m)=>a+m.monto,s),0);
  const totalCajasE=cajasVisibles.reduce((s,c)=>(c.movimientos||[]).filter(m=>m.tipo==="egreso").reduce((a,m)=>a+m.monto,s),0);
  const obrasFiltradas=obras.map(o=>({...o,movimientos:(o.movimientos||[]).filter(m=>inRangoObra(m.fecha))}));
  const ti=obrasFiltradas.reduce((s,o)=>s+getI(o),0), te=obrasFiltradas.reduce((s,o)=>s+getE(o),0);

  return(
    <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontSize:17,fontWeight:700,color:"#111"}}>Finanzas</div>
      <div style={{display:"flex",gap:6,background:"#F3F4F6",borderRadius:12,padding:4}}>
        {[{id:"obras",label:`Por ${T(co).Obra}`},{id:"cajas",label:"Cajas"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"7px 4px",borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer",border:"none",background:tab===t.id?"#fff":"transparent",color:tab===t.id?"#111":"#9CA3AF",boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,0.08)":"none"}}>{t.label}</button>
        ))}
      </div>
      {tab==="obras"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <FiltroFecha desde={desdeObra} setDesde={setDesdeObra} hasta={hastaObra} setHasta={setHastaObra}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[["Total ingresado",fmt(ti),"#059669"],["Total egresado",fmt(te),"#DC2626"],["Utilidad total",fmt(getU(ti,te)),"#8B5CF6"]].map(([l,v,c])=>(
              <div key={l} style={{background:"#fff",borderRadius:12,padding:"10px 8px",border:"1px solid #F0F0F0",textAlign:"center"}}><div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:9,color:"#9CA3AF",marginTop:2}}>{l}</div></div>
            ))}
          </div>
          {obrasFiltradas.map(o=>{
            const i=getI(o),e=getE(o),mg=getM(i,e);
            return(
              <div key={o.id} style={{background:"#fff",borderRadius:14,padding:"12px 14px",border:"1px solid #F0F0F0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div><div style={{fontSize:13,fontWeight:600,color:"#111"}}>{o.nombre}</div><div style={{fontSize:11,color:"#9CA3AF",marginTop:1}}>{o.cliente}</div></div>
                  <span style={{fontSize:11,fontWeight:700,color:mg>=20?"#059669":mg>=10?"#D97706":"#9CA3AF"}}>{pct(mg)}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,textAlign:"center"}}>
                  {[["Ingresos",fmt(i),"#059669"],["Egresos",fmt(e),"#DC2626"],["Utilidad",fmt(getU(i,e)),getU(i,e)>=0?"#8B5CF6":"#DC2626"]].map(([l,v,c])=>(
                    <div key={l} style={{background:"#F9FAFB",borderRadius:9,padding:"7px 4px"}}><div style={{fontSize:10,color:"#9CA3AF",marginBottom:2}}>{l}</div><div style={{fontSize:11,fontWeight:700,color:c,wordBreak:"break-all"}}>{v}</div></div>
                  ))}
                </div>
                {o.movimientos.length>0&&(
                  <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #F9FAFB"}}>
                    {o.movimientos.map(m=>(
                      <div key={m.id} style={{display:"flex",alignItems:"flex-start",gap:6,padding:"4px 0",borderBottom:"1px solid #F9FAFB"}}>
                        {m.tipo==="ingreso"?<ArrowUpCircle size={11} color="#059669"/>:<ArrowDownCircle size={11} color="#DC2626"/>}
                        <div style={{flex:1}}>
                          <div style={{fontSize:11,color:"#374151"}}>{m.concepto}</div>
                          {m.notas&&<div style={{fontSize:10,color:"#6B7280",fontStyle:"italic"}}>"{m.notas}"</div>}
                        </div>
                        <div style={{fontSize:11,color:"#9CA3AF",flexShrink:0}}>{m.fecha}</div>
                        <div style={{fontSize:11,fontWeight:600,color:m.tipo==="ingreso"?"#059669":"#DC2626",flexShrink:0}}>{fmt(m.monto)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {tab==="cajas"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <FiltroFecha desde={desdeCaja} setDesde={setDesdeCaja} hasta={hastaCaja} setHasta={setHastaCaja}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[[cajasVisibles.length,"Cajas",co.color],[fmt(totalCajasI),"Ingresos","#059669"],[fmt(totalCajasE),"Egresos","#DC2626"]].map(([v,l,c])=>(
              <div key={l} style={{background:"#fff",borderRadius:12,padding:"10px 8px",border:"1px solid #F0F0F0",textAlign:"center"}}><div style={{fontSize:12,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:9,color:"#9CA3AF",marginTop:2}}>{l}</div></div>
            ))}
          </div>
          {cuentas.length===0&&<div style={{textAlign:"center",padding:"32px 0",color:"#9CA3AF",fontSize:13}}>No hay cajas registradas aún</div>}
          {cajasVisibles.map(c=>{
            const movs=c.movimientos||[];
            const movI=movs.filter(m=>m.tipo==="ingreso").reduce((s,m)=>s+m.monto,0);
            const movE=movs.filter(m=>m.tipo==="egreso").reduce((s,m)=>s+m.monto,0);
            const totalContado=c.arqueo?Object.values(c.arqueo).reduce((s,v)=>s+(v.contado||0),0):(c.efectivoCierre||0);
            const totalEsperado=c.arqueo?Object.values(c.arqueo).reduce((s,v)=>s+(v.esperado||0),0):c.montoApertura;
            const diff=totalContado-totalEsperado;
            return(
              <div key={c.id} style={{background:"#fff",borderRadius:14,padding:"12px 14px",border:"1px solid #F0F0F0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div><div style={{fontSize:13,fontWeight:600,color:"#111"}}>{c.fecha}</div><div style={{fontSize:11,color:"#9CA3AF",marginTop:1}}>{c.horaApertura}{c.horaCierre?` → ${c.horaCierre}`:""}</div></div>
                  <span style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,background:c.estado==="abierta"?"#D1FAE5":"#F3F4F6",color:c.estado==="abierta"?"#065F46":"#374151"}}>{c.estado==="abierta"?"Abierta":"Cerrada"}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,textAlign:"center",marginBottom:8}}>
                  {[["Apertura",fmt(c.montoApertura),"#374151"],["Ingresos",fmt(movI),"#059669"],["Egresos",fmt(movE),"#DC2626"],["Contado",fmt(totalContado),"#111"]].map(([l,v,col])=>(
                    <div key={l} style={{background:"#F9FAFB",borderRadius:8,padding:"7px 4px"}}><div style={{fontSize:9,color:"#9CA3AF",marginBottom:2}}>{l}</div><div style={{fontSize:10,fontWeight:700,color:col,wordBreak:"break-all"}}>{v}</div></div>
                  ))}
                </div>
                {movs.length>0&&(
                  <div style={{borderTop:"1px solid #F9FAFB",paddingTop:8}}>
                    {movs.map(m=>(
                      <div key={m.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 0",borderBottom:"1px solid #F9FAFB"}}>
                        {m.tipo==="ingreso"?<ArrowUpCircle size={11} color="#059669"/>:<ArrowDownCircle size={11} color="#DC2626"/>}
                        <div style={{flex:1,fontSize:11,color:"#374151"}}>{m.concepto}</div>
                        <span style={{fontSize:9,fontWeight:600,padding:"1px 5px",borderRadius:8,background:m.metodo==="bancario"?"#DBEAFE":"#D1FAE5",color:m.metodo==="bancario"?"#1E40AF":"#065F46"}}>{m.metodo==="bancario"?"Banco":"Efectivo"}</span>
                        <div style={{fontSize:11,fontWeight:600,color:m.tipo==="ingreso"?"#059669":"#DC2626"}}>{fmt(m.monto)}</div>
                      </div>
                    ))}
                  </div>
                )}
                {c.estado==="cerrada"&&(
                  <div style={{marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",background:diff>=0?"#F0FDF4":"#FEF2F2",borderRadius:9}}>
                    <span style={{fontSize:11,color:"#6B7280"}}>Diferencia vs apertura</span>
                    <span style={{fontSize:12,fontWeight:700,color:diff>=0?"#059669":"#DC2626"}}>{diff>=0?"+":""}{fmt(diff)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── CAJA ─────────────────────────────────────────────────────────────────────
function CuentasView({cuentas,setCuentas,co,isAdmin}){
  const abierta=cuentas.find(c=>c.estado==="abierta");
  const [montoApertura,setMontoApertura]=useState("");
  const [arqueo,setArqueo]=useState({efectivo:"",transferencia:"",tarjeta:""});
  const [movForm,setMovForm]=useState({tipo:"ingreso",concepto:"",monto:"",metodo:"efectivo",notas:""});
  const [editMov,setEditMov]=useState(null);
  const [editMovForm,setEditMovForm]=useState({});
  const [err,setErr]=useState("");
  const [movErr,setMovErr]=useState("");

  // Calcula el saldo esperado por método al momento del cierre
  const calcEsperado=(movs,metodo)=>{
    // "bancario" es el key viejo — lo tratamos como "transferencia" para compatibilidad
    const match=m=>m.metodo===metodo||(metodo==="transferencia"&&m.metodo==="bancario");
    const ing=(movs||[]).filter(m=>m.tipo==="ingreso"&&match(m)).reduce((s,m)=>s+m.monto,0);
    const egr=(movs||[]).filter(m=>m.tipo==="egreso"&&match(m)).reduce((s,m)=>s+m.monto,0);
    const base=metodo==="efectivo"?(abierta?.montoApertura||0):0;
    return base+ing-egr;
  };

  const abrir=()=>{
    if(!montoApertura){setErr("Ingresa el monto de apertura.");return;}
    const monto=parseFloat(String(montoApertura).replace(/,/g,""));
    if(isNaN(monto)||monto<0){setErr("Monto inválido.");return;}
    const d=new Date();
    setCuentas(prev=>[{
      id:Date.now(),
      fecha:d.toLocaleDateString("es-MX",{day:"2-digit",month:"2-digit",year:"numeric"}),
      fechaISO:d.toISOString().slice(0,10),
      horaApertura:d.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"}),
      montoApertura:monto, estado:"abierta", arqueo:null, horaCierre:null, movimientos:[]
    },...prev]);
    setMontoApertura("");setErr("");
  };
  const cerrar=()=>{
    const d=new Date();
    const movs=abierta.movimientos||[];
    const arqueoFinal={
      efectivo:   { esperado:calcEsperado(movs,"efectivo"),    contado:parseFloat(String(arqueo.efectivo).replace(/,/g,""))||0 },
      transferencia:{ esperado:calcEsperado(movs,"transferencia"), contado:parseFloat(String(arqueo.transferencia).replace(/,/g,""))||0 },
      tarjeta:    { esperado:calcEsperado(movs,"tarjeta"),     contado:parseFloat(String(arqueo.tarjeta).replace(/,/g,""))||0 },
    };
    setCuentas(prev=>prev.map(c=>c.id===abierta.id?{...c,estado:"cerrada",arqueo:arqueoFinal,horaCierre:d.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}:c));
    setArqueo({efectivo:"",transferencia:"",tarjeta:""});
  };
  const addMov=()=>{
    if(!movForm.concepto||!movForm.monto){setMovErr("Completa concepto y monto.");return;}
    const monto=parseFloat(String(movForm.monto).replace(/,/g,""));
    if(isNaN(monto)||monto<=0){setMovErr("Monto inválido.");return;}
    setCuentas(prev=>prev.map(c=>c.id===abierta.id?{...c,movimientos:[...(c.movimientos||[]),{id:Date.now(),tipo:movForm.tipo,concepto:movForm.concepto,monto,metodo:movForm.metodo,notas:movForm.notas,registrado:now()}]}:c));
    setMovForm({tipo:movForm.tipo,concepto:"",monto:"",metodo:movForm.metodo,notas:""});setMovErr("");
  };
  const saveEditMov=()=>{
    const monto=parseFloat(String(editMovForm.monto).replace(/,/g,""));
    if(!editMovForm.concepto||isNaN(monto)||monto<=0)return;
    setCuentas(prev=>prev.map(c=>c.id===editMov.cajaId?{...c,movimientos:c.movimientos.map(m=>m.id===editMov.movId?{...m,...editMovForm,monto}:m)}:c));
    setEditMov(null);
  };
  // Estado para "Agregar nota" — roles sin permiso de edición
  const [notaMovId,setNotaMovId]=useState(null); // {cajaId, movId}
  const [notaTexto,setNotaTexto]=useState("");
  const saveNotaAdicional=()=>{
    if(!notaTexto.trim())return;
    const nuevaNota=notaMovId.notaAnterior
      ?`${notaMovId.notaAnterior}\n📌 ${now()}: ${notaTexto.trim()}`
      :`📌 ${now()}: ${notaTexto.trim()}`;
    setCuentas(prev=>prev.map(c=>c.id===notaMovId.cajaId?{
      ...c,movimientos:c.movimientos.map(m=>m.id===notaMovId.movId?{...m,notas:nuevaNota}:m)
    }:c));
    setNotaMovId(null);setNotaTexto("");
  };
  const metodoBadge=met=>{
    if(!met)return null;
    const map={
      efectivo:  {bg:"#D1FAE5",c:"#065F46",label:"Efectivo"},
      bancario:  {bg:"#DBEAFE",c:"#1E40AF",label:"Transf."},
      transferencia:{bg:"#DBEAFE",c:"#1E40AF",label:"Transf."},
      tarjeta:   {bg:"#EDE9FE",c:"#5B21B6",label:"Tarjeta"},
    };
    const s=map[met]||{bg:"#F3F4F6",c:"#374151",label:met};
    return <span style={{fontSize:9,fontWeight:600,padding:"2px 6px",borderRadius:10,background:s.bg,color:s.c}}>{s.label}</span>;
  };

  const MovRow=({m,cajaId})=>{
    const isEditing=editMov?.cajaId===cajaId&&editMov?.movId===m.id;
    const isAddingNota=notaMovId?.cajaId===cajaId&&notaMovId?.movId===m.id;
    if(isEditing) return(
      <div style={{background:"#F9FAFB",borderRadius:10,padding:"10px",margin:"6px 0",display:"flex",flexDirection:"column",gap:7}}>
        <div style={{display:"flex",gap:6}}>
          {["ingreso","egreso"].map(t=><button key={t} onClick={()=>setEditMovForm({...editMovForm,tipo:t})} style={{flex:1,padding:"6px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",border:"none",background:editMovForm.tipo===t?(t==="ingreso"?"#059669":"#DC2626"):"#fff",color:editMovForm.tipo===t?"#fff":"#374151",outline:editMovForm.tipo!==t?"1px solid #E5E7EB":"none"}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
        </div>
        <div style={{display:"flex",gap:6}}>
          {["efectivo","transferencia","tarjeta"].map(met=>{
            const labels={efectivo:"Efectivo",transferencia:"Transf.",tarjeta:"Tarjeta"};
            const activeColors={efectivo:"#059669",transferencia:"#1A73E8",tarjeta:"#7C3AED"};
            const active=editMovForm.metodo===met||(met==="transferencia"&&editMovForm.metodo==="bancario");
            return <button key={met} onClick={()=>setEditMovForm({...editMovForm,metodo:met})} style={{flex:1,padding:"6px",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",border:"none",background:active?activeColors[met]:"#fff",color:active?"#fff":"#374151",outline:!active?"1px solid #E5E7EB":"none"}}>{labels[met]}</button>;
          })}
        </div>
        <input value={editMovForm.concepto} onChange={e=>setEditMovForm({...editMovForm,concepto:e.target.value})} placeholder="Concepto" style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"7px 10px",fontSize:12,outline:"none"}}/>
        <input value={editMovForm.monto} onChange={e=>setEditMovForm({...editMovForm,monto:e.target.value})} placeholder="Monto" style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"7px 10px",fontSize:12,outline:"none"}}/>
        <textarea value={editMovForm.notas||""} onChange={e=>setEditMovForm({...editMovForm,notas:e.target.value})} placeholder="Notas opcionales..." rows={2} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"7px 10px",fontSize:12,outline:"none",resize:"vertical",fontFamily:"inherit"}}/>
        <div style={{display:"flex",gap:6}}>
          <button onClick={saveEditMov} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:8,padding:"7px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Guardar</button>
          <button onClick={()=>setEditMov(null)} style={{padding:"7px 12px",border:"1px solid #E5E7EB",borderRadius:8,background:"#fff",fontSize:12,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
        </div>
      </div>
    );
    return(
      <div>
        <div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 0",borderBottom:isAddingNota?"none":"1px solid #F9FAFB"}}>
          <div style={{marginTop:2}}>{m.tipo==="ingreso"?<ArrowUpCircle size={13} color="#059669"/>:<ArrowDownCircle size={13} color="#DC2626"/>}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12,color:"#374151",fontWeight:500}}>{m.concepto}</span>{metodoBadge(m.metodo)}</div>
            {m.notas&&m.notas.split("\n").map((linea,i)=>(
              <div key={i} style={{fontSize:10,color:"#6B7280",fontStyle:"italic",marginTop:2,lineHeight:1.5}}>{linea}</div>
            ))}
            <div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>{m.registrado}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
            <span style={{fontSize:12,fontWeight:700,color:m.tipo==="ingreso"?"#059669":"#DC2626"}}>{fmt(m.monto)}</span>
            {isAdmin
              ? <button onClick={()=>{setEditMov({cajaId,movId:m.id});setEditMovForm({tipo:m.tipo,concepto:m.concepto,monto:String(m.monto),metodo:m.metodo||"efectivo",notas:m.notas||""});setNotaMovId(null);}} style={{background:co.color+"15",border:"none",borderRadius:6,padding:"3px 7px",fontSize:10,fontWeight:600,cursor:"pointer",color:co.color}}>Editar</button>
              : <button onClick={()=>{setNotaMovId(isAddingNota?null:{cajaId,movId:m.id,notaAnterior:m.notas||""});setNotaTexto("");setEditMov(null);}} style={{background:"#FEF3C7",border:"none",borderRadius:6,padding:"3px 7px",fontSize:10,fontWeight:600,cursor:"pointer",color:"#92400E"}}>{isAddingNota?"Cancelar":"+ Nota"}</button>
            }
          </div>
        </div>
        {isAddingNota&&(
          <div style={{background:"#FFFBEB",borderRadius:"0 0 10px 10px",padding:"10px 12px",border:"1px solid #FDE68A",borderTop:"none",marginBottom:4,display:"flex",flexDirection:"column",gap:7}}>
            <div style={{fontSize:10,fontWeight:600,color:"#92400E"}}>Agregar nota al movimiento</div>
            <textarea autoFocus placeholder="Escribe una aclaracion, correccion o comentario..." value={notaTexto} onChange={e=>setNotaTexto(e.target.value)} rows={2} style={{border:"1px solid #FDE68A",borderRadius:8,padding:"7px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit",background:"#fff"}}/>
            <div style={{display:"flex",gap:6}}>
              <button onClick={saveNotaAdicional} disabled={!notaTexto.trim()} style={{flex:1,background:notaTexto.trim()?"#D97706":"#E5E7EB",color:notaTexto.trim()?"#fff":"#9CA3AF",border:"none",borderRadius:8,padding:"7px",fontSize:12,fontWeight:600,cursor:notaTexto.trim()?"pointer":"default"}}>Guardar nota</button>
              <button onClick={()=>{setNotaMovId(null);setNotaTexto("");}} style={{padding:"7px 12px",border:"1px solid #E5E7EB",borderRadius:8,background:"#fff",fontSize:12,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    );
  };
  const MovList=({movs,cajaId})=>(
    <div>
      {(!movs||movs.length===0)&&<div style={{fontSize:12,color:"#9CA3AF",textAlign:"center",padding:"8px 0"}}>Sin movimientos</div>}
      {[...(movs||[])].reverse().map(m=><MovRow key={m.id} m={m} cajaId={cajaId}/>)}
    </div>
  );
  const historial=cuentas.filter(c=>c.estado==="cerrada");

  return(
    <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontSize:17,fontWeight:700,color:"#111"}}>Caja</div>
      {!abierta&&(
        <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1px solid #F0F0F0",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:36,height:36,borderRadius:10,background:co.color+"15",display:"flex",alignItems:"center",justifyContent:"center"}}><Wallet size={17} color={co.color}/></div>
            <div style={{fontSize:13,fontWeight:600,color:"#374151"}}>Abrir caja del día</div>
          </div>
          <input placeholder="Monto de apertura ($)" value={montoApertura} onChange={e=>setMontoApertura(e.target.value)} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"10px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          {err&&<div style={{fontSize:12,color:"#DC2626",background:"#FEF2F2",padding:"8px 12px",borderRadius:8}}>{err}</div>}
          <button onClick={abrir} style={{background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"11px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Abrir caja</button>
        </div>
      )}
      {abierta&&(
        <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1.5px solid "+co.color,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:14,fontWeight:700,color:"#111"}}>Caja abierta</div><div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>{abierta.fecha} · {abierta.horaApertura}</div></div>
            <span style={{fontSize:11,fontWeight:600,background:"#D1FAE5",color:"#065F46",padding:"4px 10px",borderRadius:20}}>Activa</span>
          </div>
          <div style={{background:"#F9FAFB",borderRadius:10,padding:"10px 14px"}}>
            <div style={{fontSize:11,color:"#6B7280"}}>Monto de apertura</div>
            <div style={{fontSize:18,fontWeight:700,color:"#111",marginTop:2}}>{fmt(abierta.montoApertura)}</div>
          </div>
          <div style={{background:"#F9FAFB",borderRadius:12,padding:"12px",display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>Registrar movimiento</div>
            <div style={{display:"flex",gap:6}}>
              {["ingreso","egreso"].map(t=><button key={t} onClick={()=>setMovForm({...movForm,tipo:t})} style={{flex:1,padding:"7px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",border:"none",background:movForm.tipo===t?(t==="ingreso"?"#059669":"#DC2626"):"#fff",color:movForm.tipo===t?"#fff":"#374151",outline:movForm.tipo!==t?"1px solid #E5E7EB":"none"}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
            </div>
            <div>
              <div style={{fontSize:11,color:"#6B7280",marginBottom:5}}>Método</div>
              <div style={{display:"flex",gap:6}}>
                {[["efectivo","Efectivo","#059669"],["transferencia","Transf.","#1A73E8"],["tarjeta","Tarjeta","#7C3AED"]].map(([met,label,activeColor])=>(
                  <button key={met} onClick={()=>setMovForm({...movForm,metodo:met})} style={{flex:1,padding:"7px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",border:"none",background:movForm.metodo===met?activeColor:"#fff",color:movForm.metodo===met?"#fff":"#374151",outline:movForm.metodo!==met?"1px solid #E5E7EB":"none"}}>{label}</button>
                ))}
              </div>
            </div>
            <input placeholder="Concepto" value={movForm.concepto} onChange={e=>setMovForm({...movForm,concepto:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
            <input placeholder="Monto ($)" value={movForm.monto} onChange={e=>setMovForm({...movForm,monto:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
            <textarea placeholder="Notas opcionales…" value={movForm.notas} onChange={e=>setMovForm({...movForm,notas:e.target.value})} rows={2} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}}/>
            {movErr&&<div style={{fontSize:11,color:"#DC2626"}}>{movErr}</div>}
            <button onClick={addMov} style={{background:movForm.tipo==="ingreso"?"#059669":"#DC2626",color:"#fff",border:"none",borderRadius:8,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Registrar {movForm.tipo}</button>
          </div>
          {(abierta.movimientos||[]).length>0&&(
            <div style={{borderTop:"1px solid #F3F4F6",paddingTop:10}}>
              <div style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:6}}>Movimientos del día</div>
              <MovList movs={abierta.movimientos} cajaId={abierta.id}/>
            </div>
          )}
          <div style={{height:1,background:"#F3F4F6"}}/>
          <div style={{fontSize:12,fontWeight:700,color:"#374151"}}>Arqueo de cierre</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginTop:-8}}>Ingresa el monto contado en cada método de pago</div>
          {(()=>{
            const movs=abierta.movimientos||[];
            return [
              ["efectivo","💵 Efectivo","#059669","#F0FDF4"],
              ["transferencia","🏦 Transferencia","#1A73E8","#EFF6FF"],
              ["tarjeta","💳 Tarjeta","#7C3AED","#F5F3FF"],
            ].map(([met,label,color,bgColor])=>{
              const esperado=calcEsperado(movs,met);
              const contado=parseFloat(String(arqueo[met]).replace(/,/g,""))||0;
              const diff=contado-esperado;
              const hasInput=arqueo[met]!=="";
              return(
                <div key={met} style={{background:bgColor,borderRadius:14,padding:"12px 14px",border:`1px solid ${color}22`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <span style={{fontSize:12,fontWeight:700,color:"#374151"}}>{label}</span>
                    <span style={{fontSize:11,color:"#6B7280"}}>Esperado: <strong style={{color}}>{fmt(esperado)}</strong></span>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,color:"#6B7280",marginBottom:4}}>Monto contado</div>
                      <input
                        placeholder={fmt(esperado)}
                        value={arqueo[met]}
                        onChange={e=>setArqueo({...arqueo,[met]:e.target.value})}
                        style={{border:`1.5px solid ${hasInput?color:"#E5E7EB"}`,borderRadius:9,padding:"8px 11px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",background:"#fff",fontWeight:hasInput?700:400}}
                      />
                    </div>
                    {hasInput&&(
                      <div style={{textAlign:"center",flexShrink:0,minWidth:72}}>
                        <div style={{fontSize:9,color:"#6B7280",marginBottom:4}}>Diferencia</div>
                        <div style={{fontSize:14,fontWeight:700,color:diff===0?"#059669":diff>0?"#1A73E8":"#DC2626",background:diff===0?"#D1FAE5":diff>0?"#DBEAFE":"#FEE2E2",borderRadius:8,padding:"5px 8px"}}>
                          {diff===0?"✓ OK":diff>0?`+${fmt(diff)}`:fmt(diff)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()}
          {/* Resumen total del arqueo */}
          {(arqueo.efectivo||arqueo.transferencia||arqueo.tarjeta)&&(()=>{
            const movs=abierta.movimientos||[];
            const totalEsperado=["efectivo","transferencia","tarjeta"].reduce((s,m)=>s+calcEsperado(movs,m),0);
            const totalContado=["efectivo","transferencia","tarjeta"].reduce((s,m)=>s+(parseFloat(String(arqueo[m]).replace(/,/g,""))||0),0);
            const totalDiff=totalContado-totalEsperado;
            return(
              <div style={{background:"#1F2937",borderRadius:12,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:11,color:"#9CA3AF"}}>Total esperado</div>
                  <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{fmt(totalEsperado)}</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:11,color:"#9CA3AF"}}>Diferencia global</div>
                  <div style={{fontSize:16,fontWeight:700,color:totalDiff===0?"#34D399":totalDiff>0?"#60A5FA":"#F87171"}}>
                    {totalDiff===0?"✓ Cuadrado":totalDiff>0?`+${fmt(totalDiff)}`:fmt(totalDiff)}
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:11,color:"#9CA3AF"}}>Total contado</div>
                  <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{fmt(totalContado)}</div>
                </div>
              </div>
            );
          })()}
          <button onClick={cerrar} style={{background:"#DC2626",color:"#fff",border:"none",borderRadius:10,padding:"11px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Cerrar caja</button>
        </div>
      )}
      {historial.length>0&&(
        <>
          <div style={{fontSize:13,fontWeight:600,color:"#374151"}}>Historial de cierres</div>
          {historial.map(c=>{
            const arq=c.arqueo;
            // compatibilidad con cajas viejas que solo tienen efectivoCierre
            const legacyDiff=(c.efectivoCierre||0)-c.montoApertura;
            return(
              <div key={c.id} style={{background:"#fff",borderRadius:14,padding:"14px 16px",border:"1px solid #F0F0F0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div><div style={{fontSize:13,fontWeight:600,color:"#111"}}>{c.fecha}</div><div style={{fontSize:11,color:"#9CA3AF",marginTop:1}}>{c.horaApertura} → {c.horaCierre}</div></div>
                  <span style={{fontSize:11,fontWeight:600,background:"#F3F4F6",color:"#374151",padding:"3px 10px",borderRadius:20}}>Cerrada</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,textAlign:"center",marginBottom:10}}>
                  <div style={{background:"#F9FAFB",borderRadius:10,padding:"8px 4px"}}><div style={{fontSize:10,color:"#9CA3AF",marginBottom:2}}>Apertura</div><div style={{fontSize:11,fontWeight:700,color:"#374151"}}>{fmt(c.montoApertura)}</div></div>
                  {arq
                    ? <div style={{background:"#F9FAFB",borderRadius:10,padding:"8px 4px"}}><div style={{fontSize:10,color:"#9CA3AF",marginBottom:2}}>Total contado</div><div style={{fontSize:11,fontWeight:700,color:"#059669"}}>{fmt(Object.values(arq).reduce((s,v)=>s+(v.contado||0),0))}</div></div>
                    : <div style={{background:"#F9FAFB",borderRadius:10,padding:"8px 4px"}}><div style={{fontSize:10,color:"#9CA3AF",marginBottom:2}}>Efectivo cierre</div><div style={{fontSize:11,fontWeight:700,color:"#059669"}}>{fmt(c.efectivoCierre||0)}</div></div>
                  }
                </div>
                {/* Arqueo por método */}
                {arq&&(
                  <div style={{background:"#F9FAFB",borderRadius:12,padding:"10px 12px",marginBottom:10,display:"flex",flexDirection:"column",gap:6}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#374151",marginBottom:4}}>Arqueo de cierre</div>
                    {[
                      ["efectivo","💵 Efectivo","#059669"],
                      ["transferencia","🏦 Transferencia","#1A73E8"],
                      ["tarjeta","💳 Tarjeta","#7C3AED"],
                    ].map(([met,label,color])=>{
                      const row=arq[met];
                      if(!row)return null;
                      const diff=row.contado-row.esperado;
                      return(
                        <div key={met} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,alignItems:"center"}}>
                          <span style={{fontSize:11,color:"#374151",fontWeight:500}}>{label}</span>
                          <div style={{textAlign:"center"}}>
                            <div style={{fontSize:9,color:"#9CA3AF"}}>Esperado</div>
                            <div style={{fontSize:11,fontWeight:600,color}}>{fmt(row.esperado)}</div>
                          </div>
                          <div style={{textAlign:"center"}}>
                            <div style={{fontSize:9,color:"#9CA3AF"}}>Contado / Dif.</div>
                            <div style={{fontSize:11,fontWeight:700,color:diff===0?"#059669":diff>0?"#1A73E8":"#DC2626"}}>
                              {fmt(row.contado)} <span style={{fontSize:9}}>({diff===0?"✓":diff>0?"+"+fmt(diff):fmt(diff)})</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {(c.movimientos||[]).length>0&&<div style={{borderTop:"1px solid #F3F4F6",paddingTop:10,marginBottom:10}}><MovList movs={c.movimientos} cajaId={c.id}/></div>}
                {/* Diferencia global */}
                {arq?(()=>{
                  const totalEsp=Object.values(arq).reduce((s,v)=>s+(v.esperado||0),0);
                  const totalCon=Object.values(arq).reduce((s,v)=>s+(v.contado||0),0);
                  const diff=totalCon-totalEsp;
                  return(
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:diff===0?"#F0FDF4":diff>0?"#EFF6FF":"#FEF2F2",borderRadius:10}}>
                      <span style={{fontSize:12,color:"#6B7280"}}>Diferencia global</span>
                      <span style={{fontSize:13,fontWeight:700,color:diff===0?"#059669":diff>0?"#1A73E8":"#DC2626"}}>{diff===0?"✓ Cuadrado":diff>0?`+${fmt(diff)}`:fmt(diff)}</span>
                    </div>
                  );
                })():(
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:legacyDiff>=0?"#F0FDF4":"#FEF2F2",borderRadius:10}}>
                    <span style={{fontSize:12,color:"#6B7280"}}>Diferencia vs apertura</span>
                    <span style={{fontSize:13,fontWeight:700,color:legacyDiff>=0?"#059669":"#DC2626"}}>{legacyDiff>=0?"+":""}{fmt(legacyDiff)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ── NÓMINA ────────────────────────────────────────────────────────────────────
function NominaView({nominas,setNominas,co}){
  const [newForm,setNewForm]=useState(false);
  const [nominaForm,setNominaForm]=useState({nombre:"",periodo:""});
  const [sel,setSel]=useState(null);
  const [empForm,setEmpForm]=useState({nombre:"",puesto:"",sueldoDia:"",dias:"",fechaIngreso:""});
  const [showEmpForm,setShowEmpForm]=useState(false);
  const [confirmDel,setConfirmDel]=useState(null);
  const [confirmDelEmp,setConfirmDelEmp]=useState(null);
  const [err,setErr]=useState("");
  const [empErr,setEmpErr]=useState("");

  const crearNomina=()=>{
    if(!nominaForm.nombre||!nominaForm.periodo){setErr("Nombre y periodo son obligatorios.");return;}
    setNominas(prev=>[...prev,{id:Date.now(),nombre:nominaForm.nombre,periodo:nominaForm.periodo,empleados:[],creadoEn:now()}]);
    setNominaForm({nombre:"",periodo:""});setNewForm(false);setErr("");
  };
  const addEmpleado=()=>{
    if(!empForm.nombre||!empForm.sueldoDia||!empForm.dias){setEmpErr("Nombre, sueldo/día y días son obligatorios.");return;}
    const sd=parseFloat(String(empForm.sueldoDia).replace(/,/g,"")),dias=parseFloat(empForm.dias);
    if(isNaN(sd)||sd<=0||isNaN(dias)||dias<=0){setEmpErr("Valores inválidos.");return;}
    setNominas(prev=>prev.map(n=>n.id===sel?{...n,empleados:[...n.empleados,{id:Date.now(),nombre:empForm.nombre,puesto:empForm.puesto,sueldoDia:sd,dias,fechaIngreso:empForm.fechaIngreso}]}:n));
    setEmpForm({nombre:"",puesto:"",sueldoDia:"",dias:"",fechaIngreso:""});setShowEmpForm(false);setEmpErr("");
  };
  const delNomina=id=>{setNominas(prev=>prev.filter(n=>n.id!==id));if(sel===id)setSel(null);setConfirmDel(null);};
  const delEmp=(nId,eId)=>{setNominas(prev=>prev.map(n=>n.id===nId?{...n,empleados:n.empleados.filter(e=>e.id!==eId)}:n));setConfirmDelEmp(null);};
  const total=n=>n.empleados.reduce((s,e)=>s+e.sueldoDia*e.dias,0);
  const grand=nominas.reduce((s,n)=>s+total(n),0);

  return(
    <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:17,fontWeight:700,color:"#111"}}>Nómina</div>
        <button onClick={()=>{setNewForm(!newForm);setErr("");}} style={{background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><Plus size={13}/> Nueva nómina</button>
      </div>
      {nominas.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div style={{background:"#fff",borderRadius:12,padding:"10px 12px",border:"1px solid #F0F0F0",textAlign:"center"}}><div style={{fontSize:13,fontWeight:700,color:co.color}}>{nominas.length}</div><div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>Nóminas</div></div>
          <div style={{background:"#fff",borderRadius:12,padding:"10px 12px",border:"1px solid #F0F0F0",textAlign:"center"}}><div style={{fontSize:13,fontWeight:700,color:"#DC2626"}}>{fmt(grand)}</div><div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>Gasto total</div></div>
        </div>
      )}
      {newForm&&(
        <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1.5px solid "+co.color,display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:13,fontWeight:600,color:"#374151"}}>Nueva nómina</div>
          <input placeholder={`Ej. Nómina ${T(co).Obra} Polanco`} value={nominaForm.nombre} onChange={e=>setNominaForm({...nominaForm,nombre:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          <input placeholder="Ej. 01 - 15 Abril 2025" value={nominaForm.periodo} onChange={e=>setNominaForm({...nominaForm,periodo:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          {err&&<div style={{fontSize:12,color:"#DC2626",background:"#FEF2F2",padding:"8px 12px",borderRadius:8}}>{err}</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={crearNomina} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Crear nómina</button>
            <button onClick={()=>{setNewForm(false);setErr("");}} style={{padding:"10px 16px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff",fontSize:13,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
          </div>
        </div>
      )}
      {nominas.length===0&&!newForm&&<div style={{textAlign:"center",padding:"40px 16px",color:"#9CA3AF"}}><ClipboardList size={36} style={{margin:"0 auto 12px",display:"block",opacity:.35}}/><div style={{fontSize:13}}>No hay nóminas. Crea la primera.</div></div>}
      {nominas.map(n=>{
        const tot=total(n),open=sel===n.id;
        return(
          <div key={n.id} style={{background:"#fff",borderRadius:16,border:"1px solid #F0F0F0",overflow:"hidden"}}>
            <div style={{padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1,cursor:"pointer"}} onClick={()=>setSel(open?null:n.id)}>
                  <div style={{fontSize:13,fontWeight:700,color:"#111"}}>{n.nombre}</div>
                  <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>Periodo: {n.periodo}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button onClick={()=>setConfirmDel(confirmDel===n.id?null:n.id)} style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"4px 7px",cursor:"pointer",display:"flex"}}><Trash2 size={13} color="#DC2626"/></button>
                  <button onClick={()=>setSel(open?null:n.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",display:"flex",padding:0}}>{open?<ChevronUp size={18}/>:<ChevronDown size={18}/>}</button>
                </div>
              </div>
              {confirmDel===n.id&&(
                <div style={{marginTop:10,background:"#FEF2F2",borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                  <span style={{fontSize:12,color:"#DC2626",fontWeight:500}}>¿Eliminar esta nómina?</span>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>delNomina(n.id)} style={{background:"#DC2626",color:"#fff",border:"none",borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Eliminar</button>
                    <button onClick={()=>setConfirmDel(null)} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
                  </div>
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
                {[["Empleados",n.empleados.length,"#374151"],["Total",fmt(tot),"#DC2626"],["Creada",n.creadoEn?.split(",")[0]||"—","#6B7280"]].map(([l,v,c])=>(
                  <div key={l} style={{background:"#F9FAFB",borderRadius:10,padding:"8px 4px",textAlign:"center"}}><div style={{fontSize:10,color:"#9CA3AF",marginBottom:2}}>{l}</div><div style={{fontSize:11,fontWeight:700,color:c,wordBreak:"break-all"}}>{v}</div></div>
                ))}
              </div>
            </div>
            {open&&(
              <div style={{borderTop:"1px solid #F3F4F6",padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>Empleados</div>
                  <button onClick={()=>{setShowEmpForm(!showEmpForm);setEmpErr("");}} style={{background:co.color,color:"#fff",border:"none",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><Plus size={11}/> Añadir</button>
                </div>
                {showEmpForm&&(
                  <div style={{background:"#F9FAFB",borderRadius:12,padding:"12px",display:"flex",flexDirection:"column",gap:8}}>
                    {[["nombre","Nombre completo"],["puesto","Puesto (opcional)"]].map(([k,ph])=>(
                      <input key={k} placeholder={ph} value={empForm[k]} onChange={e=>setEmpForm({...empForm,[k]:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
                    ))}
                    <input type="date" value={empForm.fechaIngreso} onChange={e=>setEmpForm({...empForm,fechaIngreso:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      <input placeholder="Sueldo/día ($)" value={empForm.sueldoDia} onChange={e=>setEmpForm({...empForm,sueldoDia:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
                      <input placeholder="Días trabajados" value={empForm.dias} onChange={e=>setEmpForm({...empForm,dias:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:8,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
                    </div>
                    {empErr&&<div style={{fontSize:11,color:"#DC2626"}}>{empErr}</div>}
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={addEmpleado} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:8,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Guardar</button>
                      <button onClick={()=>{setShowEmpForm(false);setEmpErr("");}} style={{padding:"9px 14px",border:"1px solid #E5E7EB",borderRadius:8,background:"#fff",fontSize:12,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
                    </div>
                  </div>
                )}
                {n.empleados.length===0&&!showEmpForm&&<div style={{textAlign:"center",padding:"16px 0",color:"#9CA3AF",fontSize:12}}>Sin empleados en esta nómina</div>}
                {n.empleados.map(emp=>{
                  const sub=emp.sueldoDia*emp.dias,isDE=confirmDelEmp?.nId===n.id&&confirmDelEmp?.eId===emp.id;
                  return(
                    <div key={emp.id} style={{background:"#F9FAFB",borderRadius:12,padding:"10px 12px"}}>
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:600,color:"#111"}}>{emp.nombre}</div>
                          {emp.puesto&&<div style={{fontSize:10,color:"#9CA3AF",marginTop:1}}>{emp.puesto}</div>}
                          {emp.fechaIngreso&&<div style={{fontSize:10,color:"#9CA3AF"}}>Ingreso: {emp.fechaIngreso}</div>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{fontSize:13,fontWeight:700,color:"#DC2626"}}>{fmt(sub)}</div>
                          <button onClick={()=>setConfirmDelEmp(isDE?null:{nId:n.id,eId:emp.id})} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:0}}><X size={14} color="#DC2626"/></button>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:12,marginTop:5}}>
                        <span style={{fontSize:10,color:"#6B7280"}}>{fmt(emp.sueldoDia)}<span style={{color:"#9CA3AF"}}>/día</span></span>
                        <span style={{fontSize:10,color:"#6B7280"}}>{emp.dias} día{emp.dias!==1?"s":""}</span>
                      </div>
                      {isDE&&(
                        <div style={{marginTop:8,background:"#FEF2F2",borderRadius:8,padding:"8px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                          <span style={{fontSize:11,color:"#DC2626"}}>¿Eliminar a {emp.nombre}?</span>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={()=>delEmp(n.id,emp.id)} style={{background:"#DC2626",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Eliminar</button>
                            <button onClick={()=>setConfirmDelEmp(null)} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:6,padding:"4px 8px",fontSize:11,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {n.empleados.length>0&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:"#FEF2F2",borderRadius:10}}><span style={{fontSize:12,fontWeight:600,color:"#374151"}}>Total nómina</span><span style={{fontSize:15,fontWeight:700,color:"#DC2626"}}>{fmt(tot)}</span></div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── USUARIOS ─────────────────────────────────────────────────────────────────
function UsuariosView({users,setUsers,co}){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({name:"",email:"",pw:"",role:"administrativo"});
  const [editId,setEditId]=useState(null);
  const [editForm,setEditForm]=useState({});
  const [editPw,setEditPw]=useState("");
  const [showNewPw,setShowNewPw]=useState(false);
  const [err,setErr]=useState("");
  const list=users[co.id];

  const [loading,setLoading]=useState(false);

  const refreshUsers=async()=>{
    const updated=await db.getCompanyUsers(co.id);
    setUsers(p=>({...p,[co.id]:updated}));
  };

  const add=async()=>{
    if(!form.name||!form.email||!form.pw){setErr("Completa todos los campos.");return;}
    setLoading(true);
    try{
      await db.createUser(form.email,form.pw,{name:form.name,role:form.role,companyId:co.id});
      await refreshUsers();
      setForm({name:"",email:"",pw:"",role:"administrativo"});setErr("");setShow(false);
    }catch(e){
      setErr(e.message||"Error al crear usuario.");
    }
    setLoading(false);
  };

  const startEdit=u=>{setEditId(u.id);setEditForm({name:u.name,email:u.email||"",role:u.role});setEditPw("");setErr("");setShow(false);};

  const saveEdit=async()=>{
    if(!editForm.name){setErr("El nombre es obligatorio.");return;}
    setLoading(true);
    try{
      await db.updateProfile(editId,{name:editForm.name,role:editForm.role});
      if(editPw) await db.updatePassword(editId,editPw);
      await refreshUsers();
      setEditId(null);setErr("");
    }catch(e){
      setErr(e.message||"Error al actualizar usuario.");
    }
    setLoading(false);
  };
  const rBg={
    admin:"#EDE9FE", administrativo:"#E0F2FE",
    logistica:"#FEF3C7", operativo:"#D1FAE5",
  };
  const rColor={
    admin:"#5B21B6", administrativo:"#075985",
    logistica:"#92400E", operativo:"#065F46",
  };

  return(
    <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:17,fontWeight:700,color:"#111"}}>Usuarios</div>
        <button onClick={()=>{setShow(!show);setEditId(null);setErr("");}} style={{background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><Plus size={13}/> Nuevo usuario</button>
      </div>
      {show&&(
        <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1px solid #F0F0F0",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:13,fontWeight:600,color:"#374151"}}>Crear usuario</div>
          {[["name","Nombre completo","text"],["email","Correo electrónico","email"],["pw","Contraseña","password"]].map(([k,ph,t])=>(
            <input key={k} type={t} placeholder={ph} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          ))}
          <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none"}}>
            <option value="administrativo">Administrativo General</option>
            <option value="admin">Director General</option>
            {co.id==="sae"&&<option value="logistica">Logística</option>}
            {co.id==="sae"&&<option value="operativo">Administrativo</option>}
          </select>
          {err&&<div style={{fontSize:12,color:"#DC2626",background:"#FEF2F2",padding:"8px 12px",borderRadius:8}}>{err}</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={add} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Crear</button>
            <button onClick={()=>{setShow(false);setErr("");}} style={{padding:"10px 16px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff",fontSize:13,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
          </div>
        </div>
      )}
      {list.map(u=>(
        <div key={u.id}>
          <div style={{background:"#fff",borderRadius:14,padding:"12px 16px",border:editId===u.id?"1.5px solid "+co.color:"1px solid #F0F0F0",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:co.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:14,flexShrink:0}}>{u.name.charAt(0).toUpperCase()}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:"#111",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</div>
              <div style={{fontSize:11,color:"#9CA3AF",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.email}</div>
            </div>
            <span style={{fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20,whiteSpace:"nowrap",background:rBg[u.role]||"#F3F4F6",color:rColor[u.role]||"#374151"}}>{roleLabel(u.role)}</span>
            <button onClick={()=>editId===u.id?setEditId(null):startEdit(u)} style={{background:editId===u.id?"#F3F4F6":co.color+"15",border:"none",borderRadius:8,padding:"5px 10px",fontSize:11,fontWeight:600,cursor:"pointer",color:editId===u.id?"#6B7280":co.color,flexShrink:0}}>
              {editId===u.id?"✕":"Editar"}
            </button>
          </div>
          {editId===u.id&&(
            <div style={{background:"#F9FAFB",borderRadius:"0 0 14px 14px",padding:"14px 16px",border:"1.5px solid "+co.color,borderTop:"none",display:"flex",flexDirection:"column",gap:10,marginTop:-4}}>
              {[["name","Nombre completo","text"],["email","Correo electrónico","email"]].map(([k,ph,t])=>(
                <div key={k}><div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>{ph}</div>
                  <input type={t} value={editForm[k]} onChange={e=>setEditForm({...editForm,[k]:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",background:"#fff"}}/>
                </div>
              ))}
              <div><div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Nueva contraseña <span style={{color:"#9CA3AF"}}>(vacío = sin cambio)</span></div>
                <div style={{position:"relative"}}>
                  <input type={showNewPw?"text":"password"} placeholder="••••••••" value={editPw} onChange={e=>setEditPw(e.target.value)} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 36px 9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",background:"#fff"}}/>
                  <button onClick={()=>setShowNewPw(!showNewPw)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",display:"flex",padding:0}}>{showNewPw?<EyeOff size={15}/>:<Eye size={15}/>}</button>
                </div>
              </div>
              <select value={editForm.role} onChange={e=>setEditForm({...editForm,role:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",background:"#fff"}}>
                <option value="administrativo">Administrativo General</option>
                <option value="admin">Director General</option>
                {co.id==="sae"&&<option value="logistica">Logística</option>}
                {co.id==="sae"&&<option value="operativo">Administrativo</option>}
              </select>
              {err&&<div style={{fontSize:12,color:"#DC2626",background:"#FEF2F2",padding:"8px 12px",borderRadius:8}}>{err}</div>}
              <button onClick={saveEdit} style={{background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Guardar cambios</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── INVENTARIO BODEGAS (SAE) ──────────────────────────────────────────────────
const CATS_SAE=["Mobiliario","Papelería","Tecnología","Ferretería","Otros"];
const UNIBS=["pza","caja","set","rollo","paquete","resma","kg","lt"];
const ESTADOS_PROD=["Nuevo","Bueno","Regular","Dañado","Dado de baja"];
const EP_COLOR={"Nuevo":"#059669","Bueno":"#0EA5E9","Regular":"#D97706","Dañado":"#DC2626","Dado de baja":"#6B7280"};
const EP_BG={"Nuevo":"#D1FAE5","Bueno":"#E0F2FE","Regular":"#FEF3C7","Dañado":"#FEE2E2","Dado de baja":"#F3F4F6"};
const SAE_CAT_COLORS=["#1557A0","#059669","#7C3AED","#D97706","#6B7280"];
// FIX: función segura que evita índice -1 cuando la categoría no está en el array
const catColor=cat=>{ const i=CATS_SAE.indexOf(cat); return SAE_CAT_COLORS[Math.max(0,i)%SAE_CAT_COLORS.length]; };

function InventarioBodegaView({bodegas,setBodegas,co,user}){
  const [bodegaId,setBodegaId]=useState(null);
  const [newForm,setNewForm]=useState(false);
  const [bodegaForm,setBodegaForm]=useState({nombre:"",descripcion:""});
  const [bErr,setBErr]=useState("");
  const [confirmDelB,setConfirmDelB]=useState(null);

  const crearBodega=()=>{
    if(!bodegaForm.nombre){setBErr("El nombre es obligatorio.");return;}
    setBodegas(prev=>[...prev,{id:Date.now(),nombre:bodegaForm.nombre,descripcion:bodegaForm.descripcion,productos:[],creadoEn:now()}]);
    setBodegaForm({nombre:"",descripcion:""});setNewForm(false);setBErr("");
  };
  const eliminarBodega=id=>{setBodegas(prev=>prev.filter(b=>b.id!==id));if(bodegaId===id)setBodegaId(null);setConfirmDelB(null);};

  if(bodegaId){
    const bodega=bodegas.find(b=>b.id===bodegaId);
    if(!bodega){setBodegaId(null);return null;}
    return <BodegaDetalle bodega={bodega} setBodegas={setBodegas} co={co} onBack={()=>setBodegaId(null)} user={user}/>;
  }

  const totalG=bodegas.reduce((s,b)=>s+b.productos.reduce((a,p)=>a+(p.precio*p.cantidad),0),0);
  const totalS=bodegas.reduce((s,b)=>s+b.productos.length,0);

  return(
    <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{fontSize:17,fontWeight:700,color:"#111"}}>Inventario</div><div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>Gestión por bodega</div></div>
        <button onClick={()=>{setNewForm(!newForm);setBErr("");}} style={{background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0}}><Plus size={13}/> Nueva bodega</button>
      </div>
      {bodegas.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[[bodegas.length,"Bodegas",co.color],[totalS,"Productos","#374151"],[fmt(totalG),"Valor total","#7C3AED"]].map(([v,l,c])=>(
            <div key={l} style={{background:"#fff",borderRadius:12,padding:"12px 8px",border:"1px solid #F0F0F0",textAlign:"center"}}><div style={{fontSize:15,fontWeight:700,color:c,lineHeight:1}}>{v}</div><div style={{fontSize:9,color:"#9CA3AF",marginTop:4}}>{l}</div></div>
          ))}
        </div>
      )}
      {newForm&&(
        <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1.5px solid "+co.color,display:"flex",flexDirection:"column",gap:10}}>
          <input placeholder="Nombre de la bodega *" value={bodegaForm.nombre} onChange={e=>setBodegaForm({...bodegaForm,nombre:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          <input placeholder="Descripción (opcional)" value={bodegaForm.descripcion} onChange={e=>setBodegaForm({...bodegaForm,descripcion:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          {bErr&&<div style={{fontSize:12,color:"#DC2626",background:"#FEF2F2",padding:"8px 12px",borderRadius:8}}>{bErr}</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={crearBodega} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Crear bodega</button>
            <button onClick={()=>{setNewForm(false);setBErr("");}} style={{padding:"10px 16px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff",fontSize:13,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
          </div>
        </div>
      )}
      {bodegas.length===0&&!newForm&&<div style={{textAlign:"center",padding:"48px 16px",color:"#9CA3AF"}}><Warehouse size={44} style={{margin:"0 auto 14px",display:"block",opacity:.2}}/><div style={{fontSize:13,fontWeight:500}}>Sin bodegas registradas</div></div>}
      {bodegas.map(b=>{
        const tot=b.productos.reduce((s,p)=>s+(p.precio*p.cantidad),0);
        return(
          <div key={b.id} style={{background:"#fff",borderRadius:16,border:"1px solid #F0F0F0",overflow:"hidden"}}>
            <div style={{padding:"14px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}} onClick={()=>setBodegaId(b.id)}>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:32,height:32,borderRadius:9,background:co.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Warehouse size={15} color={co.color}/></div>
                <div><div style={{fontSize:13,fontWeight:700,color:"#111"}}>{b.nombre}</div>{b.descripcion&&<div style={{fontSize:10,color:"#9CA3AF"}}>{b.descripcion}</div>}</div>
              </div>
              <div onClick={ev=>ev.stopPropagation()}>
                <button onClick={()=>setConfirmDelB(confirmDelB===b.id?null:b.id)} style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"4px 7px",cursor:"pointer",display:"flex"}}><X size={12} color="#DC2626"/></button>
              </div>
            </div>
            {confirmDelB===b.id&&(
              <div style={{margin:"0 14px 12px",background:"#FEF2F2",borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                <span style={{fontSize:12,color:"#DC2626",fontWeight:500}}>¿Eliminar esta bodega?</span>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>eliminarBodega(b.id)} style={{background:"#DC2626",color:"#fff",border:"none",borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Eliminar</button>
                  <button onClick={()=>setConfirmDelB(null)} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
                </div>
              </div>
            )}
            <div style={{padding:"0 16px 14px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,cursor:"pointer"}} onClick={()=>setBodegaId(b.id)}>
              {[[b.productos.length,"Productos","#374151"],[fmt(tot),"Valor","#7C3AED"],[b.creadoEn?.split(",")[0]||"—","Creada","#9CA3AF"]].map(([v,l,c])=>(
                <div key={l} style={{background:"#F9FAFB",borderRadius:10,padding:"8px 6px",textAlign:"center"}}><div style={{fontSize:11,fontWeight:700,color:c,wordBreak:"break-all"}}>{v}</div><div style={{fontSize:9,color:"#9CA3AF",marginTop:2}}>{l}</div></div>
              ))}
            </div>
            <div style={{padding:"0 16px 14px",cursor:"pointer",textAlign:"right"}} onClick={()=>setBodegaId(b.id)}><span style={{fontSize:11,color:co.color,fontWeight:600}}>Abrir bodega →</span></div>
          </div>
        );
      })}
    </div>
  );
}

function BodegaDetalle({bodega,setBodegas,co,onBack,user}){
  const CATS_BODEGA = CATEGORIAS_INV_BY_CO(co);
  const catColorLocal=cat=>{ const i=CATS_BODEGA.indexOf(cat); return SAE_CAT_COLORS[Math.max(0,i)%SAE_CAT_COLORS.length]; };
  const initForm=()=>({nombre:"",categoria:CATS_BODEGA[0],cantidad:"",unidad:"pza",precio:"",proveedor:"",fechaIngreso:new Date().toISOString().slice(0,10),estado:"Nuevo",notas:""});
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState(initForm);
  const [err,setErr]=useState("");
  const [buscar,setBuscar]=useState("");
  const [catFiltro,setCatFiltro]=useState("todas");
  const [confirmDel,setConfirmDel]=useState(null);
  const [egresoId,setEgresoId]=useState(null);
  const [egresoForm,setEgresoForm]=useState({cantidad:"",notas:""});
  const [egresoErr,setEgresoErr]=useState("");
  const [showHistorial,setShowHistorial]=useState(false);

  const productos=bodega.productos||[];
  const historialMov=bodega.historial||[];

  // ── Permisos ──────────────────────────────────────────────────────────────
  const canDelete=user?.role==="admin"||user?.role==="administrativo";

  // ── Guardar producto → registra entrada en historial ─────────────────────
  const guardar=()=>{
    if(!form.nombre||!form.cantidad||!form.precio){setErr("Nombre, cantidad y precio son obligatorios.");return;}
    const cant=parseFloat(String(form.cantidad).replace(/,/g,"")),precio=parseFloat(String(form.precio).replace(/,/g,""));
    if(isNaN(cant)||cant<=0||isNaN(precio)||precio<0){setErr("Cantidad o precio inválidos.");return;}
    const pid=Date.now();
    const prod={id:pid,nombre:form.nombre,categoria:form.categoria,cantidad:cant,unidad:form.unidad,precio,subtotal:cant*precio,proveedor:form.proveedor,fechaIngreso:form.fechaIngreso,estado:form.estado,notas:form.notas,agregadoPor:user?.name||"—",registrado:now()};
    const entrada={id:pid+1,tipo:"entrada",productoId:pid,productoNombre:form.nombre,categoria:form.categoria,cantidad:cant,unidad:form.unidad,usuario:{id:user?.id,name:user?.name,role:user?.role},fecha:now(),notas:form.notas||""};
    setBodegas(prev=>prev.map(b=>b.id===bodega.id?{...b,productos:[...(b.productos||[]),prod],historial:[entrada,...(b.historial||[])]}:b));
    setForm(initForm());setShowForm(false);setErr("");
  };

  // ── Eliminar (solo admin / administrativo) ────────────────────────────────
  const eliminar=id=>{
    const prod=productos.find(p=>p.id===id);
    const reg={id:Date.now(),tipo:"eliminacion",productoId:id,productoNombre:prod?.nombre||"—",categoria:prod?.categoria||"—",cantidad:prod?.cantidad||0,unidad:prod?.unidad||"",usuario:{id:user?.id,name:user?.name,role:user?.role},fecha:now(),notas:"Producto eliminado"};
    setBodegas(prev=>prev.map(b=>b.id===bodega.id?{...b,productos:b.productos.filter(p=>p.id!==id),historial:[reg,...(b.historial||[])]}:b));
    setConfirmDel(null);
  };

  // ── Registrar egreso ──────────────────────────────────────────────────────
  const registrarEgreso=()=>{
    const prod=productos.find(p=>p.id===egresoId);
    if(!prod){setEgresoErr("Producto no encontrado.");return;}
    const cant=parseFloat(String(egresoForm.cantidad).replace(/,/g,""));
    if(isNaN(cant)||cant<=0){setEgresoErr("Cantidad inválida.");return;}
    if(cant>prod.cantidad){setEgresoErr(`Solo hay ${prod.cantidad} ${prod.unidad} disponibles.`);return;}
    const nuevaCantidad=prod.cantidad-cant;
    const egreso={id:Date.now(),tipo:"egreso",productoId:prod.id,productoNombre:prod.nombre,categoria:prod.categoria,cantidad:cant,unidad:prod.unidad,usuario:{id:user?.id,name:user?.name,role:user?.role},fecha:now(),notas:egresoForm.notas};
    setBodegas(prev=>prev.map(b=>b.id===bodega.id?{
      ...b,
      productos:b.productos.map(p=>p.id===egresoId?{...p,cantidad:nuevaCantidad,subtotal:nuevaCantidad*p.precio}:p),
      historial:[egreso,...(b.historial||[])],
    }:b));
    setEgresoId(null);setEgresoForm({cantidad:"",notas:""});setEgresoErr("");
  };

  const filtrados=productos.filter(p=>{
    const okCat=catFiltro==="todas"||p.categoria===catFiltro;
    const okBus=!buscar||p.nombre.toLowerCase().includes(buscar.toLowerCase())||p.proveedor?.toLowerCase().includes(buscar.toLowerCase());
    return okCat&&okBus;
  });
  const totalFiltrado=filtrados.reduce((s,p)=>s+(p.precio*p.cantidad),0);
  const totalGeneral=productos.reduce((s,p)=>s+(p.precio*p.cantidad),0);
  const porCat={};
  productos.forEach(p=>{porCat[p.categoria]=(porCat[p.categoria]||0)+(p.precio*p.cantidad);});

  return(
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh",background:"#F5F6FA"}}>
      <div style={{background:co.bg,padding:"16px 20px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.18)",border:"none",borderRadius:20,padding:"5px 12px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:14,display:"inline-flex",alignItems:"center",gap:5}}>← Bodegas</button>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:13,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Warehouse size={20} color="#fff"/></div>
          <div><div style={{fontSize:18,fontWeight:700,color:"#fff",lineHeight:1.2}}>{bodega.nombre}</div>{bodega.descripcion&&<div style={{fontSize:12,color:"rgba(255,255,255,.7)",marginTop:3}}>{bodega.descripcion}</div>}</div>
        </div>
      </div>
      <div style={{padding:"16px 16px 0",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[[productos.length,"Productos","#374151","#F9FAFB"],[fmt(totalGeneral),"Valor total","#7C3AED","#F5F3FF"],[historialMov.length,"Movimientos",co.color,co.color+"12"]].map(([v,l,c,bg])=>(
          <div key={l} style={{background:bg,borderRadius:14,padding:"12px 8px",border:"1px solid #F0F0F0",textAlign:"center"}}><div style={{fontSize:15,fontWeight:700,color:c,lineHeight:1}}>{v}</div><div style={{fontSize:9,color:"#9CA3AF",marginTop:4}}>{l}</div></div>
        ))}
      </div>
      {Object.keys(porCat).length>0&&(
        <div style={{margin:"14px 16px 0",background:"#fff",borderRadius:14,padding:"14px",border:"1px solid #F0F0F0"}}>
          <div style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:10}}>Por categoría</div>
          {Object.entries(porCat).sort((a,b)=>b[1]-a[1]).map(([cat,val])=>{
            const p=totalGeneral>0?(val/totalGeneral)*100:0,c=catColorLocal(cat);
            return(
              <div key={cat} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#6B7280",marginBottom:3}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:c}}/>{cat}</div>
                  <span style={{fontWeight:600,color:c}}>{fmt(val)} · {p.toFixed(0)}%</span>
                </div>
                <div style={{height:5,background:"#F3F4F6",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${p}%`,background:c,borderRadius:99}}/></div>
              </div>
            );
          })}
        </div>
      )}
      <div style={{padding:"14px 16px 0"}}>
        <button onClick={()=>{setShowForm(!showForm);setErr("");}} style={{width:"100%",background:co.color,color:"#fff",border:"none",borderRadius:12,padding:"11px",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}><Package size={14}/> Agregar producto</button>
      </div>
      {showForm&&(
        <div style={{margin:"10px 16px 0",background:"#fff",borderRadius:16,padding:"16px",border:"1.5px solid "+co.color,display:"flex",flexDirection:"column",gap:9}}>
          <input placeholder="Nombre del producto *" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          <input placeholder="Proveedor (opcional)" value={form.proveedor} onChange={e=>setForm({...form,proveedor:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Categoría</div>
              <select value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"8px 10px",fontSize:12,outline:"none",width:"100%"}}>
                {CATS_BODEGA.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Fecha ingreso</div>
              <input type="date" value={form.fechaIngreso} onChange={e=>setForm({...form,fechaIngreso:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <div><div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Cantidad *</div><input placeholder="0" value={form.cantidad} onChange={e=>setForm({...form,cantidad:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/></div>
            <div><div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Unidad</div><select value={form.unidad} onChange={e=>setForm({...form,unidad:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"8px 10px",fontSize:12,outline:"none",width:"100%"}}>{UNIBS.map(u=><option key={u}>{u}</option>)}</select></div>
            <div><div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Precio unit. *</div><input placeholder="$0.00" value={form.precio} onChange={e=>setForm({...form,precio:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/></div>
          </div>
          {form.cantidad&&form.precio&&(()=>{const s=parseFloat(form.cantidad)*parseFloat(form.precio);return isNaN(s)?null:(<div style={{background:"#F0FDF4",borderRadius:9,padding:"8px 12px",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:"#6B7280"}}>Subtotal</span><span style={{fontSize:14,fontWeight:700,color:"#059669"}}>{fmt(s)}</span></div>);})()}
          <div><div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Estado</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {ESTADOS_PROD.map(est=><button key={est} onClick={()=>setForm({...form,estado:est})} style={{padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:"none",background:form.estado===est?EP_COLOR[est]:EP_BG[est],color:form.estado===est?"#fff":EP_COLOR[est]}}>{est}</button>)}
            </div>
          </div>
          <textarea placeholder="Notas opcionales…" value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})} rows={2} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"8px 12px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}}/>
          <div style={{background:"#F9FAFB",borderRadius:9,padding:"8px 12px",display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:co.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:9,fontWeight:700}}>{user?.name?.charAt(0)||"?"}</div>
            <span style={{fontSize:11,color:"#6B7280"}}>Como <strong style={{color:"#374151"}}>{user?.name||"—"}</strong></span>
          </div>
          {err&&<div style={{fontSize:11,color:"#DC2626",background:"#FEF2F2",padding:"7px 10px",borderRadius:8}}>{err}</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={guardar} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Guardar producto</button>
            <button onClick={()=>{setShowForm(false);setErr("");}} style={{padding:"10px 14px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff",fontSize:12,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
          </div>
        </div>
      )}
      {productos.length>0&&(
        <div style={{padding:"14px 16px 0",display:"flex",flexDirection:"column",gap:7}}>
          <div style={{position:"relative"}}>
            <Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"#9CA3AF"}}/>
            <input placeholder="Buscar producto o proveedor…" value={buscar} onChange={e=>setBuscar(e.target.value)} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px 9px 30px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
            {["todas",...CATS_BODEGA].filter(c=>c==="todas"||porCat[c]).map(c=>(
              <button key={c} onClick={()=>setCatFiltro(c)} style={{padding:"4px 11px",borderRadius:20,fontSize:10,fontWeight:600,border:"none",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,background:catFiltro===c?co.color:"#F3F4F6",color:catFiltro===c?"#fff":"#6B7280"}}>{c==="todas"?"Todas":c}</button>
            ))}
          </div>
          {(buscar||catFiltro!=="todas")&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6B7280"}}><span>{filtrados.length} resultado{filtrados.length!==1?"s":""}</span><span style={{fontWeight:700,color:"#7C3AED"}}>Valor: {fmt(totalFiltrado)}</span></div>}
        </div>
      )}
      <div style={{padding:"10px 16px 40px",display:"flex",flexDirection:"column",gap:8}}>
        {productos.length===0&&!showForm&&<div style={{textAlign:"center",padding:"32px 0",color:"#9CA3AF"}}><Package size={36} style={{margin:"0 auto 12px",display:"block",opacity:.2}}/><div style={{fontSize:13}}>Sin productos en esta bodega</div></div>}
        {filtrados.length===0&&productos.length>0&&<div style={{textAlign:"center",padding:"20px 0",color:"#9CA3AF",fontSize:12}}>Sin resultados</div>}
        {filtrados.map(p=>(
          <div key={p.id} style={{background:"#fff",borderRadius:14,padding:"12px 14px",border:"1px solid #F0F0F0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:4}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#111"}}>{p.nombre}</span>
                  <span style={{fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:20,background:catColorLocal(p.categoria)+"18",color:catColorLocal(p.categoria)}}>{p.categoria}</span>
                  {p.estado&&<span style={{fontSize:9,fontWeight:600,padding:"2px 7px",borderRadius:20,background:EP_BG[p.estado]||"#F3F4F6",color:EP_COLOR[p.estado]||"#6B7280"}}>{p.estado}</span>}
                </div>
                {p.proveedor&&<div style={{fontSize:10,color:"#9CA3AF",marginBottom:3}}>Proveedor: {p.proveedor}</div>}
                <div style={{fontSize:10,color:"#6B7280"}}>{p.cantidad} {p.unidad} × {fmt(p.precio)} · {p.fechaIngreso}</div>
                {p.notas&&<div style={{fontSize:11,color:"#374151",background:"#F9FAFB",borderRadius:8,padding:"6px 9px",marginTop:4,fontStyle:"italic"}}>"{p.notas}"</div>}
                {p.agregadoPor&&<div style={{fontSize:9,color:"#9CA3AF",marginTop:4}}>Agregado por <strong style={{color:"#6B7280"}}>{p.agregadoPor}</strong></div>}
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
                <span style={{fontSize:14,fontWeight:700,color:"#7C3AED"}}>{fmt(p.precio*p.cantidad)}</span>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  {/* Egreso — todos los roles */}
                  <button onClick={()=>{setEgresoId(egresoId===p.id?null:p.id);setEgresoForm({cantidad:"",notas:""});setEgresoErr("");setConfirmDel(null);}}
                    style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:7,padding:"3px 8px",fontSize:10,fontWeight:600,cursor:"pointer",color:"#C2410C"}}>
                    Egreso
                  </button>
                  {/* Eliminar — solo admin y administrativo */}
                  {canDelete&&(
                    <button onClick={()=>{setConfirmDel(confirmDel===p.id?null:p.id);setEgresoId(null);}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:0}}>
                      <X size={12} color="#9CA3AF"/>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Formulario egreso inline */}
            {egresoId===p.id&&(
              <div style={{marginTop:10,background:"#FFF7ED",borderRadius:10,padding:"12px",border:"1px solid #FED7AA",display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#C2410C"}}>📤 Registrar egreso</div>
                  <button onClick={()=>setEgresoId(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",display:"flex",padding:0}}><X size={13}/></button>
                </div>
                {/* Info del usuario */}
                <div style={{background:"#fff",borderRadius:8,padding:"8px 10px",display:"flex",alignItems:"center",gap:7,border:"1px solid #FED7AA"}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:co.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:9,fontWeight:700,flexShrink:0}}>{user?.name?.charAt(0)||"?"}</div>
                  <span style={{fontSize:11,color:"#6B7280"}}>Registrando como <strong style={{color:"#374151"}}>{user?.name||"—"}</strong></span>
                  <span style={{marginLeft:"auto",fontSize:10,color:"#9CA3AF"}}>Disponible: <strong style={{color:"#374151"}}>{p.cantidad} {p.unidad}</strong></span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div>
                    <div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Cantidad a egresar *</div>
                    <input
                      placeholder={`0 – ${p.cantidad}`}
                      value={egresoForm.cantidad}
                      onChange={e=>setEgresoForm({...egresoForm,cantidad:e.target.value})}
                      style={{border:"1px solid #FED7AA",borderRadius:9,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box"}}
                    />
                  </div>
                  <div>
                    <div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Quedarán en bodega</div>
                    <div style={{border:"1px solid #E5E7EB",borderRadius:9,padding:"8px 10px",fontSize:12,background:"#F9FAFB",color:"#374151",fontWeight:600}}>
                      {(()=>{const r=p.cantidad-(parseFloat(String(egresoForm.cantidad).replace(/,/g,""))||0);return r<0?<span style={{color:"#DC2626"}}>Excede stock</span>:`${r} ${p.unidad}`;})()}
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Notas opcionales</div>
                  <textarea
                    placeholder="Motivo del egreso, destino, observaciones…"
                    value={egresoForm.notas}
                    onChange={e=>setEgresoForm({...egresoForm,notas:e.target.value})}
                    rows={2}
                    style={{border:"1px solid #FED7AA",borderRadius:9,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}}
                  />
                </div>
                {egresoErr&&<div style={{fontSize:11,color:"#DC2626",background:"#FEF2F2",padding:"6px 10px",borderRadius:8}}>{egresoErr}</div>}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={registrarEgreso} style={{flex:1,background:"#EA580C",color:"#fff",border:"none",borderRadius:9,padding:"9px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Confirmar egreso</button>
                  <button onClick={()=>{setEgresoId(null);setEgresoErr("");}} style={{padding:"9px 14px",border:"1px solid #E5E7EB",borderRadius:9,background:"#fff",fontSize:12,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
                </div>
              </div>
            )}

            {/* Confirmar eliminación — solo canDelete */}
            {confirmDel===p.id&&canDelete&&(
              <div style={{marginTop:8,background:"#FEF2F2",borderRadius:8,padding:"8px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                <span style={{fontSize:11,color:"#DC2626"}}>¿Eliminar este producto permanentemente?</span>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>eliminar(p.id)} style={{background:"#DC2626",color:"#fff",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Eliminar</button>
                  <button onClick={()=>setConfirmDel(null)} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:6,padding:"4px 8px",fontSize:11,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtrados.length>0&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#F5F3FF",borderRadius:12}}><span style={{fontSize:12,fontWeight:600,color:"#374151"}}>Total bodega</span><span style={{fontSize:15,fontWeight:700,color:"#7C3AED"}}>{fmt(totalGeneral)}</span></div>}

        {/* ── HISTORIAL DE MOVIMIENTOS ──────────────────────────────────── */}
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #F0F0F0",overflow:"hidden",marginTop:4}}>
          <button onClick={()=>setShowHistorial(!showHistorial)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:"none",border:"none",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:13,fontWeight:700,color:"#111"}}>Historial de movimientos</div>
              {historialMov.length>0&&<span style={{fontSize:11,fontWeight:600,background:co.color+"18",color:co.color,padding:"2px 8px",borderRadius:20}}>{historialMov.length}</span>}
            </div>
            {showHistorial?<ChevronUp size={16} color="#9CA3AF"/>:<ChevronDown size={16} color="#9CA3AF"/>}
          </button>
          {showHistorial&&(
            <div style={{borderTop:"1px solid #F3F4F6",padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
              {historialMov.length===0&&<div style={{textAlign:"center",padding:"16px 0",color:"#9CA3AF",fontSize:12}}>Sin movimientos registrados aún</div>}
              {historialMov.map(m=>{
                const tipoMap={
                  entrada: {label:"Entrada",emoji:"📥",c:"#059669",bg:"#F0FDF4",border:"#BBF7D0"},
                  egreso:  {label:"Egreso", emoji:"📤",c:"#C2410C",bg:"#FFF7ED",border:"#FED7AA"},
                  eliminacion:{label:"Eliminado",emoji:"🗑",c:"#DC2626",bg:"#FEF2F2",border:"#FECACA"},
                };
                const t=tipoMap[m.tipo]||tipoMap.entrada;
                return(
                  <div key={m.id} style={{background:t.bg,borderRadius:12,padding:"10px 12px",border:`1px solid ${t.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
                          <span style={{fontSize:10,fontWeight:700,color:t.c}}>{t.emoji} {t.label}</span>
                          <span style={{fontSize:12,fontWeight:600,color:"#111"}}>{m.productoNombre}</span>
                          <span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:catColorLocal(m.categoria)+"20",color:catColorLocal(m.categoria)}}>{m.categoria}</span>
                        </div>
                        <div style={{fontSize:11,color:"#374151",marginBottom:4}}>
                          <strong style={{color:t.c}}>{m.tipo==="entrada"?"+":"-"}{m.cantidad} {m.unidad}</strong>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:18,height:18,borderRadius:"50%",background:co.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:8,fontWeight:700,flexShrink:0}}>
                            {m.usuario?.name?.charAt(0)||"?"}
                          </div>
                          <span style={{fontSize:10,color:"#6B7280"}}>{m.usuario?.name||"—"} · {roleLabel(m.usuario?.role)}</span>
                        </div>
                        {m.notas&&m.notas!=="Producto eliminado"&&<div style={{fontSize:10,color:"#374151",fontStyle:"italic",marginTop:4}}>"{m.notas}"</div>}
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:10,fontWeight:600,color:"#374151"}}>{m.fecha?.split(",")[0]||""}</div>
                        <div style={{fontSize:9,color:"#9CA3AF"}}>{m.fecha?.split(",")[1]?.trim()||""}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── PRODUCTIVIDAD ─────────────────────────────────────────────────────────────
function ProductividadView({tareas,setTareas,co,users,user}){
  const [newForm,setNewForm]=useState(false);
  const [form,setForm]=useState({titulo:"",descripcion:"",usuarioId:"",tiempoEstimado:"",prioridad:"media"});
  const [err,setErr]=useState("");
  const [,setTick]=useState(0);
  const [confirmDel,setConfirmDel]=useState(null);
  const [filtro,setFiltro]=useState("todas");
  // Filtros avanzados — solo para admin y administrativo
  const [filtroUsuario,setFiltroUsuario]=useState("todos");
  const [filtroDesde,setFiltroDesde]=useState("");
  const [filtroHasta,setFiltroHasta]=useState("");

  useEffect(()=>{ const iv=setInterval(()=>setTick(t=>t+1),1000); return()=>clearInterval(iv); },[]);
  const userList=users[co.id];

  // Roles con acceso a filtros avanzados
  const puedeVerTodos=user?.role==="admin"||user?.role==="administrativo";

  // Si el usuario no puede ver todos, solo ve sus propias tareas
  const tareasBase=puedeVerTodos
    ?tareas
    :tareas.filter(t=>t.usuarioId===user?.id);

  const crear=()=>{
    if(!form.titulo||!form.usuarioId||!form.tiempoEstimado){setErr("Título, usuario y tiempo son obligatorios.");return;}
    const min=parseFloat(form.tiempoEstimado);
    if(isNaN(min)||min<=0){setErr("Tiempo estimado inválido.");return;}
    setTareas(prev=>[{id:Date.now(),titulo:form.titulo,descripcion:form.descripcion,usuarioId:Number(form.usuarioId),tiempoEstimado:min,prioridad:form.prioridad,estado:"pendiente",creadoEn:now(),iniciadoEn:null,finalizadoEn:null,tiempoAcumulado:0},...prev]);
    setForm({titulo:"",descripcion:"",usuarioId:"",tiempoEstimado:"",prioridad:"media"});setNewForm(false);setErr("");
  };
  const iniciar  =id=>setTareas(prev=>prev.map(t=>t.id===id?{...t,estado:"en progreso",iniciadoEn:Date.now()}:t));
  const pausar   =id=>setTareas(prev=>prev.map(t=>t.id===id?{...t,estado:"pausada",tiempoAcumulado:(t.tiempoAcumulado||0)+(Date.now()-t.iniciadoEn),iniciadoEn:null}:t));
  const reanudar =id=>setTareas(prev=>prev.map(t=>t.id===id?{...t,estado:"en progreso",iniciadoEn:Date.now()}:t));
  const finalizar=id=>setTareas(prev=>prev.map(t=>{ if(t.id!==id)return t; const e=getElapsedSec(t); return{...t,estado:"completada",finalizadoEn:Date.now(),tiempoReal:e}; }));
  const eliminar =id=>{setTareas(prev=>prev.filter(t=>t.id!==id));setConfirmDel(null);};

  const getElapsedSec=t=>{
    if(t.estado==="completada"&&t.tiempoReal!=null)return t.tiempoReal;
    const a=t.tiempoAcumulado||0;
    if(t.estado==="en progreso"&&t.iniciadoEn)return Math.floor(a/1000+(Date.now()-t.iniciadoEn)/1000);
    return Math.floor(a/1000);
  };
  const fmtTime=s=>{if(s<0)s=0;const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return h>0?`${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;};
  const getPct  =t=>{const e=getElapsedSec(t),tot=t.tiempoEstimado*60;return tot>0?(e/tot)*100:0;};
  const isOver  =t=>getElapsedSec(t)>t.tiempoEstimado*60;
  const barColor=p=>p>=100?"#DC2626":p>=80?"#D97706":"#059669";
  const prioColor={alta:"#DC2626",media:"#D97706",baja:"#059669"};
  const prioBg={alta:"#FEF2F2",media:"#FFFBEB",baja:"#F0FDF4"};
  const enP=tareasBase.filter(t=>t.estado==="en progreso");
  const comp=tareasBase.filter(t=>t.estado==="completada");
  const aT=comp.filter(t=>(t.tiempoReal||0)<=t.tiempoEstimado*60);
  const atras=tareasBase.filter(t=>t.estado==="en progreso"&&isOver(t));

  // Aplicar filtros sobre tareasBase
  const filtradas=(()=>{
    let r=filtro==="todas"?tareasBase:tareasBase.filter(t=>t.estado===filtro);
    // Filtro por usuario (solo si puedeVerTodos)
    if(puedeVerTodos&&filtroUsuario!=="todos")
      r=r.filter(t=>t.usuarioId===Number(filtroUsuario));
    // Filtro por fecha de creación
    if(filtroDesde)
      r=r.filter(t=>{
        const d=new Date((t.creadoEn||"").slice(0,10));
        return !isNaN(d)&&d>=new Date(filtroDesde);
      });
    if(filtroHasta)
      r=r.filter(t=>{
        const d=new Date((t.creadoEn||"").slice(0,10));
        return !isNaN(d)&&d<=new Date(filtroHasta+"T23:59:59");
      });
    return r;
  })();

  return(
    <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{fontSize:17,fontWeight:700,color:"#111"}}>Productividad</div><div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>Asigna y cronometra actividades del equipo</div></div>
        <button onClick={()=>{setNewForm(!newForm);setErr("");}} style={{background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0}}><Plus size={13}/> Nueva tarea</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        {[[tareas.length,"Total","#374151"],[enP.length,"En curso",co.color],[aT.length,"A tiempo","#059669"],[atras.length,"Atrasadas","#DC2626"]].map(([v,l,c])=>(
          <div key={l} style={{background:"#fff",borderRadius:12,padding:"12px 6px",border:"1px solid #F0F0F0",textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:c,lineHeight:1}}>{v}</div><div style={{fontSize:9,color:"#9CA3AF",marginTop:4}}>{l}</div></div>
        ))}
      </div>
      {atras.length>0&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}><div style={{width:8,height:8,borderRadius:"50%",background:"#DC2626",flexShrink:0}}/><span style={{fontSize:12,color:"#DC2626",fontWeight:600}}>{atras.length} {atras.length===1?"tarea atrasada":"tareas atrasadas"}</span></div>}
      {newForm&&(
        <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1.5px solid "+co.color,display:"flex",flexDirection:"column",gap:10}}>
          <input placeholder="Título de la actividad *" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          <input placeholder="Descripción (opcional)" value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
          <select value={form.usuarioId} onChange={e=>setForm({...form,usuarioId:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",color:form.usuarioId?"#111":"#9CA3AF"}}>
            <option value="">Asignar a usuario *</option>
            {userList.map(u=><option key={u.id} value={u.id}>{u.name} — {roleLabel(u.role)}</option>)}
          </select>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div><div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Tiempo estimado (min) *</div><input type="number" min="1" placeholder="60" value={form.tiempoEstimado} onChange={e=>setForm({...form,tiempoEstimado:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/></div>
            <div><div style={{fontSize:11,color:"#6B7280",marginBottom:4}}>Prioridad</div><select value={form.prioridad} onChange={e=>setForm({...form,prioridad:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%"}}><option value="alta">🔴 Alta</option><option value="media">🟡 Media</option><option value="baja">🟢 Baja</option></select></div>
          </div>
          {err&&<div style={{fontSize:12,color:"#DC2626",background:"#FEF2F2",padding:"8px 12px",borderRadius:8}}>{err}</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={crear} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Crear tarea</button>
            <button onClick={()=>{setNewForm(false);setErr("");}} style={{padding:"10px 16px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff",fontSize:13,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
          </div>
        </div>
      )}
      {tareasBase.length>0&&(
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
          {[["todas","Todas"],["pendiente","Pendientes"],["en progreso","En curso"],["pausada","Pausadas"],["completada","Completadas"]].map(([k,l])=>(
            <button key={k} onClick={()=>setFiltro(k)} style={{padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:600,border:"none",cursor:"pointer",whiteSpace:"nowrap",background:filtro===k?co.color:"#F3F4F6",color:filtro===k?"#fff":"#6B7280",flexShrink:0}}>{l}</button>
          ))}
        </div>
      )}

      {/* Filtros avanzados — solo admin y administrativo */}
      {puedeVerTodos&&tareasBase.length>0&&(
        <div style={{background:"#fff",borderRadius:14,padding:"12px 14px",border:"1px solid #F0F0F0",display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:11,fontWeight:600,color:"#374151"}}>Filtros avanzados</div>
            {(filtroUsuario!=="todos"||filtroDesde||filtroHasta)&&(
              <button onClick={()=>{setFiltroUsuario("todos");setFiltroDesde("");setFiltroHasta("");}} style={{fontSize:10,color:co.color,fontWeight:600,background:"none",border:"none",cursor:"pointer",padding:0}}>
                Limpiar filtros
              </button>
            )}
          </div>
          {/* Filtro por usuario */}
          <div>
            <div style={{fontSize:10,color:"#6B7280",marginBottom:4}}>Por usuario</div>
            <select
              value={filtroUsuario}
              onChange={e=>setFiltroUsuario(e.target.value)}
              style={{border:"1px solid #E5E7EB",borderRadius:9,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",color:filtroUsuario!=="todos"?co.color:"#374151",fontWeight:filtroUsuario!=="todos"?600:400}}
            >
              <option value="todos">Todos los usuarios</option>
              {userList.map(u=><option key={u.id} value={u.id}>{u.name} — {roleLabel(u.role)}</option>)}
            </select>
          </div>
          {/* Filtro por fecha */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div>
              <div style={{fontSize:10,color:"#6B7280",marginBottom:4}}>Desde</div>
              <input
                type="date"
                value={filtroDesde}
                onChange={e=>setFiltroDesde(e.target.value)}
                style={{border:`1px solid ${filtroDesde?co.color:"#E5E7EB"}`,borderRadius:9,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",color:filtroDesde?co.color:"#374151",fontWeight:filtroDesde?600:400}}
              />
            </div>
            <div>
              <div style={{fontSize:10,color:"#6B7280",marginBottom:4}}>Hasta</div>
              <input
                type="date"
                value={filtroHasta}
                onChange={e=>setFiltroHasta(e.target.value)}
                style={{border:`1px solid ${filtroHasta?co.color:"#E5E7EB"}`,borderRadius:9,padding:"8px 10px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",color:filtroHasta?co.color:"#374151",fontWeight:filtroHasta?600:400}}
              />
            </div>
          </div>
          {/* Resumen del filtro activo */}
          {(filtroUsuario!=="todos"||filtroDesde||filtroHasta)&&(
            <div style={{background:co.color+"10",borderRadius:9,padding:"7px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#6B7280"}}>
                {filtradas.length} tarea{filtradas.length!==1?"s":""} encontrada{filtradas.length!==1?"s":""}
              </span>
              {filtroUsuario!=="todos"&&(
                <span style={{fontSize:11,fontWeight:600,color:co.color}}>
                  {userList.find(u=>u.id===Number(filtroUsuario))?.name||"—"}
                </span>
              )}
            </div>
          )}
        </div>
      )}
      {tareasBase.length===0&&!newForm&&<div style={{textAlign:"center",padding:"48px 16px",color:"#9CA3AF"}}><Timer size={44} style={{margin:"0 auto 14px",display:"block",opacity:.25}}/><div style={{fontSize:13,fontWeight:500}}>Sin tareas asignadas</div></div>}
      {filtradas.map(tarea=>{
        const elapsed=getElapsedSec(tarea),pct=getPct(tarea),over=isOver(tarea);
        const isLive=tarea.estado==="en progreso",isDone=tarea.estado==="completada",isPaused=tarea.estado==="pausada",isPending=tarea.estado==="pendiente";
        const remaining=tarea.tiempoEstimado*60-elapsed;
        const bColor=isDone?(tarea.tiempoReal<=tarea.tiempoEstimado*60?"#059669":"#DC2626"):barColor(pct);
        const u=userList.find(x=>x.id===tarea.usuarioId);
        return(
          <div key={tarea.id} style={{background:"#fff",borderRadius:16,padding:"16px",border:`1.5px solid ${isLive&&over?"#DC2626":isLive?co.color+"55":"#F0F0F0"}`,boxShadow:isLive?`0 0 0 3px ${over?"#DC262622":co.color+"11"}`:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{flex:1,paddingRight:8}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:4}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#111"}}>{tarea.titulo}</span>
                  <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:prioBg[tarea.prioridad],color:prioColor[tarea.prioridad]}}>{tarea.prioridad}</span>
                </div>
                {tarea.descripcion&&<div style={{fontSize:11,color:"#6B7280",marginBottom:5}}>{tarea.descripcion}</div>}
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:co.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:9,fontWeight:700,flexShrink:0}}>{u?.name?.charAt(0)||"?"}</div>
                  <span style={{fontSize:11,color:"#374151",fontWeight:500}}>{u?.name||"Sin asignar"}</span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                <span style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:20,whiteSpace:"nowrap",
                  background:isDone?(over?"#FEF2F2":"#D1FAE5"):isLive?(over?"#FEF2F2":"#DBEAFE"):isPaused?"#FEF3C7":"#F3F4F6",
                  color:isDone?(over?"#DC2626":"#065F46"):isLive?(over?"#DC2626":"#1E40AF"):isPaused?"#92400E":"#374151"}}>
                  {isDone?(over?"✗ Con atraso":"✓ A tiempo"):isLive?(over?"⚠ Atrasada":"⏱ En curso"):isPaused?"⏸ Pausada":"○ Pendiente"}
                </span>
                {(isDone||isPending)&&<button onClick={()=>setConfirmDel(confirmDel===tarea.id?null:tarea.id)} style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"3px 6px",cursor:"pointer",display:"flex"}}><X size={12} color="#DC2626"/></button>}
              </div>
            </div>
            {confirmDel===tarea.id&&(
              <div style={{marginBottom:10,background:"#FEF2F2",borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                <span style={{fontSize:12,color:"#DC2626",fontWeight:500}}>¿Eliminar esta tarea?</span>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>eliminar(tarea.id)} style={{background:"#DC2626",color:"#fff",border:"none",borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Eliminar</button>
                  <button onClick={()=>setConfirmDel(null)} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
                </div>
              </div>
            )}
            {!isPending&&(
              <div style={{background:over&&!isDone?"#FFF0F0":isDone&&over?"#FFF0F0":isDone?"#F0FDF4":isLive?"#F0F9FF":"#F9FAFB",borderRadius:14,padding:"14px 16px",marginBottom:10,textAlign:"center",border:`1px solid ${over?"#FECACA":isDone&&!over?"#BBF7D0":"#F0F0F0"}`}}>
                <div style={{fontSize:9,color:"#9CA3AF",marginBottom:6,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600}}>{isDone?"Tiempo real empleado":"Tiempo transcurrido"}</div>
                <div style={{fontSize:38,fontWeight:700,fontFamily:"'Courier New',monospace",letterSpacing:3,color:over?(isDone?"#DC2626":"#DC2626"):isLive?co.color:isPaused?"#D97706":"#374151",lineHeight:1}}>{fmtTime(elapsed)}</div>
                <div style={{fontSize:10,color:"#9CA3AF",marginTop:8,display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
                  <span>Est: <strong style={{color:"#374151"}}>{fmtTime(tarea.tiempoEstimado*60)}</strong></span>
                  {!isDone&&!over&&<span style={{color:"#059669"}}>⏳ Resta {fmtTime(Math.max(remaining,0))}</span>}
                  {!isDone&&over&&<span style={{color:"#DC2626",fontWeight:600}}>⚠ +{fmtTime(Math.abs(remaining))} de atraso</span>}
                  {isDone&&!over&&<span style={{color:"#059669",fontWeight:600}}>✓ A tiempo</span>}
                  {isDone&&over&&<span style={{color:"#DC2626",fontWeight:600}}>+{fmtTime(Math.abs(remaining))} de atraso</span>}
                </div>
              </div>
            )}
            {isPending&&<div style={{background:"#F9FAFB",borderRadius:12,padding:"10px 14px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11,color:"#6B7280"}}>Tiempo estimado</span><span style={{fontSize:14,fontWeight:700,color:"#374151",fontFamily:"monospace"}}>{fmtTime(tarea.tiempoEstimado*60)}</span></div>}
            {!isPending&&(
              <div style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#9CA3AF",marginBottom:4}}><span>Progreso</span><span style={{fontWeight:700,color:bColor}}>{Math.round(Math.min(pct,100))}%{pct>100?" (superado)":""}</span></div>
                <div style={{height:8,background:"#F3F4F6",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:bColor,borderRadius:99}}/></div>
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              {isPending&&<button onClick={()=>iniciar(tarea.id)} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Play size={13}/> Iniciar</button>}
              {isLive&&<><button onClick={()=>pausar(tarea.id)} style={{flex:1,background:"#FFFBEB",color:"#92400E",border:"1px solid #FDE68A",borderRadius:10,padding:"10px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Pause size={13}/> Pausar</button><button onClick={()=>finalizar(tarea.id)} style={{flex:1,background:"#059669",color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><CheckCircle2 size={13}/> Finalizar</button></>}
              {isPaused&&<><button onClick={()=>reanudar(tarea.id)} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Play size={13}/> Reanudar</button><button onClick={()=>finalizar(tarea.id)} style={{flex:1,background:"#059669",color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><CheckCircle2 size={13}/> Finalizar</button></>}
            </div>
            <div style={{fontSize:9,color:"#C4B5A5",marginTop:8,textAlign:"right"}}>Creada: {tarea.creadoEn}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── APP PRINCIPAL ─────────────────────────────────────────────────────────────
// ── VEHÍCULOS (SAE exclusivo) ─────────────────────────────────────────────────
const VEH_ESTADOS=["Disponible","En uso","En mantenimiento","Baja"];
const VEH_EST_COLOR={"Disponible":"#059669","En uso":"#1A73E8","En mantenimiento":"#D97706","Baja":"#6B7280"};
const VEH_EST_BG={"Disponible":"#D1FAE5","En uso":"#DBEAFE","En mantenimiento":"#FEF3C7","Baja":"#F3F4F6"};

function VehiculosView({vehiculos,setVehiculos,co,users,user}){
  const [vista,setVista]=useState(null); // null=lista, id=detalle
  const [newForm,setNewForm]=useState(false);
  const [vForm,setVForm]=useState({placa:"",marca:"",modelo:"",año:"",color:"",estado:"Disponible",notas:""});
  const [vErr,setVErr]=useState("");
  const [confirmDelV,setConfirmDelV]=useState(null);

  const userList=users[co.id]||[];

  const crearVehiculo=()=>{
    if(!vForm.placa||!vForm.marca){setVErr("Placa y marca son obligatorios.");return;}
    setVehiculos(prev=>[...prev,{
      id:Date.now(), placa:vForm.placa.toUpperCase(), marca:vForm.marca,
      modelo:vForm.modelo, año:vForm.año, color:vForm.color,
      estado:vForm.estado, notas:vForm.notas,
      asignacionActual:null, historial:[], creadoEn:now()
    }]);
    setVForm({placa:"",marca:"",modelo:"",año:"",color:"",estado:"Disponible",notas:""});
    setNewForm(false);setVErr("");
  };
  const eliminarVehiculo=id=>{
    setVehiculos(prev=>prev.filter(v=>v.id!==id));
    if(vista===id)setVista(null);
    setConfirmDelV(null);
  };

  if(vista!==null){
    const v=vehiculos.find(x=>x.id===vista);
    if(!v){setVista(null);return null;}
    return <VehiculoDetalle vehiculo={v} setVehiculos={setVehiculos} co={co} userList={userList} currentUser={user} onBack={()=>setVista(null)}/>;
  }

  const enUso=vehiculos.filter(v=>v.estado==="En uso").length;
  const disponibles=vehiculos.filter(v=>v.estado==="Disponible").length;

  return(
    <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:"#111"}}>Flota Vehicular</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>Control de vehículos y asignaciones</div>
        </div>
        <button onClick={()=>{setNewForm(!newForm);setVErr("");}} style={{background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <Plus size={13}/> Nuevo vehículo
        </button>
      </div>

      {/* KPIs */}
      {vehiculos.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[[vehiculos.length,"Total","#374151"],[disponibles,"Disponibles","#059669"],[enUso,"En uso","#1A73E8"]].map(([v,l,c])=>(
            <div key={l} style={{background:"#fff",borderRadius:12,padding:"12px 8px",border:"1px solid #F0F0F0",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:700,color:c,lineHeight:1}}>{v}</div>
              <div style={{fontSize:9,color:"#9CA3AF",marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario nuevo vehículo */}
      {newForm&&(
        <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1.5px solid "+co.color,display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:13,fontWeight:600,color:"#374151"}}>Nuevo vehículo</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div>
              <div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Placa *</div>
              <input placeholder="ABC-123" value={vForm.placa} onChange={e=>setVForm({...vForm,placa:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box",textTransform:"uppercase"}}/>
            </div>
            <div>
              <div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Marca *</div>
              <input placeholder="Toyota, Ford…" value={vForm.marca} onChange={e=>setVForm({...vForm,marca:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Modelo</div>
              <input placeholder="Corolla, Ranger…" value={vForm.modelo} onChange={e=>setVForm({...vForm,modelo:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Año</div>
              <input placeholder="2022" value={vForm.año} onChange={e=>setVForm({...vForm,año:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Color</div>
              <input placeholder="Blanco, Negro…" value={vForm.color} onChange={e=>setVForm({...vForm,color:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Estado inicial</div>
              <select value={vForm.estado} onChange={e=>setVForm({...vForm,estado:e.target.value})} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",width:"100%"}}>
                {VEH_ESTADOS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Notas opcionales</div>
            <textarea placeholder="Observaciones del vehículo…" value={vForm.notas} onChange={e=>setVForm({...vForm,notas:e.target.value})} rows={2} style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}}/>
          </div>
          {vErr&&<div style={{fontSize:12,color:"#DC2626",background:"#FEF2F2",padding:"8px 12px",borderRadius:8}}>{vErr}</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={crearVehiculo} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Guardar vehículo</button>
            <button onClick={()=>{setNewForm(false);setVErr("");}} style={{padding:"10px 16px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff",fontSize:13,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
          </div>
        </div>
      )}

      {vehiculos.length===0&&!newForm&&(
        <div style={{textAlign:"center",padding:"52px 16px",color:"#9CA3AF"}}>
          <Car size={48} style={{margin:"0 auto 14px",display:"block",opacity:.2}}/>
          <div style={{fontSize:13,fontWeight:500}}>Sin vehículos registrados</div>
          <div style={{fontSize:11,marginTop:4}}>Agrega el primer vehículo de la flota</div>
        </div>
      )}

      {/* Lista de vehículos */}
      {vehiculos.map(v=>(
        <div key={v.id} style={{background:"#fff",borderRadius:16,border:"1px solid #F0F0F0",overflow:"hidden"}}>
          <div style={{padding:"14px 16px",cursor:"pointer"}} onClick={()=>setVista(v.id)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
                <div style={{width:40,height:40,borderRadius:12,background:co.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Car size={18} color={co.color}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                    <span style={{fontSize:14,fontWeight:700,color:"#111"}}>{v.placa}</span>
                    <span style={{fontSize:11,color:"#6B7280"}}>{v.marca} {v.modelo} {v.año}</span>
                  </div>
                  {v.color&&<div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>{v.color}</div>}
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
                <span style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,background:VEH_EST_BG[v.estado]||"#F3F4F6",color:VEH_EST_COLOR[v.estado]||"#374151"}}>{v.estado}</span>
                <button onClick={()=>setConfirmDelV(confirmDelV===v.id?null:v.id)} style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"4px 7px",cursor:"pointer",display:"flex"}}><X size={12} color="#DC2626"/></button>
              </div>
            </div>
            {v.asignacionActual&&(
              <div style={{marginTop:10,background:"#EFF6FF",borderRadius:10,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:co.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:10,fontWeight:700,flexShrink:0}}>
                  {v.asignacionActual.usuarioNombre?.charAt(0)||"?"}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#1E40AF"}}>{v.asignacionActual.usuarioNombre}</div>
                  <div style={{fontSize:10,color:"#6B7280"}}>Tomó: {v.asignacionActual.fechaToma} {v.asignacionActual.horaToma}</div>
                </div>
              </div>
            )}
            {v.notas&&!v.asignacionActual&&(
              <div style={{marginTop:8,fontSize:11,color:"#6B7280",fontStyle:"italic"}}>"{v.notas}"</div>
            )}
            {confirmDelV!==v.id&&(
              <div style={{marginTop:10,fontSize:11,color:co.color,fontWeight:600,textAlign:"right"}}>Ver detalle →</div>
            )}
          </div>
          {confirmDelV===v.id&&(
            <div style={{margin:"0 14px 12px",background:"#FEF2F2",borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
              <span style={{fontSize:12,color:"#DC2626",fontWeight:500}}>¿Eliminar este vehículo?</span>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>eliminarVehiculo(v.id)} style={{background:"#DC2626",color:"#fff",border:"none",borderRadius:8,padding:"5px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Eliminar</button>
                <button onClick={()=>setConfirmDelV(null)} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function VehiculoDetalle({vehiculo,setVehiculos,co,userList,currentUser,onBack}){
  const [showIniciar,setShowIniciar]=useState(false);
  const [showFinalizar,setShowFinalizar]=useState(false);
  const [showEditEstado,setShowEditEstado]=useState(false);
  const [showHistorial,setShowHistorial]=useState(true);
  const [comentarioInicio,setComentarioInicio]=useState("");
  const [comentarioFin,setComentarioFin]=useState("");

  const enUso=vehiculo.estado==="En uso";

  // ── Captura fecha/hora exacta del sistema ─────────────────────────────────
  const getFecha=()=>new Date().toLocaleDateString("es-MX",{day:"2-digit",month:"2-digit",year:"numeric"});
  const getHora=()=>new Date().toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
  const getFechaISO=()=>new Date().toISOString().slice(0,10);

  const iniciarUso=()=>{
    const d=new Date();
    setVehiculos(prev=>prev.map(v=>v.id===vehiculo.id?{
      ...v,
      estado:"En uso",
      asignacionActual:{
        iniciadoPorId:    currentUser.id,
        iniciadoPorNombre:currentUser.name,
        iniciadoPorRol:   currentUser.role,
        fecha:            getFecha(),
        fechaISO:         getFechaISO(),
        hora:             getHora(),
        timestamp:        d.getTime(),
        comentario:       comentarioInicio,
      }
    }:v));
    setShowIniciar(false);
    setComentarioInicio("");
  };

  const finalizarUso=()=>{
    const asig=vehiculo.asignacionActual;
    const d=new Date();
    const registro={
      id:              Date.now(),
      // quién inició
      iniciadoPorId:    asig.iniciadoPorId,
      iniciadoPorNombre:asig.iniciadoPorNombre,
      iniciadoPorRol:   asig.iniciadoPorRol,
      fechaInicio:      asig.fecha,
      horaInicio:       asig.hora,
      timestampInicio:  asig.timestamp,
      comentarioInicio: asig.comentario||"",
      // quién finalizó
      finalizadoPorId:    currentUser.id,
      finalizadoPorNombre:currentUser.name,
      finalizadoPorRol:   currentUser.role,
      fechaFin:           getFecha(),
      horaFin:            getHora(),
      timestampFin:       d.getTime(),
      comentarioFin:      comentarioFin,
    };
    setVehiculos(prev=>prev.map(v=>v.id===vehiculo.id?{
      ...v,
      estado:"Disponible",
      asignacionActual:null,
      historial:[registro,...(v.historial||[])],
    }:v));
    setShowFinalizar(false);
    setComentarioFin("");
  };

  const cambiarEstado=s=>{
    setVehiculos(prev=>prev.map(v=>v.id===vehiculo.id?{...v,estado:s}:v));
    setShowEditEstado(false);
  };

  const historial=vehiculo.historial||[];

  return(
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh",background:"#F5F6FA"}}>

      {/* Header */}
      <div style={{background:co.bg,padding:"16px 20px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.18)",border:"none",borderRadius:20,padding:"5px 12px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:14,display:"inline-flex",alignItems:"center",gap:5}}>← Flota</button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12,flex:1}}>
            <div style={{width:48,height:48,borderRadius:14,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Car size={22} color="#fff"/>
            </div>
            <div>
              <div style={{fontSize:20,fontWeight:700,color:"#fff",letterSpacing:1}}>{vehiculo.placa}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.8)",marginTop:2}}>{vehiculo.marca} {vehiculo.modelo} {vehiculo.año}</div>
              {vehiculo.color&&<div style={{fontSize:11,color:"rgba(255,255,255,.6)",marginTop:1}}>{vehiculo.color}</div>}
            </div>
          </div>
          <button onClick={()=>setShowEditEstado(!showEditEstado)} style={{background:"none",border:"none",cursor:"pointer",padding:0,flexShrink:0}}>
            <span style={{fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:20,background:VEH_EST_BG[vehiculo.estado]||"#F3F4F6",color:VEH_EST_COLOR[vehiculo.estado]||"#374151"}}>{vehiculo.estado}</span>
          </button>
        </div>
        {showEditEstado&&(
          <div style={{marginTop:12,background:"rgba(255,255,255,0.95)",borderRadius:14,padding:"12px 14px"}}>
            <div style={{fontSize:11,color:"#6B7280",fontWeight:600,marginBottom:8}}>Cambiar estado manual</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {VEH_ESTADOS.map(s=>(
                <button key={s} onClick={()=>cambiarEstado(s)} style={{padding:"5px 12px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:"none",background:s===vehiculo.estado?VEH_EST_COLOR[s]:"#F3F4F6",color:s===vehiculo.estado?"#fff":"#374151"}}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{padding:"16px 16px 0",display:"flex",flexDirection:"column",gap:10}}>

        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[
            [vehiculo.estado,"Estado",VEH_EST_COLOR[vehiculo.estado]||"#374151",VEH_EST_BG[vehiculo.estado]||"#F9FAFB"],
            [historial.length,"Usos totales",co.color,co.color+"12"],
            [vehiculo.asignacionActual?.iniciadoPorNombre||"—","En uso por","#374151","#F9FAFB"],
          ].map(([v,l,c,bg])=>(
            <div key={l} style={{background:bg,borderRadius:14,padding:"12px 8px",border:"1px solid #F0F0F0",textAlign:"center"}}>
              <div style={{fontSize:12,fontWeight:700,color:c,lineHeight:1.3,wordBreak:"break-word"}}>{v}</div>
              <div style={{fontSize:9,color:"#9CA3AF",marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Notas del vehículo */}
        {vehiculo.notas&&(
          <div style={{background:"#fff",borderRadius:12,padding:"12px 14px",border:"1px solid #F0F0F0"}}>
            <div style={{fontSize:10,fontWeight:600,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:.5,marginBottom:5}}>Notas del vehículo</div>
            <div style={{fontSize:12,color:"#374151",fontStyle:"italic"}}>"{vehiculo.notas}"</div>
          </div>
        )}

        {/* ── USO ACTIVO ───────────────────────────────────────────────────── */}
        {enUso&&vehiculo.asignacionActual&&(
          <div style={{background:"#EFF6FF",borderRadius:16,padding:"16px",border:"1.5px solid #BFDBFE"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#1E40AF",marginBottom:12}}>🚗 Uso en curso</div>

            {/* Quién inició */}
            <div style={{background:"#fff",borderRadius:12,padding:"11px 13px",marginBottom:10,border:"1px solid #DBEAFE"}}>
              <div style={{fontSize:9,color:"#1E40AF",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:7}}>Iniciado por</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:co.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13,flexShrink:0}}>
                  {vehiculo.asignacionActual.iniciadoPorNombre?.charAt(0)||"?"}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#111"}}>{vehiculo.asignacionActual.iniciadoPorNombre}</div>
                  <div style={{fontSize:10,color:"#6B7280"}}>{roleLabel(vehiculo.asignacionActual.iniciadoPorRol)}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#374151"}}>{vehiculo.asignacionActual.fecha}</div>
                  <div style={{fontSize:10,color:"#9CA3AF"}}>{vehiculo.asignacionActual.hora}</div>
                </div>
              </div>
              {vehiculo.asignacionActual.comentario&&(
                <div style={{marginTop:8,fontSize:11,color:"#374151",fontStyle:"italic",background:"#EFF6FF",borderRadius:8,padding:"6px 10px"}}>
                  "{vehiculo.asignacionActual.comentario}"
                </div>
              )}
            </div>

            {/* Botón finalizar */}
            {!showFinalizar&&(
              <button onClick={()=>setShowFinalizar(true)} style={{width:"100%",background:"#DC2626",color:"#fff",border:"none",borderRadius:10,padding:"11px",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                🏁 Finalizar uso
              </button>
            )}
          </div>
        )}

        {/* Formulario finalizar uso */}
        {showFinalizar&&enUso&&(
          <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1.5px solid #DC2626",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#DC2626"}}>🏁 Finalizar uso</div>
              <button onClick={()=>setShowFinalizar(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",display:"flex",padding:0}}><X size={16}/></button>
            </div>
            {/* Info del usuario que finaliza */}
            <div style={{background:"#FEF2F2",borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"#DC2626",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:11,flexShrink:0}}>
                {currentUser.name?.charAt(0)||"?"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:"#111"}}>{currentUser.name}</div>
                <div style={{fontSize:10,color:"#6B7280"}}>Registrará el cierre ahora · {new Date().toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}</div>
              </div>
            </div>
            <div>
              <div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Comentario al finalizar (opcional)</div>
              <textarea
                placeholder="Estado del vehículo, destino visitado, observaciones…"
                value={comentarioFin}
                onChange={e=>setComentarioFin(e.target.value)}
                rows={3}
                style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}}
              />
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={finalizarUso} style={{flex:1,background:"#DC2626",color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Confirmar finalización</button>
              <button onClick={()=>setShowFinalizar(false)} style={{padding:"10px 14px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff",fontSize:12,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
            </div>
          </div>
        )}

        {/* ── BOTÓN INICIAR USO ─────────────────────────────────────────────── */}
        {!enUso&&vehiculo.estado==="Disponible"&&!showIniciar&&(
          <button onClick={()=>setShowIniciar(true)} style={{width:"100%",background:co.color,color:"#fff",border:"none",borderRadius:12,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <Car size={16}/> Iniciar uso
          </button>
        )}

        {/* Formulario iniciar uso */}
        {showIniciar&&!enUso&&(
          <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1.5px solid "+co.color,display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:13,fontWeight:700,color:co.color}}>🚗 Iniciar uso</div>
              <button onClick={()=>{setShowIniciar(false);setComentarioInicio("");}} style={{background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",display:"flex",padding:0}}><X size={16}/></button>
            </div>
            {/* Info del usuario que toma el vehículo */}
            <div style={{background:co.color+"0F",borderRadius:10,padding:"10px 12px",border:"1px solid "+co.color+"30",display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:co.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13,flexShrink:0}}>
                {currentUser.name?.charAt(0)||"?"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:"#111"}}>{currentUser.name}</div>
                <div style={{fontSize:10,color:"#6B7280"}}>{roleLabel(currentUser.role)} · Registrará el inicio ahora</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:12,fontWeight:600,color:co.color}}>{new Date().toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"})}</div>
                <div style={{fontSize:10,color:"#9CA3AF"}}>{new Date().toLocaleDateString("es-MX",{day:"2-digit",month:"2-digit",year:"numeric"})}</div>
              </div>
            </div>
            <div>
              <div style={{fontSize:10,color:"#6B7280",marginBottom:3}}>Comentario al iniciar (opcional)</div>
              <textarea
                placeholder="Destino, propósito del viaje, observaciones…"
                value={comentarioInicio}
                onChange={e=>setComentarioInicio(e.target.value)}
                rows={3}
                style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}}
              />
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={iniciarUso} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"11px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Confirmar inicio de uso</button>
              <button onClick={()=>{setShowIniciar(false);setComentarioInicio("");}} style={{padding:"11px 14px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff",fontSize:12,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
            </div>
          </div>
        )}

        {/* ── HISTORIAL ────────────────────────────────────────────────────── */}
        <div style={{background:"#fff",borderRadius:16,border:"1px solid #F0F0F0",overflow:"hidden"}}>
          <button onClick={()=>setShowHistorial(!showHistorial)} style={{width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:"none",border:"none",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:13,fontWeight:700,color:"#111"}}>Historial de uso</div>
              {historial.length>0&&<span style={{fontSize:11,fontWeight:600,background:co.color+"18",color:co.color,padding:"2px 8px",borderRadius:20}}>{historial.length} registro{historial.length!==1?"s":""}</span>}
            </div>
            {showHistorial?<ChevronUp size={16} color="#9CA3AF"/>:<ChevronDown size={16} color="#9CA3AF"/>}
          </button>

          {showHistorial&&(
            <div style={{borderTop:"1px solid #F3F4F6",padding:"12px 16px",display:"flex",flexDirection:"column",gap:12}}>
              {historial.length===0&&(
                <div style={{textAlign:"center",padding:"20px 0",color:"#9CA3AF",fontSize:12}}>Sin registros de uso aún</div>
              )}
              {historial.map((r,idx)=>(
                <div key={r.id} style={{background:"#F9FAFB",borderRadius:14,padding:"14px",border:"1px solid #F0F0F0"}}>
                  {/* Número de uso */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <span style={{fontSize:10,fontWeight:700,color:co.color,background:co.color+"15",padding:"2px 8px",borderRadius:20}}>
                      Uso #{historial.length-idx}
                    </span>
                    <span style={{fontSize:10,color:"#9CA3AF"}}>{r.fechaInicio}</span>
                  </div>

                  {/* Inicio */}
                  <div style={{background:"#fff",borderRadius:10,padding:"10px 12px",border:"1px solid #E5E7EB",marginBottom:8}}>
                    <div style={{fontSize:9,fontWeight:700,color:"#059669",textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>🟢 Inicio</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:r.comentarioInicio?6:0}}>
                      <div style={{width:26,height:26,borderRadius:"50%",background:"#059669",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:10,flexShrink:0}}>
                        {r.iniciadoPorNombre?.charAt(0)||"?"}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#111"}}>{r.iniciadoPorNombre}</div>
                        <div style={{fontSize:10,color:"#6B7280"}}>{roleLabel(r.iniciadoPorRol)}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:11,fontWeight:600,color:"#374151"}}>{r.fechaInicio}</div>
                        <div style={{fontSize:10,color:"#9CA3AF"}}>{r.horaInicio}</div>
                      </div>
                    </div>
                    {r.comentarioInicio&&(
                      <div style={{fontSize:11,color:"#374151",fontStyle:"italic",background:"#F0FDF4",borderRadius:8,padding:"6px 9px",marginTop:6}}>
                        "{r.comentarioInicio}"
                      </div>
                    )}
                  </div>

                  {/* Fin */}
                  <div style={{background:"#fff",borderRadius:10,padding:"10px 12px",border:"1px solid #E5E7EB"}}>
                    <div style={{fontSize:9,fontWeight:700,color:"#DC2626",textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>🔴 Cierre</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:r.comentarioFin?6:0}}>
                      <div style={{width:26,height:26,borderRadius:"50%",background:"#DC2626",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:10,flexShrink:0}}>
                        {r.finalizadoPorNombre?.charAt(0)||"?"}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600,color:"#111"}}>{r.finalizadoPorNombre}</div>
                        <div style={{fontSize:10,color:"#6B7280"}}>{roleLabel(r.finalizadoPorRol)}</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontSize:11,fontWeight:600,color:"#374151"}}>{r.fechaFin}</div>
                        <div style={{fontSize:10,color:"#9CA3AF"}}>{r.horaFin}</div>
                      </div>
                    </div>
                    {r.comentarioFin&&(
                      <div style={{fontSize:11,color:"#374151",fontStyle:"italic",background:"#FEF2F2",borderRadius:8,padding:"6px 9px",marginTop:6}}>
                        "{r.comentarioFin}"
                      </div>
                    )}
                  </div>

                  {/* Duración calculada */}
                  {r.timestampInicio&&r.timestampFin&&(()=>{
                    const mins=Math.round((r.timestampFin-r.timestampInicio)/60000);
                    const h=Math.floor(mins/60),m=mins%60;
                    const durStr=h>0?`${h}h ${m}min`:`${m}min`;
                    return(
                      <div style={{marginTop:8,display:"flex",justifyContent:"center"}}>
                        <span style={{fontSize:10,fontWeight:600,color:"#6B7280",background:"#F3F4F6",padding:"3px 10px",borderRadius:20}}>
                          ⏱ Duración: {durStr}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      <div style={{height:40}}/>
    </div>
  );
}


// ── RECORDATORIOS (por usuario, por empresa) ──────────────────────────────────
const REC_PRIORIDAD=[
  {id:"alta",  label:"Alta",  color:"#DC2626", bg:"#FEF2F2", dot:"#DC2626"},
  {id:"media", label:"Media", color:"#D97706", bg:"#FFFBEB", dot:"#D97706"},
  {id:"baja",  label:"Baja",  color:"#059669", bg:"#F0FDF4", dot:"#059669"},
];
const prioMeta=id=>REC_PRIORIDAD.find(p=>p.id===id)||REC_PRIORIDAD[1];
const prioOrder={alta:0,media:1,baja:2};

function RecordatoriosView({recordatorios,setRecordatorios,co,user}){
  const [newForm,setNewForm]=useState(false);
  const [form,setForm]=useState({titulo:"",descripcion:"",prioridad:"media"});
  const [err,setErr]=useState("");
  const [filtro,setFiltro]=useState("pendientes"); // pendientes | completados | todos
  const [confirmDel,setConfirmDel]=useState(null);
  const [editId,setEditId]=useState(null);
  const [editForm,setEditForm]=useState({});

  // Ordenar: prioridad alta→media→baja, luego por fecha desc
  const sorted=[...recordatorios].sort((a,b)=>{
    const pd=(prioOrder[a.prioridad]||1)-(prioOrder[b.prioridad]||1);
    if(pd!==0)return pd;
    return b.creadoTs-a.creadoTs;
  });

  const pendientes=sorted.filter(r=>!r.completado);
  const completados=sorted.filter(r=>r.completado);
  const visibles=filtro==="pendientes"?pendientes:filtro==="completados"?completados:sorted;

  const crear=()=>{
    if(!form.titulo.trim()){setErr("El título es obligatorio.");return;}
    setRecordatorios(prev=>[{
      id:Date.now(),
      titulo:form.titulo.trim(),
      descripcion:form.descripcion.trim(),
      prioridad:form.prioridad,
      completado:false,
      creadoTs:Date.now(),
      creadoEn:now(),
      completadoEn:null,
    },...prev]);
    setForm({titulo:"",descripcion:"",prioridad:"media"});
    setNewForm(false);setErr("");
  };

  const toggleCompletado=id=>{
    setRecordatorios(prev=>prev.map(r=>r.id===id
      ?{...r,completado:!r.completado,completadoEn:!r.completado?now():null}
      :r
    ));
  };

  const eliminar=id=>{
    setRecordatorios(prev=>prev.filter(r=>r.id!==id));
    setConfirmDel(null);
  };

  const guardarEdit=()=>{
    if(!editForm.titulo?.trim()){return;}
    setRecordatorios(prev=>prev.map(r=>r.id===editId?{...r,...editForm,titulo:editForm.titulo.trim(),descripcion:(editForm.descripcion||"").trim()}:r));
    setEditId(null);
  };

  return(
    <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:14}}>

      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:"#111"}}>Recordatorios</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginTop:2}}>Solo tú ves tus recordatorios</div>
        </div>
        <button onClick={()=>{setNewForm(!newForm);setErr("");setEditId(null);}} style={{background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"7px 14px",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <Plus size={13}/> Nuevo
        </button>
      </div>

      {/* KPIs */}
      {recordatorios.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[
            [pendientes.length, "Pendientes", co.color],
            [completados.length,"Completados","#059669"],
            [pendientes.filter(r=>r.prioridad==="alta").length,"Alta prioridad","#DC2626"],
          ].map(([v,l,c])=>(
            <div key={l} style={{background:"#fff",borderRadius:12,padding:"12px 8px",border:"1px solid #F0F0F0",textAlign:"center"}}>
              <div style={{fontSize:22,fontWeight:700,color:c,lineHeight:1}}>{v}</div>
              <div style={{fontSize:9,color:"#9CA3AF",marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario nuevo */}
      {newForm&&(
        <div style={{background:"#fff",borderRadius:16,padding:"16px",border:"1.5px solid "+co.color,display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:13,fontWeight:600,color:"#374151"}}>Nuevo recordatorio</div>
          <input
            placeholder="Título *"
            value={form.titulo}
            onChange={e=>setForm({...form,titulo:e.target.value})}
            onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&crear()}
            autoFocus
            style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"10px 12px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}
          />
          <textarea
            placeholder="Descripción / notas (opcional)"
            value={form.descripcion}
            onChange={e=>setForm({...form,descripcion:e.target.value})}
            rows={2}
            style={{border:"1px solid #E5E7EB",borderRadius:10,padding:"9px 12px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}}
          />
          {/* Selector de prioridad */}
          <div>
            <div style={{fontSize:10,color:"#6B7280",marginBottom:6}}>Prioridad</div>
            <div style={{display:"flex",gap:6}}>
              {REC_PRIORIDAD.map(p=>(
                <button key={p.id} onClick={()=>setForm({...form,prioridad:p.id})}
                  style={{flex:1,padding:"8px 4px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",border:`1.5px solid ${form.prioridad===p.id?p.color:"#E5E7EB"}`,background:form.prioridad===p.id?p.bg:"#fff",color:form.prioridad===p.id?p.color:"#9CA3AF",transition:"all .15s"}}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {err&&<div style={{fontSize:12,color:"#DC2626",background:"#FEF2F2",padding:"8px 12px",borderRadius:8}}>{err}</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={crear} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Guardar</button>
            <button onClick={()=>{setNewForm(false);setErr("");}} style={{padding:"10px 14px",border:"1px solid #E5E7EB",borderRadius:10,background:"#fff",fontSize:13,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filtros */}
      {recordatorios.length>0&&(
        <div style={{display:"flex",gap:6,background:"#F3F4F6",borderRadius:12,padding:4}}>
          {[["pendientes",`Pendientes (${pendientes.length})`],["completados",`Completados (${completados.length})`],["todos","Todos"]].map(([k,l])=>(
            <button key={k} onClick={()=>setFiltro(k)}
              style={{flex:1,padding:"7px 4px",borderRadius:9,fontSize:11,fontWeight:600,cursor:"pointer",border:"none",background:filtro===k?"#fff":"transparent",color:filtro===k?"#111":"#9CA3AF",boxShadow:filtro===k?"0 1px 4px rgba(0,0,0,0.08)":"none",whiteSpace:"nowrap"}}>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {recordatorios.length===0&&!newForm&&(
        <div style={{textAlign:"center",padding:"56px 16px",color:"#9CA3AF"}}>
          <Bell size={48} style={{margin:"0 auto 14px",display:"block",opacity:.18}}/>
          <div style={{fontSize:14,fontWeight:500,color:"#6B7280"}}>Sin recordatorios</div>
          <div style={{fontSize:12,marginTop:6}}>Crea uno para empezar</div>
        </div>
      )}
      {recordatorios.length>0&&visibles.length===0&&(
        <div style={{textAlign:"center",padding:"32px 0",color:"#9CA3AF",fontSize:12}}>Sin recordatorios en esta sección</div>
      )}

      {/* Lista */}
      {visibles.map(r=>{
        const pm=prioMeta(r.prioridad);
        const isEditing=editId===r.id;
        return(
          <div key={r.id} style={{background:"#fff",borderRadius:16,border:`1.5px solid ${r.completado?"#F0F0F0":pm.color+"40"}`,overflow:"hidden",opacity:r.completado?.75:1,transition:"opacity .2s"}}>

            {/* Barra de prioridad lateral */}
            <div style={{display:"flex"}}>
              <div style={{width:4,flexShrink:0,background:r.completado?"#E5E7EB":pm.color,borderRadius:"99px 0 0 99px"}}/>

              <div style={{flex:1,padding:"13px 14px"}}>

                {/* Edición inline */}
                {isEditing?(
                  <div style={{display:"flex",flexDirection:"column",gap:9}}>
                    <input
                      value={editForm.titulo||""}
                      onChange={e=>setEditForm({...editForm,titulo:e.target.value})}
                      autoFocus
                      style={{border:"1px solid #E5E7EB",borderRadius:9,padding:"8px 11px",fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"}}
                    />
                    <textarea
                      value={editForm.descripcion||""}
                      onChange={e=>setEditForm({...editForm,descripcion:e.target.value})}
                      rows={2}
                      style={{border:"1px solid #E5E7EB",borderRadius:9,padding:"8px 11px",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",resize:"vertical",fontFamily:"inherit"}}
                    />
                    <div style={{display:"flex",gap:6}}>
                      {REC_PRIORIDAD.map(p=>(
                        <button key={p.id} onClick={()=>setEditForm({...editForm,prioridad:p.id})}
                          style={{flex:1,padding:"6px",borderRadius:9,fontSize:11,fontWeight:600,cursor:"pointer",border:`1.5px solid ${editForm.prioridad===p.id?p.color:"#E5E7EB"}`,background:editForm.prioridad===p.id?p.bg:"#fff",color:editForm.prioridad===p.id?p.color:"#9CA3AF"}}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:7}}>
                      <button onClick={guardarEdit} style={{flex:1,background:co.color,color:"#fff",border:"none",borderRadius:9,padding:"8px",fontSize:12,fontWeight:600,cursor:"pointer"}}>Guardar</button>
                      <button onClick={()=>setEditId(null)} style={{padding:"8px 12px",border:"1px solid #E5E7EB",borderRadius:9,background:"#fff",fontSize:12,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
                    </div>
                  </div>
                ):(
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    {/* Checkbox */}
                    <button onClick={()=>toggleCompletado(r.id)}
                      style={{marginTop:1,width:20,height:20,borderRadius:6,border:`2px solid ${r.completado?"#059669":pm.color}`,background:r.completado?"#059669":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,padding:0,transition:"all .15s"}}>
                      {r.completado&&<span style={{color:"#fff",fontSize:11,fontWeight:700,lineHeight:1}}>✓</span>}
                    </button>

                    {/* Contenido */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:7,flexWrap:"wrap",marginBottom:r.descripcion?4:0}}>
                        <span style={{fontSize:13,fontWeight:600,color:r.completado?"#9CA3AF":"#111",textDecoration:r.completado?"line-through":"none",lineHeight:1.3}}>
                          {r.titulo}
                        </span>
                        <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,background:r.completado?"#F3F4F6":pm.bg,color:r.completado?"#9CA3AF":pm.color,whiteSpace:"nowrap",flexShrink:0}}>
                          {pm.label}
                        </span>
                      </div>
                      {r.descripcion&&(
                        <div style={{fontSize:11,color:r.completado?"#C4B5A5":"#6B7280",marginBottom:4,lineHeight:1.5}}>
                          {r.descripcion}
                        </div>
                      )}
                      <div style={{fontSize:9,color:"#C4B5A5"}}>
                        Creado: {r.creadoEn}
                        {r.completado&&r.completadoEn&&<span> · Completado: {r.completadoEn}</span>}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
                      {!r.completado&&(
                        <button onClick={()=>{setEditId(r.id);setEditForm({titulo:r.titulo,descripcion:r.descripcion||"",prioridad:r.prioridad});setNewForm(false);}}
                          style={{background:"#F3F4F6",border:"none",borderRadius:7,padding:"4px 8px",fontSize:10,fontWeight:600,cursor:"pointer",color:"#6B7280"}}>
                          Editar
                        </button>
                      )}
                      <button onClick={()=>setConfirmDel(confirmDel===r.id?null:r.id)}
                        style={{background:"none",border:"none",cursor:"pointer",display:"flex",justifyContent:"center",padding:"4px 4px"}}>
                        <X size={12} color="#C4B5A5"/>
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirmar eliminar */}
                {confirmDel===r.id&&!isEditing&&(
                  <div style={{marginTop:10,background:"#FEF2F2",borderRadius:9,padding:"8px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                    <span style={{fontSize:11,color:"#DC2626"}}>¿Eliminar este recordatorio?</span>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>eliminar(r.id)} style={{background:"#DC2626",color:"#fff",border:"none",borderRadius:7,padding:"4px 10px",fontSize:11,fontWeight:600,cursor:"pointer"}}>Eliminar</button>
                      <button onClick={()=>setConfirmDel(null)} style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:7,padding:"4px 8px",fontSize:11,cursor:"pointer",color:"#6B7280"}}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Resumen completados al fondo */}
      {completados.length>0&&filtro==="pendientes"&&(
        <button onClick={()=>setFiltro("completados")} style={{background:"none",border:"1px dashed #E5E7EB",borderRadius:12,padding:"10px",fontSize:12,color:"#9CA3AF",cursor:"pointer",textAlign:"center"}}>
          Ver {completados.length} completado{completados.length!==1?"s":""} →
        </button>
      )}

    </div>
  );
}

export default function App(){
  const [screen,setScreen]=useState("landing");
  const [co,setCo]=useState(null);
  const [user,setUser]=useState(null);
  const [users,setUsers]=useState(USERS_INIT);
  const [obras,setObrasState]=useState(OBRAS_INIT);
  const [cuentas,setCuentasState]=useState({ubuntu:[],sae:[]});
  const [nominas,setNominasState]=useState({ubuntu:[],sae:[]});
  const [productividad,setProductividadState]=useState({ubuntu:[],sae:[]});
  const [bodegas,setBodegasState]=useState({ubuntu:[],sae:[]});
  const [vehiculos,setVehiculosState]=useState({ubuntu:[],sae:[]});
  const [recordatorios,setRecordatoriosState]=useState({});
  const [lf,setLf]=useState({email:"",pw:""});
  const [lerr,setLerr]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [view,setView]=useState("home");
  const [storageLoaded,setStorageLoaded]=useState(false);
  const [isDesktop,setIsDesktop]=useState(()=>typeof window!=="undefined"?window.innerWidth>=768:true);

  // ── Cargar datos desde Supabase + restaurar sesión ───────────────────────
  useEffect(()=>{
    (async()=>{
      // 1. Cargar datos globales de la app
      const [o,c,n,p,b,vh]=await Promise.all([
        db.loadData("portal_obras",        OBRAS_INIT),
        db.loadData("portal_cuentas",      {ubuntu:[],sae:[]}),
        db.loadData("portal_nominas",      {ubuntu:[],sae:[]}),
        db.loadData("portal_productividad",{ubuntu:[],sae:[]}),
        db.loadData("portal_bodegas",      {ubuntu:[],sae:[]}),
        db.loadData("portal_vehiculos",    {ubuntu:[],sae:[]}),
      ]);
      setObrasState(o); setCuentasState(c); setNominasState(n);
      setProductividadState(p); setBodegasState(b); setVehiculosState(vh);

      // 2. Cargar usuarios de ambas empresas desde Supabase
      const [uu,su]=await Promise.all([
        db.getCompanyUsers("ubuntu"),
        db.getCompanyUsers("sae"),
      ]);
      setUsers({ubuntu:uu, sae:su});

      // 3. Restaurar sesión activa si existe
      const session=await db.getSession();
      if(session){
        const coData=COMPANIES[session.companyId];
        if(coData){
          setCo(coData);
          setUser(session.user);
          // Cargar recordatorios del usuario
          const rec=await db.loadUserData(session.user.id, session.companyId, []);
          const recK=`${session.companyId}_${session.user.id}`;
          setRecordatoriosState({[recK]:rec});
          const initView=
            session.user.role==="admin"         ?"home":
            session.user.role==="administrativo"?"obras":"cuentas";
          setView(initView);
          setScreen("dashboard");
        }
      }
      setStorageLoaded(true);
    })();
  },[]);

  // ── Guardar en Supabase cuando cambia cualquier estado ────────────────────
  useEffect(()=>{ if(storageLoaded) db.saveData("portal_obras",obras); },[obras,storageLoaded]);
  useEffect(()=>{ if(storageLoaded) db.saveData("portal_cuentas",cuentas); },[cuentas,storageLoaded]);
  useEffect(()=>{ if(storageLoaded) db.saveData("portal_nominas",nominas); },[nominas,storageLoaded]);
  useEffect(()=>{ if(storageLoaded) db.saveData("portal_productividad",productividad); },[productividad,storageLoaded]);
  useEffect(()=>{ if(storageLoaded) db.saveData("portal_bodegas",bodegas); },[bodegas,storageLoaded]);
  useEffect(()=>{ if(storageLoaded) db.saveData("portal_vehiculos",vehiculos); },[vehiculos,storageLoaded]);
  // Recordatorios: guardar solo los del usuario activo
  useEffect(()=>{
    if(storageLoaded&&user&&co&&recKey&&recordatorios[recKey]!==undefined){
      db.saveUserData(user.id, co.id, recordatorios[recKey]);
    }
  },[recordatorios,storageLoaded]);

  useEffect(()=>{
    if(typeof window==="undefined")return;
    const h=()=>setIsDesktop(window.innerWidth>=768);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);

  // Setters con scope de empresa
  const setObras  =u=>setObrasState(p=>({...p,[co.id]:typeof u==="function"?u(p[co.id]):u}));
  const setCuentas=u=>setCuentasState(p=>({...p,[co.id]:typeof u==="function"?u(p[co.id]||[]):(u||[])}));
  const setNominas=u=>setNominasState(p=>({...p,[co.id]:typeof u==="function"?u(p[co.id]||[]):(u||[])}));
  const setProd   =u=>setProductividadState(p=>({...p,[co.id]:typeof u==="function"?u(p[co.id]||[]):(u||[])}));
  const setBodegas=u=>setBodegasState(p=>({...p,[co.id]:typeof u==="function"?u(p[co.id]||[]):(u||[])}));
  const setVehiculos=u=>setVehiculosState(p=>({...p,[co.id]:typeof u==="function"?u(p[co.id]||[]):(u||[])}));
  // Recordatorios: clave = "coId_userId" → cada usuario tiene los suyos
  const recKey=co&&user?`${co.id}_${user.id}`:null;
  const setRecordatorios=u=>setRecordatoriosState(p=>({...p,[recKey]:typeof u==="function"?u(p[recKey]||[]):(u||[])}));

  const selectCo=c=>{setCo(c);setLf({email:"",pw:""});setLerr("");setScreen("login");};

  const login=async()=>{
    setLerr("");
    try{
      const result=await db.signIn(lf.email,lf.pw);
      if(result.companyId!==co.id){
        setLerr("Este usuario pertenece a otra empresa.");
        await db.signOut();
        return;
      }
      const u=result.user;
      // Cargar recordatorios del usuario recién autenticado
      const rec=await db.loadUserData(u.id, co.id, []);
      const recK=`${co.id}_${u.id}`;
      setRecordatoriosState(prev=>({...prev,[recK]:rec}));
      // Cargar lista actualizada de usuarios de su empresa
      const companyUsers=await db.getCompanyUsers(co.id);
      setUsers(prev=>({...prev,[co.id]:companyUsers}));
      const initView=
        u.role==="admin"         ?"home":
        u.role==="administrativo"?"obras":"cuentas";
      setUser(u);setView(initView);setScreen("dashboard");
    }catch(e){
      setLerr(e.message||"Correo o contraseña incorrectos.");
    }
  };

  const logout=async()=>{
    await db.signOut();
    setUser(null);setCo(null);setScreen("landing");
  };
  const isAdmin       = user?.role==="admin";
  const isAdmGeneral  = user?.role==="administrativo";
  const isLogistica   = user?.role==="logistica";
  const isOperativo   = user?.role==="operativo";
  const isNuevoRol    = isLogistica||isOperativo; // Logística o Administrativo (SAE)

  // Pantalla de carga inicial
  if(!storageLoaded) return(
    <div style={{minHeight:"100vh",background:"#0D0D1A",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{width:40,height:40,border:"3px solid #374151",borderTop:"3px solid #E95420",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
      <div style={{color:"#6B7280",fontSize:13}}>Cargando portal…</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(screen==="landing") return(
    <div style={{minHeight:"100vh",background:"#0D0D1A",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:24,fontWeight:700,color:"#fff",letterSpacing:-0.5}}>Portal Empresarial</div>
        <div style={{fontSize:13,color:"#6B7280",marginTop:6}}>Selecciona tu empresa para continuar</div>
      </div>
      <div style={{width:"100%",maxWidth:340,display:"flex",flexDirection:"column",gap:14}}>
        {Object.values(COMPANIES).map(c=>(
          <button key={c.id} onClick={()=>selectCo(c)} style={{width:"100%",background:c.bg,border:"none",borderRadius:20,padding:"22px 24px",textAlign:"left",cursor:"pointer",transition:"transform .15s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            <div style={{width:48,height:48,borderRadius:14,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"#fff",marginBottom:12}}>{c.logo}</div>
            <div style={{fontSize:17,fontWeight:700,color:"#fff"}}>{c.name}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:4}}>{c.desc}</div>
            <div style={{marginTop:14,display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.9)"}}>Iniciar sesión <ChevronRight size={14}/></div>
          </button>
        ))}
      </div>
      <div style={{fontSize:11,color:"#374151",marginTop:36}}>© 2025 Portal Empresarial</div>
    </div>
  );

  if(screen==="login") return(
    <div style={{minHeight:"100vh",background:"#0D0D1A",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px"}}>
      <div style={{width:"100%",maxWidth:340}}>
        <button onClick={()=>setScreen("landing")} style={{background:"none",border:"none",color:"#6B7280",fontSize:13,cursor:"pointer",marginBottom:20,display:"flex",alignItems:"center",gap:4,padding:0}}>← Volver</button>
        <div style={{background:"#fff",borderRadius:24,padding:"28px 24px",boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{width:56,height:56,borderRadius:16,background:co.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,color:"#fff",margin:"0 auto 12px"}}>{co.logo}</div>
            <div style={{fontSize:17,fontWeight:700,color:"#111"}}>{co.name}</div>
            <div style={{fontSize:12,color:"#9CA3AF",marginTop:4}}>Ingresa tus credenciales</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:5}}>Correo electrónico</div>
              <input type="email" value={lf.email} onChange={e=>setLf({...lf,email:e.target.value})} onKeyDown={e=>e.key==="Enter"&&login()} placeholder={co.id==="ubuntu"?"admin@ubuntu.mx":"admin@saeco.mx"} style={{width:"100%",border:"1.5px solid #E5E7EB",borderRadius:12,padding:"10px 14px",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:"#6B7280",marginBottom:5}}>Contraseña</div>
              <div style={{position:"relative"}}>
                <input type={showPw?"text":"password"} value={lf.pw} onChange={e=>setLf({...lf,pw:e.target.value})} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="••••••••" style={{width:"100%",border:"1.5px solid #E5E7EB",borderRadius:12,padding:"10px 40px 10px 14px",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                <button onClick={()=>setShowPw(!showPw)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9CA3AF",display:"flex",padding:0}}>{showPw?<EyeOff size={16}/>:<Eye size={16}/>}</button>
              </div>
            </div>
            {lerr&&<div style={{fontSize:12,color:"#DC2626",background:"#FEF2F2",padding:"10px 12px",borderRadius:10,display:"flex",gap:6,alignItems:"center"}}><AlertCircle size={13}/>{lerr}</div>}
            <button onClick={login} style={{background:co.bg,color:"#fff",border:"none",borderRadius:12,padding:"12px",fontSize:14,fontWeight:600,cursor:"pointer",marginTop:4}}>Iniciar Sesión</button>
          </div>
          <div style={{marginTop:16,background:"#F9FAFB",borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
            <div style={{fontSize:11,color:"#9CA3AF"}}>Demo: {co.id==="ubuntu"?"admin@ubuntu.mx":"admin@saeco.mx"} / admin123</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Navegación según rol
  const navNuevoRol=[
    {id:"cuentas",        label:"Caja",           icon:Wallet},
    {id:"productividad",  label:"Actividades",    icon:Timer},
    {id:"inventario",     label:"Inventario",     icon:Warehouse},
    ...(co.id==="sae"?[{id:"vehiculos",label:"Vehículos",icon:Car}]:[]),
    {id:"recordatorios",  label:"Recordatorios",  icon:Bell},
  ];
  const nav=isAdmin
    ?[{id:"home",label:"Inicio",icon:Home},{id:"obras",label:T(co).Obras,icon:Building2},{id:"finanzas",label:"Finanzas",icon:DollarSign},{id:"cuentas",label:"Caja",icon:Wallet},{id:"nomina",label:"Nómina",icon:ClipboardList},{id:"productividad",label:"Actividades",icon:Timer},{id:"inventario",label:"Inventario",icon:Warehouse},...(co.id==="sae"?[{id:"vehiculos",label:"Vehículos",icon:Car}]:[]),{id:"recordatorios",label:"Recordatorios",icon:Bell},{id:"usuarios",label:"Usuarios",icon:Users}]
    :isNuevoRol
      ?navNuevoRol
      :[{id:"obras",label:T(co).Obras,icon:Building2},{id:"cuentas",label:"Caja",icon:Wallet},{id:"inventario",label:"Inventario",icon:Warehouse},...(co.id==="sae"?[{id:"vehiculos",label:"Vehículos",icon:Car}]:[]),{id:"recordatorios",label:"Recordatorios",icon:Bell}];

  const rBadge={
    admin:          {bg:"#EDE9FE",c:"#5B21B6"},
    administrativo: {bg:"#E0F2FE",c:"#075985"},
    logistica:      {bg:"#FEF3C7",c:"#92400E"},
    operativo:      {bg:"#D1FAE5",c:"#065F46"},
  };
  const rb=rBadge[user?.role]||rBadge.admin;

  const content=(
    <>
      {view==="home"         && isAdmin      && <HomeAdmin co={co} obras={obras[co.id]}/>}
      {view==="obras"        && isAdmin      && <ObrasAdmin obras={obras[co.id]} setObras={setObras} co={co}/>}
      {view==="obras"        && isAdmGeneral && <ObrasAdministrativo obras={obras[co.id]} setObras={setObras} co={co}/>}
      {view==="finanzas"     && isAdmin      && <FinanzasView co={co} obras={obras[co.id]} cuentas={cuentas[co.id]||[]}/>}
      {view==="cuentas"                      && <CuentasView cuentas={cuentas[co.id]||[]} setCuentas={setCuentas} co={co} isAdmin={isAdmin||isAdmGeneral}/>}
      {view==="nomina"       && isAdmin      && <NominaView nominas={nominas[co.id]||[]} setNominas={setNominas} co={co}/>}
      {view==="productividad"&&(isAdmin||isNuevoRol) && <ProductividadView tareas={productividad[co.id]||[]} setTareas={setProd} co={co} users={users} user={user}/>}
      {view==="inventario"                   && <InventarioBodegaView bodegas={bodegas[co.id]||[]} setBodegas={setBodegas} co={co} user={user}/>}
      {view==="vehiculos"    && co.id==="sae" && <VehiculosView vehiculos={vehiculos[co.id]||[]} setVehiculos={setVehiculos} co={co} users={users} user={user}/>}
      {view==="recordatorios"&& recKey        && <RecordatoriosView recordatorios={recordatorios[recKey]||[]} setRecordatorios={setRecordatorios} co={co} user={user}/>}
      {view==="usuarios"     && isAdmin      && <UsuariosView users={users} setUsers={setUsers} co={co}/>}
    </>
  );

  if(isDesktop) return(
    <div style={{display:"flex",minHeight:"100vh",background:"#F5F6FA"}}>
      <div style={{width:240,background:"#fff",borderRight:"1px solid #F0F0F0",display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,zIndex:20}}>
        <div style={{background:co.bg,padding:"24px 20px"}}>
          <div style={{width:50,height:50,borderRadius:14,background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#fff",fontSize:22,marginBottom:12}}>{co.logo}</div>
          <div style={{fontWeight:700,color:"#fff",fontSize:14,lineHeight:1.3}}>{co.name}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.75)",marginTop:4}}>{user?.name}</div>
          <span style={{fontSize:11,fontWeight:600,background:rb.bg,color:rb.c,padding:"2px 9px",borderRadius:20,display:"inline-block",marginTop:7}}>{roleLabel(user?.role)}</span>
        </div>
        <div style={{flex:1,padding:"14px 10px",display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
          {nav.map(item=>{const Icon=item.icon,active=view===item.id;return(
            <button key={item.id} onClick={()=>setView(item.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",border:"none",borderRadius:12,cursor:"pointer",width:"100%",textAlign:"left",fontSize:13,fontWeight:active?600:400,background:active?co.color+"18":"transparent",color:active?co.color:"#6B7280"}}>
              <Icon size={17}/>{item.label}
            </button>
          );})}
        </div>
        <div style={{padding:"12px 10px",borderTop:"1px solid #F0F0F0"}}>
          <button onClick={logout} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"10px 14px",border:"1px solid #F0F0F0",borderRadius:12,background:"none",cursor:"pointer",fontSize:13,color:"#6B7280",fontWeight:500}}>
            <LogOut size={15}/> Cerrar sesión
          </button>
        </div>
      </div>
      <div style={{marginLeft:240,flex:1,minHeight:"100vh",overflowY:"auto"}}>
        <div style={{maxWidth:960,margin:"0 auto"}}>{content}</div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"#F5F6FA",display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:co.bg,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,color:"#fff",fontSize:16}}>{co.logo}</div>
          <div>
            <div style={{fontWeight:700,color:"#fff",fontSize:13,lineHeight:1.2}}>{co.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.75)"}}>{user?.name}</span>
              <span style={{fontSize:10,fontWeight:600,background:rb.bg,color:rb.c,padding:"1px 6px",borderRadius:20}}>{roleLabel(user?.role)}</span>
            </div>
          </div>
        </div>
        <button onClick={logout} style={{background:"rgba(255,255,255,0.18)",border:"none",borderRadius:20,padding:"6px 12px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><LogOut size={12}/> Salir</button>
      </div>
      <div style={{flex:1,overflowY:"auto",paddingBottom:76}}>{content}</div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#fff",borderTop:"1px solid #F0F0F0",display:"flex",justifyContent:"space-around",padding:"8px 4px",zIndex:20}}>
        {nav.map(item=>{const Icon=item.icon,active=view===item.id;return(
          <button key={item.id} onClick={()=>setView(item.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"4px 8px",border:"none",background:"none",cursor:"pointer",color:active?co.color:"#9CA3AF"}}>
            <Icon size={18}/>
            <span style={{fontSize:9,fontWeight:active?600:400}}>{item.label}</span>
            {active&&<div style={{width:14,height:2.5,borderRadius:99,background:co.color}}/>}
          </button>
        );})}
      </div>
    </div>
  );
}
