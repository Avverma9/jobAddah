import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Layout, User, Briefcase, GraduationCap, Sparkles, Plus, 
  Trash2, Printer, Palette, Linkedin, Mail, Phone, MapPin, FileText, 
  Camera, X, Globe, Github 
} from 'lucide-react';
import SEO from '../../util/SEO';


const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 640 : false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};
const MobileLayout = ({ children, title }) => (
  <div className="min-h-screen bg-gray-50 pb-20">
    <div className="bg-white p-4 shadow-sm font-bold text-lg sticky top-0 z-10">{title}</div>
    {children}
  </div>
);

const HTML2PDF_URL = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";

const LoadScript = ({ src, onLoad }) => {
  useEffect(() => {
    if (window.html2pdf) {
      onLoad();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = onLoad;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [src, onLoad]);
  return null;
};

const TemplateSimple = ({ data, themeColor }) => (
  <div className="p-8 bg-white h-full min-h-[1100px] text-gray-800 font-serif" id="resume-content">
    <div className="border-b-2 pb-4 mb-6 flex justify-between items-start gap-4" style={{ borderColor: themeColor }}>
      <div className="flex-1">
        <h1 className="text-4xl font-bold uppercase tracking-wider mb-2" style={{ color: themeColor }}>{data.personal.name || 'Your Name'}</h1>
        <p className="text-xl text-gray-600 mb-4">{data.personal.title || 'Professional Title'}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {data.personal.email && <span className="flex items-center gap-1"><Mail size={14}/> {data.personal.email}</span>}
          {data.personal.phone && <span className="flex items-center gap-1"><Phone size={14}/> {data.personal.phone}</span>}
          {data.personal.location && <span className="flex items-center gap-1"><MapPin size={14}/> {data.personal.location}</span>}
        </div>
      </div>
      {data.personal.profilePic && (
        <img src={data.personal.profilePic} alt="Profile" className="w-24 h-24 object-cover border rounded shadow-sm" />
      )}
    </div>

    {data.summary && (
      <div className="mb-6">
        <h3 className="text-lg font-bold uppercase border-b mb-3 pb-1" style={{ color: themeColor }}>Summary</h3>
        <p className="text-gray-700 leading-relaxed">{data.summary}</p>
      </div>
    )}

    {data.experience.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-bold uppercase border-b mb-4 pb-1" style={{ color: themeColor }}>Experience</h3>
        <div className="space-y-4">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-bold text-lg">{exp.role}</h4>
                <span className="text-sm text-gray-500 italic">{exp.date}</span>
              </div>
              <p className="font-semibold text-gray-700 mb-1">{exp.company}</p>
              <p className="text-gray-600 text-sm whitespace-pre-line">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {data.education.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-bold uppercase border-b mb-4 pb-1" style={{ color: themeColor }}>Education</h3>
        <div className="space-y-3">
          {data.education.map((edu) => (
            <div key={edu.id}>
              <div className="flex justify-between items-baseline">
                <h4 className="font-bold">{edu.school}</h4>
                <span className="text-sm text-gray-500 italic">{edu.date}</span>
              </div>
              <p className="text-gray-700">{edu.degree}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {data.skills.length > 0 && (
      <div>
        <h3 className="text-lg font-bold uppercase border-b mb-3 pb-1" style={{ color: themeColor }}>Skills</h3>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-700 font-medium">
              {skill}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const TemplateModern = ({ data, themeColor }) => (
  <div className="flex h-full min-h-[1100px] bg-white font-sans text-gray-800" id="resume-content">
    <div className="w-1/3 text-white p-8 space-y-8" style={{ backgroundColor: themeColor }}>
      <div className="space-y-2">
        <div className="flex justify-center mb-6">
          {data.personal.profilePic ? (
            <img src={data.personal.profilePic} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white/20" />
          ) : (
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
              {data.personal.name ? data.personal.name[0] : 'U'}
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-bold border-b border-white/30 pb-2 mb-4">Contact</h2>
        <div className="space-y-3 text-sm opacity-90">
          {data.personal.phone && <div className="flex items-center gap-2"><Phone size={14}/> {data.personal.phone}</div>}
          {data.personal.email && <div className="flex items-center gap-2 break-all"><Mail size={14}/> {data.personal.email}</div>}
          {data.personal.location && <div className="flex items-center gap-2"><MapPin size={14}/> {data.personal.location}</div>}
          {data.personal.linkedin && <div className="flex items-center gap-2"><Linkedin size={14}/> {data.personal.linkedin}</div>}
        </div>
      </div>

      {data.skills.length > 0 && (
        <div>
          <h2 className="text-xl font-bold border-b border-white/30 pb-2 mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span key={index} className="bg-white/20 px-2 py-1 rounded text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.education.length > 0 && (
        <div>
          <h2 className="text-xl font-bold border-b border-white/30 pb-2 mb-4">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <p className="font-bold text-sm">{edu.degree}</p>
                <p className="text-xs opacity-80">{edu.school}</p>
                <p className="text-xs opacity-60">{edu.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    <div className="w-2/3 p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-extrabold mb-2" style={{ color: themeColor }}>{data.personal.name || 'Your Name'}</h1>
        <p className="text-xl text-gray-500 tracking-widest uppercase">{data.personal.title || 'Job Title'}</p>
      </div>

      {data.summary && (
        <div className="mb-8">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-3 text-gray-400">Profile</h3>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {data.experience.length > 0 && (
        <div>
          <h3 className="text-lg font-bold uppercase tracking-wider mb-6 text-gray-400">Work Experience</h3>
          <div className="space-y-6">
            {data.experience.map((exp) => (
              <div key={exp.id} className="relative border-l-2 pl-6 border-gray-200">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white" style={{ borderColor: themeColor }}></div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-lg text-gray-800">{exp.role}</h4>
                  <span className="text-xs font-bold text-white px-2 py-1 rounded" style={{ backgroundColor: themeColor }}>{exp.date}</span>
                </div>
                <p className="font-semibold text-gray-500 mb-2">{exp.company}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

const TemplateCreative = ({ data, themeColor }) => (
  <div className="p-8 bg-slate-50 h-full min-h-[1100px] font-sans relative overflow-hidden" id="resume-content">
    <div className="absolute top-0 left-0 w-full h-40" style={{ backgroundColor: themeColor }}></div>
    
    <div className="relative bg-white shadow-xl rounded-lg overflow-hidden mt-10">
      <div className="text-center pt-10 pb-6 px-8">
        {data.personal.profilePic && (
          <img src={data.personal.profilePic} alt="Profile" className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-md" />
        )}
        <h1 className="text-4xl font-black mb-2 tracking-tight">{data.personal.name || 'Your Name'}</h1>
        <p className="text-lg font-medium text-gray-500 uppercase tracking-widest">{data.personal.title || 'Creative Designer'}</p>
        
        <div className="flex justify-center gap-6 mt-6 text-sm text-gray-600">
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.location && <span>{data.personal.location}</span>}
        </div>
      </div>

      <div className="bg-gray-50 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          {data.summary && (
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2" style={{ color: themeColor }}>
                <User size={20}/> About Me
              </h3>
              <p className="text-gray-600 text-sm leading-6">{data.summary}</p>
            </div>
          )}

          {data.experience.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: themeColor }}>
                <Briefcase size={20}/> Experience
              </h3>
              <div className="space-y-6">
                {data.experience.map((exp) => (
                  <div key={exp.id}>
                    <h4 className="font-bold text-gray-800">{exp.role}</h4>
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>{exp.company}</span>
                      <span>{exp.date}</span>
                    </div>
                    <p className="text-sm text-gray-600">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {data.education.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: themeColor }}>
                <GraduationCap size={20}/> Education
              </h3>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id} className="bg-white p-3 rounded shadow-sm border border-gray-100">
                    <div className="font-bold text-sm">{edu.degree}</div>
                    <div className="text-xs text-gray-500">{edu.school}</div>
                    <div className="text-xs text-gray-400 mt-1">{edu.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.skills.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: themeColor }}>
                <Sparkles size={20}/> Expertise
              </h3>
              <div className="space-y-2">
                {data.skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700">{skill}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-gray-800 h-1.5 rounded-full" style={{ width: `${Math.random() * 40 + 60}%`, backgroundColor: themeColor }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const TemplateProfessional = ({ data, themeColor }) => (
  <div className="bg-white h-full min-h-[1100px] text-slate-800 p-10 font-sans" id="resume-content">
    <div className="border-b-4 pb-6 mb-8" style={{ borderColor: themeColor }}>
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-4xl font-bold uppercase tracking-wide mb-2" style={{ color: themeColor }}>
                {data.personal.name || 'Your Name'}
            </h1>
            <p className="text-lg font-medium text-slate-600 uppercase tracking-wider">
                {data.personal.title || 'Professional Title'}
            </p>
        </div>
        {data.personal.profilePic && (
             <img src={data.personal.profilePic} alt="Profile" className="w-20 h-20 rounded-lg object-cover shadow-sm" />
        )}
      </div>
      <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500 font-medium">
        {data.personal.phone && <div className="flex items-center gap-1"><Phone size={14}/> {data.personal.phone}</div>}
        {data.personal.email && <div className="flex items-center gap-1"><Mail size={14}/> {data.personal.email}</div>}
        {data.personal.location && <div className="flex items-center gap-1"><MapPin size={14}/> {data.personal.location}</div>}
        {data.personal.linkedin && <div className="flex items-center gap-1"><Linkedin size={14}/> {data.personal.linkedin}</div>}
      </div>
    </div>

    <div className="space-y-6">
        {data.summary && (
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-3 text-slate-400">Professional Profile</h3>
                <p className="text-sm leading-6 text-slate-700 text-justify">{data.summary}</p>
            </section>
        )}

        {data.experience.length > 0 && (
            <section>
                <h3 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-4 text-slate-400">Experience</h3>
                <div className="space-y-5">
                    {data.experience.map((exp) => (
                        <div key={exp.id}>
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-base text-slate-800">{exp.role}</h4>
                                <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-600">{exp.date}</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-500 mb-2" style={{color: themeColor}}>{exp.company}</div>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        )}

        <div className="grid grid-cols-2 gap-8">
             {data.education.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-4 text-slate-400">Education</h3>
                    <div className="space-y-4">
                        {data.education.map((edu) => (
                            <div key={edu.id}>
                                <div className="font-bold text-slate-800 text-sm">{edu.degree}</div>
                                <div className="text-xs text-slate-500">{edu.school}</div>
                                <div className="text-xs text-slate-400 italic mt-1">{edu.date}</div>
                            </div>
                        ))}
                    </div>
                </section>
             )}

            {data.skills.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest border-b pb-2 mb-4 text-slate-400">Technical Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 border border-slate-200 rounded text-xs font-semibold text-slate-600">
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}
        </div>
    </div>
  </div>
);

const TemplateExecutive = ({ data, themeColor }) => (
  <div className="flex h-full min-h-[1100px] bg-slate-100 font-sans" id="resume-content">
      <div className="w-[30%] bg-slate-900 text-white p-6 flex flex-col gap-8">
          <div className="text-center">
               {data.personal.profilePic ? (
                  <img src={data.personal.profilePic} alt="Profile" className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-slate-700" />
               ) : (
                  <div className="w-32 h-32 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl text-slate-600 font-bold">{data.personal.name?.[0]}</div>
               )}
               <h2 className="text-lg font-bold tracking-wide">Contact</h2>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
                {data.personal.email && <div className="flex flex-col"><span className="text-xs uppercase text-slate-500 font-bold">Email</span><span>{data.personal.email}</span></div>}
                {data.personal.phone && <div className="flex flex-col"><span className="text-xs uppercase text-slate-500 font-bold">Phone</span><span>{data.personal.phone}</span></div>}
                {data.personal.location && <div className="flex flex-col"><span className="text-xs uppercase text-slate-500 font-bold">Location</span><span>{data.personal.location}</span></div>}
                {data.personal.linkedin && <div className="flex flex-col"><span className="text-xs uppercase text-slate-500 font-bold">LinkedIn</span><span className="break-words">{data.personal.linkedin}</span></div>}
          </div>

          {data.skills.length > 0 && (
              <div>
                  <h2 className="text-lg font-bold tracking-wide border-b border-slate-700 pb-2 mb-4">Core Competencies</h2>
                  <div className="flex flex-wrap gap-2">
                      {data.skills.map((skill, idx) => (
                          <span key={idx} className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300">{skill}</span>
                      ))}
                  </div>
              </div>
          )}
          
          {data.education.length > 0 && (
              <div>
                  <h2 className="text-lg font-bold tracking-wide border-b border-slate-700 pb-2 mb-4">Education</h2>
                  <div className="space-y-4">
                    {data.education.map((edu) => (
                        <div key={edu.id}>
                            <div className="font-bold text-white text-sm">{edu.degree}</div>
                            <div className="text-xs text-slate-400">{edu.school}</div>
                            <div className="text-xs text-slate-500 mt-1">{edu.date}</div>
                        </div>
                    ))}
                  </div>
              </div>
          )}
      </div>

      <div className="w-[70%] bg-white p-8">
            <div className="mb-8 border-l-8 pl-6 py-2" style={{ borderColor: themeColor }}>
                <h1 className="text-4xl font-bold text-slate-900 uppercase">{data.personal.name || 'Your Name'}</h1>
                <p className="text-xl text-slate-500 uppercase tracking-widest mt-1">{data.personal.title || 'Executive Title'}</p>
            </div>

            {data.summary && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold uppercase text-slate-800 mb-3 flex items-center gap-2">
                        <span className="w-8 h-1 bg-slate-900"></span> Profile
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm">{data.summary}</p>
                </div>
            )}

            {data.experience.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold uppercase text-slate-800 mb-6 flex items-center gap-2">
                         <span className="w-8 h-1 bg-slate-900"></span> Professional Experience
                    </h3>
                    <div className="space-y-8">
                        {data.experience.map((exp) => (
                            <div key={exp.id} className="relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-xl text-slate-800">{exp.role}</h4>
                                    <span className="font-bold text-sm bg-slate-100 px-3 py-1 rounded-full text-slate-600">{exp.date}</span>
                                </div>
                                <div className="text-md font-semibold mb-3 flex items-center gap-2" style={{ color: themeColor }}>
                                    {exp.company}
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
      </div>
  </div>
);

export default function ResumeMaker() {
  const isMobile = useIsMobile();
  const [libLoaded, setLibLoaded] = useState(false);
  const [template, setTemplate] = useState('modern');
  const [themeColor, setThemeColor] = useState('#2563eb');
  const [activeTab, setActiveTab] = useState('editor');
  const skillInputRef = useRef(null);
  
  const [resumeData, setResumeData] = useState({
    personal: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      profilePic: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: []
  });

  const updatePersonal = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updatePersonal('profilePic', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now(), role: '', company: '', date: '', description: '' }]
    }));
  };

  const updateExperience = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const removeExperience = (id) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now(), school: '', degree: '', date: '' }]
    }));
  };

  const updateEducation = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const removeEducation = (id) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = (skill) => {
    if (skill && !resumeData.skills.includes(skill)) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skill) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
    setTimeout(() => {
      if (skillInputRef.current) {
        skillInputRef.current.focus();
      }
    }, 0);
  };

  const handleDownloadPDF = () => {
    if (!window.html2pdf) return;
    const element = document.getElementById('resume-content');
    const opt = {
      margin: 0,
      filename: `${resumeData.personal.name || 'resume'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    window.html2pdf().set(opt).from(element).save();
  };

  const content = (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col h-screen text-slate-800">
      <SEO />
      <LoadScript src={HTML2PDF_URL} onLoad={() => setLibLoaded(true)} />
      
      <header className="bg-white p-4 shadow-sm border-b border-gray-200 flex flex-col md:flex-row justify-between items-center z-10 shrink-0 gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><FileText size={20}/></div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">JobsAddah Resume Maker</h1>
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 justify-center md:justify-end no-scrollbar">
           <div className="flex bg-gray-100 p-1 rounded-lg shrink-0 overflow-x-auto max-w-[200px] md:max-w-none">
             {['simple', 'modern', 'creative', 'professional', 'executive'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setTemplate(t)} 
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${template === t ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {t}
                </button>
             ))}
           </div>
           
           <div className="flex items-center gap-2 px-2 shrink-0">
             <div className="relative overflow-hidden w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition shadow-sm">
               <input type="color" value={themeColor || '#000000'} onChange={(e) => setThemeColor(e.target.value)} className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0" title="Change Theme Color"/>
             </div>
           </div>

           <button 
             onClick={handleDownloadPDF} 
             disabled={!libLoaded}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition shadow-md shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 text-sm"
           >
             <Download size={16}/> <span>Download</span>
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        <div className={`w-full md:w-[450px] bg-white border-r border-gray-200 overflow-y-auto p-6 ${activeTab === 'preview' ? 'hidden md:block' : 'block'}`}>
            <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <Layout size={20} className="text-blue-600"/> Resume Details
            </h2>

            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase text-gray-400 mb-4 flex items-center gap-2"><User size={16}/> Personal Info</h3>
              
              <div className="flex items-center gap-4 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                {resumeData.personal.profilePic ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 group shadow-sm shrink-0">
                    <img src={resumeData.personal.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => updatePersonal('profilePic', '')}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="w-16 h-16 rounded-full bg-white flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition shadow-sm shrink-0">
                    <Camera size={20} className="text-gray-400" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
                <div className="text-sm text-gray-500">
                  <p className="font-medium text-slate-700">Profile Photo</p>
                  <p className="text-xs text-gray-400">Tap to upload</p>
                </div>
              </div>

              <div className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition" value={resumeData.personal.name || ''} onChange={(e) => updatePersonal('name', e.target.value)} />
                <input type="text" placeholder="Job Title (e.g. Software Engineer)" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition" value={resumeData.personal.title || ''} onChange={(e) => updatePersonal('title', e.target.value)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Email" className="w-full p-3 border border-gray-200 rounded-lg outline-none text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition" value={resumeData.personal.email || ''} onChange={(e) => updatePersonal('email', e.target.value)} />
                  <input type="text" placeholder="Phone" className="w-full p-3 border border-gray-200 rounded-lg outline-none text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition" value={resumeData.personal.phone || ''} onChange={(e) => updatePersonal('phone', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Location" className="w-full p-3 border border-gray-200 rounded-lg outline-none text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition" value={resumeData.personal.location || ''} onChange={(e) => updatePersonal('location', e.target.value)} />
                    <input type="text" placeholder="LinkedIn URL" className="w-full p-3 border border-gray-200 rounded-lg outline-none text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition" value={resumeData.personal.linkedin || ''} onChange={(e) => updatePersonal('linkedin', e.target.value)} />
                </div>
                <textarea placeholder="Professional Summary" rows="4" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-gray-50 focus:bg-white transition" value={resumeData.summary || ''} onChange={(e) => setResumeData({...resumeData, summary: e.target.value})}></textarea>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold uppercase text-gray-400 flex items-center gap-2"><Briefcase size={16}/> Experience</h3>
                <button onClick={addExperience} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition"><Plus size={20}/></button>
              </div>
              <div className="space-y-4">
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 group hover:shadow-sm transition">
                    <div className="flex justify-between mb-2">
                        <input type="text" placeholder="Job Role" className="bg-transparent font-bold w-full outline-none text-slate-700 placeholder-slate-400" value={exp.role || ''} onChange={(e) => updateExperience(exp.id, 'role', e.target.value)} />
                        <button onClick={() => removeExperience(exp.id)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={16}/></button>
                    </div>
                    <input type="text" placeholder="Company Name" className="w-full bg-transparent text-sm mb-2 outline-none text-slate-600" value={exp.company || ''} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
                    <input type="text" placeholder="Date (e.g. 2020 - Present)" className="w-full bg-transparent text-xs text-gray-500 mb-2 outline-none" value={exp.date || ''} onChange={(e) => updateExperience(exp.id, 'date', e.target.value)} />
                    <textarea placeholder="Job Description..." rows="2" className="w-full p-2 border border-gray-200 bg-white rounded-lg text-sm outline-none resize-none focus:ring-1 focus:ring-blue-400 transition" value={exp.description || ''} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}></textarea>
                  </div>
                ))}
                {resumeData.experience.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">No experience added yet.</p>}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold uppercase text-gray-400 flex items-center gap-2"><GraduationCap size={16}/> Education</h3>
                <button onClick={addEducation} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition"><Plus size={20}/></button>
              </div>
              <div className="space-y-3">
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="p-3 border border-gray-200 rounded-xl bg-gray-50 relative hover:shadow-sm transition">
                    <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"><Trash2 size={16}/></button>
                    <input type="text" placeholder="Degree / Course" className="w-full bg-transparent font-medium text-sm outline-none mb-1 text-slate-700" value={edu.degree || ''} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} />
                    <input type="text" placeholder="School / University" className="w-full bg-transparent text-sm text-gray-600 outline-none mb-1" value={edu.school || ''} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} />
                    <input type="text" placeholder="Year (e.g. 2022)" className="w-full bg-transparent text-xs text-gray-400 outline-none" value={edu.date || ''} onChange={(e) => updateEducation(edu.id, 'date', e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase text-gray-400 mb-4 flex items-center gap-2"><Sparkles size={16}/> Skills</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {resumeData.skills.map((skill, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-100">
                    {skill} <button onMouseDown={(e) => e.preventDefault()} onClick={() => removeSkill(skill)} className="hover:text-blue-900"><X size={12}/></button>
                  </span>
                ))}
              </div>
              <input 
                ref={skillInputRef}
                type="text" 
                placeholder="Type skill & press Enter" 
                className="w-full p-3 border border-gray-200 rounded-lg outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition" 
                onKeyDown={(e) => {
                  if(e.key === 'Enter') {
                    addSkill(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
            
            <div className="h-20 md:hidden"></div>
        </div>

        <div className={`flex-1 bg-slate-100 overflow-y-auto p-4 md:p-8 flex justify-center ${activeTab === 'editor' ? 'hidden md:flex' : 'flex'}`}>
          <div className="w-full max-w-[210mm] shadow-2xl bg-white min-h-[297mm] origin-top transform scale-[0.5] sm:scale-[0.6] md:scale-[0.75] lg:scale-[0.85] xl:scale-100 transition-transform duration-300">
             {template === 'simple' && <TemplateSimple data={resumeData} themeColor={themeColor} />}
             {template === 'modern' && <TemplateModern data={resumeData} themeColor={themeColor} />}
             {template === 'creative' && <TemplateCreative data={resumeData} themeColor={themeColor} />}
             {template === 'professional' && <TemplateProfessional data={resumeData} themeColor={themeColor} />}
             {template === 'executive' && <TemplateExecutive data={resumeData} themeColor={themeColor} />}
          </div>
        </div>
      </div>
      
      <div className="md:hidden bg-white border-t border-gray-200 p-2 flex justify-around shrink-0 z-20 shadow-lg pb-4">
        <button onClick={() => setActiveTab('editor')} className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition ${activeTab === 'editor' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}>
          <Layout size={20}/> <span className="text-xs font-medium">Edit</span>
        </button>
        <button onClick={() => setActiveTab('preview')} className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition ${activeTab === 'preview' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}>
          <Printer size={20}/> <span className="text-xs font-medium">Preview</span>
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout title="Resume Maker">
        {content}
      </MobileLayout>
    );
  }

  return content;
}