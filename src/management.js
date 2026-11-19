import {plans} from './data.js';
export const people=plans.filter(p=>['tareq','mazen','zaid-backend','zaid-ai'].includes(p.id));
export const projectNames={octaclub:'OctaClub + THINK',octacare:'OctaCare',company:'أعمال الشركة'};
export const link=(id,index=0)=>`#/plan/${id}/${index+1}`;
const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return(h>>>0).toString(36)};
export const tasks=people.flatMap(p=>p.pages.flatMap((page,index)=>page.blocks.filter(b=>b.type==='task').map(b=>({...b,id:`${p.id}-${hash(b.title)}`,person:p.id,owner:p.name,section:page.title,page:index,project:b.project||(/Think|THINK|OctaClub|LMS|RAG|V1|الطالب|التعلم|المحتوى|MedClub/.test(JSON.stringify(b))?'octaclub':'company')}))));
export const phases=[
 {project:'octaclub',date:'1–10 ديسمبر 2026',title:'الفحص الفني وقرارات إعادة الهندسة',detail:'جرد الكود والعقود والبيانات وتحديد ما يُحتفظ به وما يُعاد بناؤه.',gate:'مصفوفة قرارات فنية موثقة'},
 {project:'octaclub',date:'11–31 ديسمبر 2026',title:'إعادة هندسة الأساس',detail:'الهوية والصلاحيات والهيكل الأساسي وبيئة Staging.',gate:'أساس متكامل قابل للاختبار'},
 {project:'octaclub',date:'1–15 يناير 2027',title:'التعلم والمحتوى',detail:'LMS والمسارات والتقييمات ولوحة الطالب والمكتبة.',gate:'رحلة تعلم متكاملة'},
 {project:'octaclub',date:'16–31 يناير 2027',title:'THINK والتعلم التفاعلي',detail:'دمج السياق وRAG وTech Path وCode Runner وإغلاق P0.',gate:'تكامل بعقود واختبارات ووثائق'},
 {project:'octaclub',date:'1–14 فبراير 2027',title:'الجودة والنسخة المرشحة',detail:'اختبارات الرحلات والأمان والأداء والعزل والاستعادة.',gate:'Release Candidate وأدلة الاختبار'},
 {project:'octaclub',date:'15–28 فبراير 2027',title:'القبول والإطلاق',detail:'UAT وإغلاق العيوب المانعة والنشر والتشغيل.',gate:'قرار Go/No-Go موثق'},
 {project:'octaclub',date:'مارس 2027',title:'الاستقرار وتجهيز التجربة',detail:'متابعة التشغيل والكلفة وتثبيت الجهة والدفعة الطلابية.',gate:'خطة تجربة قابلة للقياس'},
 {project:'octacare',date:'أبريل 2027',title:'الدراسة الميدانية',detail:'8 مقابلات أساسية: 3 أطباء، 3 عيادات، 2 إدارة أو تنسيق مستشفى.',gate:'مشكلة متكررة وخط أساس'},
 {project:'octacare',date:'مايو 2027',title:'اختبار الحل',detail:'نموذج ببيانات اصطناعية؛ استهداف 15–20 مقابلة.',gate:'قياس الاستخدام وتحديد المشتري'},
 {project:'octacare',date:'يونيو 2027',title:'قرار المنتج والاستثمار',detail:'استهداف اتفاقين مكتوبين واختيار مسار واحد وتأكيد قدرة الفريق.',gate:'بدء أو تعديل أو تأجيل'},
 {project:'octacare',date:'يوليو–سبتمبر 2027',title:'تطوير النسخة الأولى',detail:'ثلاثة أشهر لرحلة تشغيلية واحدة بعد اعتماد قرار يونيو.',gate:'قبول الرحلة والصلاحيات والاستعادة'},
 {project:'octacare',date:'أكتوبر–ديسمبر 2027',title:'التشغيل التجريبي',detail:'أول جهة في أكتوبر، توسع تدريجي في نوفمبر، وتقييم في ديسمبر.',gate:'نتائج الاستخدام والدفع وقرار 2028'},
];
export function normalize(s){return s.toLowerCase().replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/[\u064b-\u065f]/g,'');}
export const sections=plans.flatMap(p=>p.pages.map((page,index)=>({plan:p.id,name:p.name,title:page.title,index,href:p.id==='commercial'?`#/company/${['overview','services','method','experience','engagement','offer'][index]}`:undefined,text:normalize(JSON.stringify(page.blocks))})));
