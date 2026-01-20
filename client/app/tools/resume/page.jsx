"use client"
/* eslint-disable @next/next/no-img-element */

import React, { useRef, useState, useEffect } from "react"
import SEO from "@/lib/SEO"

const Icons = {
  Download: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  User: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Briefcase: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
  Graduation: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>,
  Plus: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>,
  Trash: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Camera: () => <svg width="24" height="24" fill="none" stroke="#64748b" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
  Settings: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Mail: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  Phone: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  Map: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  Link: () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
  Eye: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  Edit: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
}

export default function ResumeBuilderPage() {
  const previewRef = useRef()
  const containerRef = useRef()
  const [scale, setScale] = useState(1)
  
  // Mobile Tab State: 'editor' | 'preview'
  const [activeMobileTab, setActiveMobileTab] = useState('editor')

  const [template, setTemplate] = useState("naukri") 
  const [themeColor, setThemeColor] = useState("#2a41e8") 
  const [profileImage, setProfileImage] = useState(null)

  const [name, setName] = useState("Alex Morgan")
  const [title, setTitle] = useState("Senior Product Designer")
  const [email, setEmail] = useState("alex.morgan@example.com")
  const [phone, setPhone] = useState("+1 (555) 123-4567")
  const [website, setWebsite] = useState("linkedin.com/in/alexmorgan")
  const [city, setCity] = useState("San Francisco")
  const [country, setCountry] = useState("CA")
  const [summary, setSummary] = useState("Creative and detail-oriented Product Designer with over 6 years of experience in building user-centric digital products. Proficient in UI/UX design, prototyping, and design systems.")
  const [skills, setSkills] = useState("Figma, Adobe XD, React, CSS3, Design Systems, Prototyping, User Research")
  const [languages, setLanguages] = useState("English (Native), Spanish (Intermediate), French (Basic)")

  const [experiences, setExperiences] = useState([
    { role: "Senior Product Designer", company: "TechFlow Inc.", duration: "2021 - Present", desc: "Led the redesign of the core product dashboard, resulting in a 20% increase in user engagement. Mentored junior designers and established a comprehensive design system." },
    { role: "UI/UX Designer", company: "Creative Solutions", duration: "2018 - 2021", desc: "Collaborated with cross-functional teams to deliver high-quality web and mobile applications. Conducted user research and usability testing to iterate on design concepts." }
  ])
  const [educations, setEducations] = useState([
    { degree: "Bachelor of Fine Arts in Interaction Design", institute: "California College of the Arts", year: "2014 - 2018" }
  ])

  // Improved Logic for Scaling on Mobile
  useEffect(() => {
    function handleResize() {
      // Logic for determining available width
      let containerWidth = 0;
      
      // If ref is available and visible, use its width
      if (containerRef.current && containerRef.current.offsetWidth > 0) {
        containerWidth = containerRef.current.offsetWidth;
      } 
      // Fallback for mobile if ref is hidden or 0
      else if (typeof window !== "undefined" && window.innerWidth < 900) {
        containerWidth = window.innerWidth - 32; // minus padding
      }

      if (containerWidth > 0) {
        const paperWidth = 794
        const padding = 20
        
        let newScale = 1
        if (containerWidth < paperWidth + padding) {
          newScale = (containerWidth - padding) / paperWidth
        }
        setScale(Math.min(newScale, 1))
      }
    }
    
    // Trigger resize immediately and after short delay to ensure DOM is ready
    handleResize()
    const timer = setTimeout(handleResize, 50)
    
    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timer)
    }
  }, [activeMobileTab]) 

  // Handle Tab Switching with Scroll Reset
  const switchTab = (tab) => {
    setActiveMobileTab(tab)
    // Scroll to top to ensure user sees the content
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleImageUpload(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProfileImage(reader.result)
      reader.readAsDataURL(file)
    }
  }

  function addExperience() {
    setExperiences((s) => [...s, { role: "", company: "", duration: "", desc: "" }])
  }
  function removeExperience(i) {
    setExperiences((s) => s.filter((_, idx) => idx !== i))
  }
  function updateExperience(i, key, value) {
    setExperiences((s) => s.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)))
  }

  function addEducation() {
    setEducations((s) => [...s, { degree: "", institute: "", year: "" }])
  }
  function removeEducation(i) {
    setEducations((s) => s.filter((_, idx) => idx !== i))
  }
  function updateEducation(i, key, value) {
    setEducations((s) => s.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)))
  }

  async function downloadPDF() {
    if (!previewRef.current) return
    await new Promise(resolve => setTimeout(resolve, 300))
    const element = previewRef.current
    const opt = {
      margin: 0,
      filename: `${(name || "resume").replace(/\s+/g, "-").toLowerCase()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    }
    const mod = await import("html2pdf.js")
    const html2pdf = mod.default ?? mod
    html2pdf().set(opt).from(element).save()
  }

  // --- TEMPLATES ---
  
  const NaukriTemplate = () => (
    <div style={{ display: "flex", width: "210mm", height: "297mm", background: "#fff", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
      <div style={{ width: "35%", backgroundColor: themeColor, color: "#fff", padding: "30px 20px", display: "flex", flexDirection: "column", gap: "25px", height: "100%" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {profileImage ? (
             <div style={{ width: 110, height: 110, borderRadius: "50%", overflow: "hidden", border: "4px solid rgba(255,255,255,0.2)", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
               <img src={profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
             </div>
          ) : (
             <div style={{ width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 45, fontWeight: "bold", border: "4px solid rgba(255,255,255,0.2)" }}>
               {name.charAt(0)}
             </div>
          )}
        </div>
        <div style={{ width: "100%" }}>
           <h4 style={{ fontSize: 12, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 8, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8, opacity: 0.9 }}>Contact Details</h4>
           <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 11, fontWeight: 400, lineHeight: 1.5 }}>
              {phone && <div style={{display:'flex', gap: 8, alignItems: 'flex-start'}}><Icons.Phone /> <span style={{flex: 1}}>{phone}</span></div>}
              {email && <div style={{display:'flex', gap: 8, alignItems: 'flex-start', wordBreak: "break-all"}}><Icons.Mail /> <span style={{flex: 1}}>{email}</span></div>}
              {(city || country) && <div style={{display:'flex', gap: 8, alignItems: 'flex-start'}}><Icons.Map /> <span style={{flex: 1}}>{city}, {country}</span></div>}
              {website && <div style={{display:'flex', gap: 8, alignItems: 'flex-start', wordBreak: "break-all"}}><Icons.Link /> <span style={{flex: 1}}>{website}</span></div>}
           </div>
        </div>
        {skills && (
          <div style={{ width: "100%" }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 8, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8, opacity: 0.9 }}>Skills</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {skills.split(",").map((s, i) => (
                <span key={i} style={{ fontSize: 10, background: "rgba(255,255,255,0.15)", padding: "4px 8px", borderRadius: 4, fontWeight: 500 }}>{s.trim()}</span>
              ))}
            </div>
          </div>
        )}
        {languages && (
          <div style={{ width: "100%" }}>
             <h4 style={{ fontSize: 12, fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.3)", paddingBottom: 8, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8, opacity: 0.9 }}>Languages</h4>
             <div style={{ fontSize: 11, fontWeight: 400, lineHeight: 1.6 }}>
                {languages.split(",").map((l, i) => <div key={i} style={{marginBottom: 4, display: "flex", alignItems: "center", gap: 6}}><span style={{width: 3, height: 3, background: "white", borderRadius: "50%"}}></span> {l.trim()}</div>)}
             </div>
          </div>
        )}
      </div>
      <div style={{ width: "65%", padding: "30px 25px", display: "flex", flexDirection: "column", gap: "22px", height: "100%" }}>
        <div style={{ borderBottom: `2px solid ${themeColor}`, paddingBottom: 18 }}>
           <h1 style={{ color: "#1e293b", fontSize: 32, fontWeight: 800, margin: 0, lineHeight: 1.1, textTransform: "uppercase", letterSpacing: -0.5 }}>{name}</h1>
           <div style={{ fontSize: 15, color: themeColor, letterSpacing: 0.8, textTransform: "uppercase", marginTop: 8, fontWeight: 600 }}>{title}</div>
        </div>
        {summary && (
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{width: 16, height: 3, background: themeColor, borderRadius: 2}}></span> Profile Summary
            </h3>
            <p style={{ fontSize: 11, lineHeight: 1.6, color: "#475569", textAlign: "justify", margin: 0 }}>{summary}</p>
          </div>
        )}
        {experiences.length > 0 && (
           <div>
             <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}>
               <span style={{width: 16, height: 3, background: themeColor, borderRadius: 2}}></span> Work Experience
             </h3>
             <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
               {experiences.map((ex, i) => (
                 <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                       <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{ex.role}</div>
                    </div>
                    <div style={{ fontSize: 11, color: themeColor, fontWeight: 600, marginBottom: 6 }}>
                      {ex.company} <span style={{color: "#94a3b8", fontWeight: 400, marginLeft: 6}}>| {ex.duration}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.5, textAlign: "justify" }}>{ex.desc}</div>
                 </div>
               ))}
             </div>
           </div>
        )}
        {educations.length > 0 && (
           <div>
             <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12, color: "#334155", display: "flex", alignItems: "center", gap: 6 }}>
               <span style={{width: 16, height: 3, background: themeColor, borderRadius: 2}}></span> Education
             </h3>
             {educations.map((ed, i) => (
               <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: "#1e293b" }}>{ed.degree}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 2, fontWeight: 500 }}>{ed.institute}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{ed.year}</div>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  )

  const CleanTemplate = () => (
     <div style={{ padding: "35px 40px", background: "#fff", height: "297mm", width: "210mm", fontFamily: "'Inter', sans-serif", color: "#1e293b", display: "flex", flexDirection: "column", gap: "22px", overflow: "hidden" }}>
        <div style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: 20 }}>
           <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6, color: "#0f172a", margin: 0 }}>{name}</h1>
           <div style={{ fontSize: 15, color: themeColor, fontWeight: 500, marginTop: 6 }}>{title}</div>
           <div style={{ marginTop: 12, fontSize: 11, color: "#64748b", display: "flex", gap: 15, flexWrap: "wrap" }}>
              {email && <span>{email}</span>}
              {phone && <span>{phone}</span>}
              {city && <span>{city}</span>}
              {website && <span>{website}</span>}
           </div>
        </div>
        {summary && (
          <div><p style={{ fontSize: 12, lineHeight: 1.6, color: "#334155", margin: 0 }}>{summary}</p></div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 30 }}>
           <div>
              <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "#94a3b8", marginBottom: 15, margin: 0 }}>Experience</h3>
              {experiences.map((e, i) => (
                <div key={i} style={{ marginTop: 15 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{e.role}</div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: themeColor, marginBottom: 6 }}>{e.company}</div>
                  <p style={{ fontSize: 11, lineHeight: 1.5, color: "#475569", margin: 0 }}>{e.desc}</p>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>{e.duration}</div>
                </div>
              ))}
           </div>
           <div>
              <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "#94a3b8", marginBottom: 15, margin: 0 }}>Education</h3>
              {educations.map((e, i) => (
                <div key={i} style={{ marginTop: 12 }}>
                   <div style={{ fontWeight: 600, fontSize: 12 }}>{e.degree}</div>
                   <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{e.institute}</div>
                   <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{e.year}</div>
                </div>
              ))}
              {skills && (
                <div style={{ marginTop: 25 }}>
                   <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "#94a3b8", marginBottom: 12, margin: 0 }}>Skills</h3>
                   <div style={{ fontSize: 11, lineHeight: 1.5, color: "#334155", marginTop: 10 }}>
                     {skills.split(",").map((s,i) => <div key={i} style={{marginBottom: 4}}>{s.trim()}</div>)}
                   </div>
                </div>
              )}
           </div>
        </div>
     </div>
  )

  return (
    <div className="main-app">
      <SEO 
        title="AI Resume Builder - Create Your Professional CV for Free | JobsAddah"
        description="Choose from professional resume templates and build your CV in minutes. Perfect for government and private sector jobs."
        keywords="resume builder, curriculum vitae, cv maker, professional resume templates, free resume builder, jobsaddah resume"
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        
        body { margin: 0; font-family: 'Inter', sans-serif; background: #f8fafc; }

        .main-app { width: 100%; min-height: 100vh; display: flex; flex-direction: column; position: relative; }

        /* HEADER */
        .toolbar-container {
           height: 60px;
           display: flex;
           align-items: center;
           justify-content: space-between;
           background: rgba(255, 255, 255, 0.95);
           backdrop-filter: blur(10px);
           padding: 0 24px;
           border-bottom: 1px solid #e2e8f0;
           position: sticky;
           top: 68px; /* Move below global header */
           z-index: 40;
        }
        .app-title { font-weight: 800; fontSize: 20px; color: #0f172a; display: flex; align-items: center; gap: 8px; }
        .app-badge { background: #2563eb; color: #fff; padding: 4px 8px; border-radius: 6px; fontSize: 12px; font-weight: 700; }
        
        .desktop-actions { display: flex; gap: 12px; align-items: center; }

        /* CONTAINER */
        .resume-builder-container {
           flex: 1;
           display: flex;
           gap: 30px;
           max-width: 1400px;
           margin: 0 auto;
           padding: 24px;
           width: 100%;
           align-items: flex-start;
        }

        /* EDITOR */
        .editor-section {
           flex: 1;
           min-width: 400px;
           background: #fff;
           border-radius: 12px;
           box-shadow: 0 1px 3px rgba(0,0,0,0.1);
           border: 1px solid #e2e8f0;
           padding: 24px;
           padding-bottom: 100px; /* Space for bottom nav on mobile */
        }

        /* PREVIEW */
        .preview-section {
           flex: 1.2;
           min-width: 450px;
           position: sticky;
           top: 80px;
           max-height: calc(100vh - 100px);
           overflow-y: auto;
           display: flex;
           justify-content: center;
           padding: 10px;
           background: #e2e8f0;
           border-radius: 12px;
        }
        .resume-paper { 
          background: white; 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); 
          transform-origin: top center;
          transition: transform 0.2s ease;
        }

        /* FORM ELEMENTS */
        .input-group { margin-bottom: 16px; }
        .label { display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; transition: 0.2s; background: #fff; color: #0f172a; }
        .input:focus { border-color: #2563eb; outline: none; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
        .section-heading { font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; margin: 30px 0 15px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        
        /* BUTTONS */
        .btn { padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; border: none; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
        .btn-primary { background: #0f172a; color: white; }
        .btn-primary:hover { background: #1e293b; }
        .btn-outline { background: white; border: 1px solid #cbd5e1; color: #475569; }
        .btn-outline.active { background: #eff6ff; border-color: #2563eb; color: #2563eb; }
        
        .photo-box { border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; cursor: pointer; background: #f8fafc; text-align: center; }
        .card-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; position: relative; }
        .remove-btn { position: absolute; top: 12px; right: 12px; color: #ef4444; background: #fee2e2; border: none; border-radius: 6px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; }

        /* MOBILE BOTTOM NAV */
        .bottom-nav { display: none; }
        .fab-download { display: none; }

        /* RESPONSIVE DESIGN */
        @media (max-width: 900px) {
           .toolbar-container { padding: 0 16px; height: 56px; }
           .app-title { font-size: 18px; }
           .desktop-actions { display: none; } /* Hide desktop toolbar items */
           
           .resume-builder-container { padding: 16px; gap: 0; display: block; }
           
           /* Explicitly control display with state styles */
           
           .editor-section { 
             width: 100%; min-width: 0; box-shadow: none; border: none; padding: 0 0 80px 0; 
           }
           
           .preview-section { 
             width: 100%; min-width: 0; position: static; max-height: none; background: transparent; padding: 0 0 80px 0;
             display: flex; /* Ensure it's flex when visible */
           }
           
           .resume-paper { width: 100%; height: auto; aspect-ratio: 210/297; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

           /* Bottom Nav */
           .bottom-nav {
              display: flex;
              position: fixed;
              bottom: 0;
              left: 0;
              width: 100%;
              background: #fff;
              border-top: 1px solid #e2e8f0;
              padding: 12px;
              justify-content: space-around;
              z-index: 100;
              box-shadow: 0 -4px 6px -1px rgba(0,0,0,0.05);
           }
           .nav-item {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
              font-size: 11px;
              font-weight: 600;
              color: #64748b;
              background: none;
              border: none;
              cursor: pointer;
           }
           .nav-item.active { color: #2563eb; }
           
           /* FAB for Download */
           .fab-download {
              display: flex; /* controlled by inline style */
              position: fixed;
              bottom: 80px;
              right: 20px;
              background: #2563eb;
              color: white;
              width: 56px;
              height: 56px;
              border-radius: 50%;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
              z-index: 90;
              border: none;
              cursor: pointer;
           }
        }
      `}</style>

      {/* HEADER */}
      <div className="toolbar-container">
         <div className="app-title">
           <span className="app-badge">CV</span>
           Resume Maker
         </div>
         
         {/* Desktop Only Actions */}
         <div className="desktop-actions">
            <button className={`btn btn-outline ${template === 'naukri' ? 'active' : ''}`} onClick={() => setTemplate('naukri')}>Naukri</button>
            <button className={`btn btn-outline ${template === 'clean' ? 'active' : ''}`} onClick={() => setTemplate('clean')}>Clean</button>
            <div style={{width: 1, height: 24, background: '#cbd5e1', margin: '0 4px'}}></div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, background: '#f1f5f9', padding: '4px 8px', borderRadius: 6}}>
               <span style={{fontSize: 11, fontWeight: 700, color: '#64748b'}}>THEME</span>
               <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} style={{width: 24, height: 24, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer'}} />
            </div>
            <button className="btn btn-primary" onClick={downloadPDF}><Icons.Download /> Download</button>
         </div>
      </div>

      <div className="resume-builder-container">
         
         {/* EDITOR TAB CONTENT */}
         <div className="editor-section" style={{ display: (typeof window !== 'undefined' && window.innerWidth < 900 && activeMobileTab === 'preview') ? 'none' : 'block' }}>
            <div className="section-heading"><Icons.User /> Essentials</div>

            <div className="input-group">
               <label className="photo-box">
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{display: 'none'}} />
                  {profileImage ? (
                    <img src={profileImage} alt="Uploaded profile preview" style={{width: 64, height: 64, borderRadius: '50%', objectFit: 'cover'}} />
                  ) : (
                    <div style={{padding: 12, background: '#e2e8f0', borderRadius: '50%'}}><Icons.Camera /></div>
                  )}
                  <span style={{fontSize: 12, fontWeight: 600, color: '#64748b'}}>Tap to upload photo</span>
               </label>
            </div>

            <div className="input-group"><label className="label">Full Name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="input-group"><label className="label">Job Title</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
               <div className="input-group"><label className="label">Email</label><input className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
               <div className="input-group"><label className="label">Phone</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            </div>
            <div className="input-group"><label className="label">Location</label><input className="input" value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div className="input-group"><label className="label">Summary</label><textarea className="input" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} /></div>

            <div className="section-heading"><Icons.Briefcase /> Experience</div>
            {experiences.map((exp, i) => (
               <div key={i} className="card-item">
                  <button className="remove-btn" onClick={() => removeExperience(i)}><Icons.Trash /></button>
                  <div className="input-group"><label className="label">Role</label><input className="input" value={exp.role} onChange={(e) => updateExperience(i, "role", e.target.value)} /></div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}>
                     <div className="input-group"><label className="label">Company</label><input className="input" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} /></div>
                     <div className="input-group"><label className="label">Date</label><input className="input" value={exp.duration} onChange={(e) => updateExperience(i, "duration", e.target.value)} /></div>
                  </div>
                  <div className="input-group"><label className="label">Details</label><textarea className="input" rows={3} value={exp.desc} onChange={(e) => updateExperience(i, "desc", e.target.value)} /></div>
               </div>
            ))}
            <button className="btn btn-outline" style={{width: '100%', justifyContent: 'center', borderStyle: 'dashed'}} onClick={addExperience}><Icons.Plus /> Add Experience</button>

            <div className="section-heading"><Icons.Graduation /> Education</div>
            {educations.map((ed, i) => (
               <div key={i} className="card-item">
                  <button className="remove-btn" onClick={() => removeEducation(i)}><Icons.Trash /></button>
                  <div className="input-group"><label className="label">Degree</label><input className="input" value={ed.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} /></div>
                  <div className="input-group"><label className="label">School</label><input className="input" value={ed.institute} onChange={(e) => updateEducation(i, "institute", e.target.value)} /></div>
                  <div className="input-group"><label className="label">Year</label><input className="input" value={ed.year} onChange={(e) => updateEducation(i, "year", e.target.value)} /></div>
               </div>
            ))}
            <button className="btn btn-outline" style={{width: '100%', justifyContent: 'center', borderStyle: 'dashed'}} onClick={addEducation}><Icons.Plus /> Add Education</button>

            <div className="section-heading"><Icons.Settings /> Skills & Others</div>
            <div className="input-group"><label className="label">Skills</label><input className="input" value={skills} onChange={(e) => setSkills(e.target.value)} /></div>
            <div className="input-group"><label className="label">Languages</label><input className="input" value={languages} onChange={(e) => setLanguages(e.target.value)} /></div>
            <div className="input-group"><label className="label">Portfolio Link</label><input className="input" value={website} onChange={(e) => setWebsite(e.target.value)} /></div>
         </div>

         {/* PREVIEW TAB CONTENT */}
         <div className="preview-section" ref={containerRef} style={{ display: (typeof window !== 'undefined' && window.innerWidth < 900 && activeMobileTab === 'editor') ? 'none' : 'flex' }}>
            <div style={{ width: 794 * scale, height: 1123 * scale, position: "relative" }}>
                <div className="resume-paper" style={{ transform: `scale(${scale})`, position: "absolute", top: 0, left: 0 }}>
                    <div ref={previewRef} style={{ width: "100%", height: "100%" }}>
                        {template === "naukri" ? <NaukriTemplate /> : <CleanTemplate />}
                    </div>
                </div>
            </div>
         </div>

      </div>

      {/* MOBILE FLOATING ACTION BUTTON */}
      <button className="fab-download" style={{ display: activeMobileTab === 'preview' ? 'flex' : 'none' }} onClick={downloadPDF}><Icons.Download /></button>

      {/* MOBILE BOTTOM NAV */}
      <div className="bottom-nav">
         <button className={`nav-item ${activeMobileTab === 'editor' ? 'active' : ''}`} onClick={() => switchTab('editor')}>
            <Icons.Edit /> Edit
         </button>
         <button className={`nav-item ${activeMobileTab === 'preview' ? 'active' : ''}`} onClick={() => switchTab('preview')}>
            <Icons.Eye /> Preview
         </button>
      </div>

    </div>
  )
}
