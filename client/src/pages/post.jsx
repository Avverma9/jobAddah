import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Share2, Printer, CheckCircle2, 
  Calendar, CreditCard, Users, ExternalLink, ChevronRight
} from "lucide-react";
import { baseUrl } from "../../util/baseUrl";
import Header from "../components/Header";

// --- Hooks ---
const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

// --- Helpers ---
const cleanHtml = (html) => {
  if (!html) return "";
  let clean = html.replace(/style="[^"]*"/g, ""); 
  clean = clean.replace(/<p>&nbsp;<\/p>/g, "");
  return clean;
};

const extractText = (html) => {
  return html?.replace(/<[^>]*>/g, "").trim() || "";
};

const extractLink = (html) => {
  const match = html?.match(/href="([^"]*)"/);
  return match ? match[1] : null;
};

// --- IMPROVED PARSERS ---

// 1. Extract Dates
const extractDates = (data) => {
  const source = data?.allText || [];
  const startIdx = source.findIndex(t => t.text?.includes("Important Dates"));
  if (startIdx === -1) return [];

  const dates = [];
  let i = startIdx + 1;
  
  while (i < source.length) {
    let text = source[i].text?.trim();
    if (!text) { i++; continue; }
    
    // Stop at next section
    if (text.includes("Application Fee") || text.includes("KVS NVS")) break; 

    // Match standard date labels
    const isDateLabel = 
      text.includes("Start Date") || 
      text.includes("Last Date") || 
      text.includes("Exam Date") || 
      text.includes("Admit Card") || 
      text.includes("Result Date") ||
      text.includes("Correction Last Date");

    if (isDateLabel) {
       let fullEntry = text;
       
       // If the label ends with separator (:, -) or is just the label, grab next value
       // "Admit Card :" -> "Before Exam"
       if (fullEntry.trim().match(/[:\-\u2013]$/) || !fullEntry.match(/\d/)) {
          let j = i + 1;
          // Look ahead for value (skip empty nodes)
          while(j < source.length && !source[j].text?.trim()) j++;

          if (j < source.length) {
             let nextText = source[j].text?.trim();
             // Check if next text is NOT another label (e.g. "Result Date :")
             if (nextText && !nextText.includes("Date :") && !nextText.includes("Admit Card")) {
                fullEntry += " " + nextText;
                i = j; // Advance main loop
             }
          }
       }
       dates.push(fullEntry);
    } 
    else if (text.includes("Candidates are advised")) {
        dates.push(text);
    }
    i++;
  }
  return dates;
};

// 2. Extract Fees
const extractFees = (data) => {
  const source = data?.allText || [];
  const startIdx = source.findIndex(t => t.text?.includes("Application Fee"));
  if (startIdx === -1) return [];

  const fees = [];
  let i = startIdx + 1;
  
  while (i < source.length) {
    let text = source[i].text?.trim();
    if (!text) { i++; continue; }
    
    // Stop conditions
    if (text.includes("Age Limit") || text.includes("Vacancy Details")) break;
    
    // CASE A: Headers (Post Names ending in :-)
    if (text.match(/[:\-\u2013]$/) && !text.match(/\d+\/-/) && !text.includes("General") && !text.includes("SC")) {
       fees.push({ type: 'header', text: text });
    } 
    // CASE B: Fee Rows (Category : Amount)
    else if (text.includes("General") || text.includes("SC") || text.includes("ST") || text.includes("OBC") || text.includes("EWS")) {
       let fullRow = text;
       
       // If "General / OBC :" is separate from "2800/-"
       if (!fullRow.includes("/-") && !fullRow.match(/Rs\.?\s*\d+/i)) {
          let j = i + 1;
          while(j < source.length && !source[j].text?.trim()) j++; // Skip empty
          
          if (j < source.length) {
             let nextText = source[j].text?.trim();
             // Append if it looks like money
             if (nextText && (nextText.includes("/-") || nextText.match(/^\d+$/) || nextText.match(/^\d+\/-$/))) {
                fullRow += " " + nextText;
                i = j;
             }
          }
       }
       fees.push({ type: 'row', text: fullRow });
    } 
    // CASE C: Payment Mode
    else if (text.includes("Payment Mode") || text.includes("payment using")) {
       fees.push({ type: 'header', text: "Payment Mode (Online):" });
       fees.push({ type: 'list', text: "Debit Card, Credit Card, Net Banking, UPI" });
       break; 
    }
    
    i++;
  }
  return fees;
};

// 3. Extract Age & Post
const extractAgeAndPost = (data) => {
    const source = data?.allText || [];
    
    // Find Age Header
    const ageIdx = source.findIndex(t => t.text?.includes("Age Limits") || t.text?.includes("Minimum Age"));
    let ageText = [];
    
    if (ageIdx !== -1) {
        let i = ageIdx;
        while(i < source.length && ageText.length < 6) {
            let t = source[i].text?.trim();
            if (t && (t.includes("Total Post") || t.includes("Vacancy Details"))) break;
            
            if (t && (t.includes("Minimum Age") || t.includes("Maximum Age") || t.includes("Relaxation"))) {
                 if (t.trim().endsWith(":")) {
                    let j = i + 1;
                    while(j < source.length && !source[j].text?.trim()) j++;
                    if(source[j]?.text?.trim()) {
                       t += " " + source[j].text.trim();
                       i = j;
                    }
                 }
                 ageText.push(t);
            } else if (t && t.includes("Age Limits As On")) {
                 ageText.unshift(t);
            }
            i++;
        }
    }

    // Find Total Post
    const postIdx = source.findIndex(t => t.text?.includes("Total Post") || t.text?.includes("Posts"));
    let totalPost = "See Notification";
    if (postIdx !== -1) {
       for(let k=0; k<3; k++) {
          let val = source[postIdx+k]?.text?.trim();
          if (val && (val.match(/[\d,]+\s*Posts?/i) || val.match(/^[\d,]+$/))) {
             totalPost = val;
             break;
          }
       }
    }

    return { ageText: ageText.length ? ageText : ["Age Limit Details Available in Notification"], totalPost };
};


const PostDetails = () => {
  const [loading, setLoading] = useState(true);
  const [postData, setPostData] = useState(null);
  const [error, setError] = useState(null);
  
  const query = useQuery();
  const navigate = useNavigate();
  
  const paramUrl = query.get("url");   
  const paramId = query.get("id") || query.get("_id"); 

  useEffect(() => {
    const fetchPostDetails = async () => {
      setLoading(true);
      setError(null);
      
      let fetchUrl = "";
      let fetchOptions = {};
      let targetScrapeUrl = null;

      if (paramUrl) targetScrapeUrl = paramUrl;
      else if (paramId && paramId.includes("http")) targetScrapeUrl = paramId;

      if (targetScrapeUrl) {
        fetchUrl = `${baseUrl}/get-post/details?url=${targetScrapeUrl}`;
        fetchOptions = { method: "GET" };
      } else if (paramId) {
        fetchUrl = `${baseUrl}/get-job/${paramId}`;
        fetchOptions = { method: "GET" };
      } else {
        setError("Invalid link");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(fetchUrl, fetchOptions);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        const validData = data.job || data.data || data;
        
        if (validData) setPostData(validData);
        else throw new Error("Details unavailable");

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [paramUrl, paramId]);

  if (loading) return <ModernSkeleton />;
  if (error) return <ModernError error={error} navigate={navigate} retry={() => window.location.reload()} />;

  const title = postData?.title || "Recruitment Notification";
  const dates = extractDates(postData);
  const fees = extractFees(postData);
  const { ageText, totalPost } = extractAgeAndPost(postData);
  const tables = postData?.tables || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header />

      {/* --- Sticky Navigation Bar --- */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 transition-all">
        <div className="container mx-auto px-4 max-w-6xl h-14 flex items-center justify-between text-sm">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-600 hover:text-blue-700 font-semibold transition-colors"
          >
            <ArrowLeft size={18} /> <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex gap-2">
             <button onClick={() => window.print()} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
               <Printer size={20}/>
             </button>
             <button className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold uppercase rounded-full hover:bg-blue-700 hover:shadow-md transition-all">
               <Share2 size={16}/> Share
             </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* --- Hero Title --- */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
           <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100">
              Latest Notification
           </div>
           <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-800 uppercase leading-snug tracking-tight">
             {title}
           </h1>
           <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* --- SECTION 1: IMPORTANT DATES & FEES (Modern Split Card) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
           
           {/* LEFT: Important Dates */}
           <div className="flex flex-col border-b md:border-b-0 md:border-r border-slate-200">
              <div className="bg-rose-900 text-white px-6 py-4 flex items-center gap-3">
                 <div className="p-2 bg-white/10 rounded-lg"><Calendar size={20} className="text-rose-100" /></div>
                 <h2 className="font-bold text-lg uppercase tracking-wide">Important Dates</h2>
              </div>
              <div className="p-6 md:p-8 flex-1 bg-white">
                 <ul className="space-y-4">
                    {dates.length > 0 ? dates.map((date, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm sm:text-base font-medium text-slate-700 group">
                         <div className="mt-1.5 min-w-[6px] h-1.5 bg-rose-500 rounded-full group-hover:scale-125 transition-transform"></div>
                         <span className="leading-relaxed">{date.replace(/[:]/g, " : ")}</span>
                      </li>
                    )) : (
                      <li className="text-slate-400 italic">Dates not available</li>
                    )}
                 </ul>
              </div>
           </div>

           {/* RIGHT: Application Fee */}
           <div className="flex flex-col">
              <div className="bg-rose-900 text-white px-6 py-4 flex items-center gap-3 border-l border-rose-800/20">
                 <div className="p-2 bg-white/10 rounded-lg"><CreditCard size={20} className="text-rose-100" /></div>
                 <h2 className="font-bold text-lg uppercase tracking-wide">Application Fee</h2>
              </div>
              <div className="p-6 md:p-8 flex-1 bg-white">
                 <ul className="space-y-3">
                    {fees.length > 0 ? fees.map((item, idx) => {
                       const isHeader = item.type === 'header';
                       return (
                         <li key={idx} className={`flex items-start gap-3 text-sm sm:text-base ${isHeader ? 'font-bold text-slate-900 mt-4 mb-1' : 'text-slate-700'}`}>
                            {!isHeader && <div className="mt-1.5 min-w-[6px] h-1.5 bg-rose-500 rounded-full"></div>}
                            <span className="leading-relaxed">{item.text.replace(/[:]/g, " : ")}</span>
                         </li>
                       );
                    }) : (
                       <li className="text-slate-400 italic">Fee details not available</li>
                    )}
                 </ul>
              </div>
           </div>
        </div>


        {/* --- SECTION 2: AGE LIMIT & TOTAL POST (Modern Banner) --- */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-0 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            
            {/* Age Limit (Left Side) */}
            <div className="flex flex-col border-b md:border-b-0 md:border-r border-slate-200">
               <div className="bg-emerald-700 text-white px-6 py-3 flex items-center gap-3">
                  <div className="p-1.5 bg-white/10 rounded-lg"><Users size={18} /></div>
                  <h2 className="font-bold text-base uppercase tracking-wider">{ageText[0]?.replace(':', '') || "Age Limit Details"}</h2>
               </div>
               <div className="p-6 md:p-8 flex-1 bg-white">
                  <ul className="space-y-3">
                     {ageText.slice(1).map((line, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm sm:text-base font-semibold text-slate-800">
                           <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                           <span className="leading-relaxed">{line.replace(/[:]/g, " : ")}</span>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

            {/* Total Post (Right Side) */}
            <div className="flex flex-col">
               <div className="bg-orange-600 text-white text-center py-3 font-bold text-lg uppercase tracking-wider shadow-inner">
                  Total Post
               </div>
               <div className="flex-1 flex flex-col items-center justify-center p-8 bg-orange-50/30">
                  <span className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">{totalPost.replace(/\D/g, '')}</span>
                  <span className="text-orange-600 font-bold uppercase text-sm mt-1 tracking-widest">Vacancies</span>
               </div>
            </div>
        </div>


        {/* --- SECTION 3: TABLES (Modernized) --- */}
        {tables.map((table, tIndex) => {
           if (!table.rows || table.rows.length < 2) return null;
           const isLinks = JSON.stringify(table).toLowerCase().includes("official website");

           if (isLinks) {
              return (
                 <div key={tIndex} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    <div className="bg-pink-600 text-white px-6 py-4 flex items-center gap-3">
                       <ExternalLink size={20} />
                       <h2 className="font-bold text-xl uppercase tracking-wide">Important Links</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                       {table.rows.map((row, rIndex) => {
                          const label = extractText(row.cells[0]?.html);
                          const link = extractLink(row.cells[1]?.html);
                          if (!link) return null;
                          return (
                             <div key={rIndex} className="group flex flex-col sm:flex-row items-center hover:bg-slate-50 transition-colors duration-200 p-4 sm:px-6">
                                <div className="flex-1 font-bold text-slate-700 text-center sm:text-left mb-3 sm:mb-0 group-hover:text-pink-700 transition-colors">
                                   {label}
                                </div>
                                <div className="sm:w-auto w-full">
                                   <a 
                                     href={link} 
                                     target="_blank" 
                                     rel="noreferrer" 
                                     className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-bold text-sm uppercase rounded-lg hover:bg-pink-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                                   >
                                      Click Here <ChevronRight size={16} />
                                   </a>
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 </div>
              );
           }

           return (
              <div key={tIndex} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mt-8">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                             {table.rows[0].cells.map((cell, c) => (
                                <th key={c} colSpan={cell.colspan} className="p-4 text-center font-extrabold text-slate-600 uppercase text-xs tracking-wider border-r border-slate-200 last:border-0">
                                   {extractText(cell.html)}
                                </th>
                             ))}
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {table.rows.slice(1).map((row, r) => (
                             <tr key={r} className="hover:bg-amber-50/50 transition-colors duration-150">
                                {row.cells.map((cell, c) => (
                                   <td key={c} colSpan={cell.colspan} className="p-4 text-center text-sm font-medium text-slate-700 border-r border-slate-100 last:border-0 align-middle leading-relaxed">
                                      <div dangerouslySetInnerHTML={{ __html: cleanHtml(cell.html) }} />
                                   </td>
                                ))}
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           );
        })}

      </main>
    </div>
  );
};

const ModernSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <Header />
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl animate-pulse">
      <div className="h-24 bg-slate-200 w-3/4 mx-auto rounded-2xl"></div>
      <div className="grid grid-cols-2 gap-4 h-80">
         <div className="bg-slate-200 rounded-2xl"></div>
         <div className="bg-slate-200 rounded-2xl"></div>
      </div>
      <div className="h-32 bg-slate-200 rounded-2xl mt-4"></div>
    </div>
  </div>
);

const ModernError = ({ error, navigate, retry }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center max-w-md w-full">
        <div className="inline-flex p-4 bg-red-50 rounded-full mb-6">
           <CheckCircle2 size={40} className="text-red-500 rotate-45" />
        </div>
        <h2 className="text-slate-800 font-bold text-2xl mb-3">Unable to Load Post</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">{error}</p>
        <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(-1)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                Go Back
            </button>
            <button onClick={retry} className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 hover:shadow-lg transition-all">
                Retry Connection
            </button>
        </div>
      </div>
  </div>
);

export default PostDetails;
