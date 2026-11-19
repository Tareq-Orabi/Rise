"""Portable PDF export: pip install reportlab fonttools arabic-reshaper python-bidi.
Reads the same structured content as the offline React application.
"""
from pathlib import Path
import json, re, sys, unicodedata
from xml.sax.saxutils import escape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Flowable, Table, TableStyle, Spacer, PageBreak, KeepTogether, Preformatted, CondPageBreak
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen.canvas import Canvas
from fontTools.ttLib import TTFont as FontFile
from fontTools.varLib.instancer import instantiateVariableFont
import arabic_reshaper
from bidi.algorithm import get_display

ROOT=Path(__file__).resolve().parent.parent
PLANS=json.loads((ROOT/'src/plan-content.js').read_text().split('=',1)[1].strip().removesuffix(';'))
ASSETS=ROOT/'assets'
for weight,name in [(400,'Cairo-Regular'),(700,'Cairo-Bold')]:
    target=ASSETS/(name+'.ttf')
    if not target.exists():
        f=FontFile(ASSETS/'Cairo-Variable.ttf')
        instantiateVariableFont(f,{'wght':weight,'slnt':0},inplace=True).save(target)
    pdfmetrics.registerFont(TTFont(name,str(target)))
INK=HexColor('#173c40'); TEAL=HexColor('#155d62'); MUTED=HexColor('#526b70'); LINE=HexColor('#d7e7e5'); TINT=HexColor('#eef7f4'); ORANGE=HexColor('#a14e20')
PAGE_W,PAGE_H=A4
WIDTH=PAGE_W-28*mm

FONT_CMAP=FontFile(ASSETS/'Cairo-Regular.ttf').getBestCmap()
def visual(text):
    shaped=arabic_reshaper.reshape(str(text).replace('→',' / '))
    shaped=''.join(c if ord(c) in FONT_CMAP else unicodedata.normalize('NFKC',c) for c in shaped)
    return get_display(shaped,base_dir='R')
def write_rtl(c,text,right,y,font='Cairo-Regular',size=10.5,color=INK):
    c.setFont(font,size);c.setFillColor(color)
    # Keep logical Unicode text available to copying/accessibility tools.
    encoded=('\ufeff'+text).encode('utf-16-be').hex().upper()
    c._code.append('/Span << /ActualText <'+encoded+'> >> BDC')
    c.drawRightString(right,y,visual(text))
    c._code.append('EMC')

class Arabic(Flowable):
    def __init__(self,text,size=10.5,bold=False,color=INK,leading=None,after=4,keep=False,lines=None,link=None):
        super().__init__();self.text=str(text);self.size=size;self.font='Cairo-Bold' if bold else 'Cairo-Regular';self.color=color;self.leading=leading or size*1.55;self.spaceAfter=after;self.keepWithNext=keep;self.lines=lines;self.link=link
    def wrap(self,w,h):
        self.width=w
        if self.lines is None:
            self.lines=[]
            for para in self.text.split('\n'):
                line=''
                for word in para.split():
                    candidate=(line+' '+word).strip()
                    if line and pdfmetrics.stringWidth(visual(candidate),self.font,self.size)>w:
                        self.lines.append(line);line=word
                    else:line=candidate
                self.lines.append(line)
        self.height=len(self.lines)*self.leading
        return self.width,self.height
    def split(self,w,h):
        self.wrap(w,h);count=int(h//self.leading)
        if count<1 or count>=len(self.lines):return []
        args=dict(size=self.size,bold=self.font=='Cairo-Bold',color=self.color,leading=self.leading,after=self.spaceAfter,link=self.link)
        return [Arabic('',lines=self.lines[:count],**args),Arabic('',lines=self.lines[count:],**args)]
    def draw(self):
        for i,line in enumerate(self.lines):
            y=self.height-(i+1)*self.leading+self.size*.28
            write_rtl(self.canv,line,self.width,y,self.font,self.size,self.color)
        if self.link:self.canv.linkURL(self.link,(0,0,self.width,self.height),relative=1,thickness=0)

class NumberedCanvas(Canvas):
    def __init__(self,*a,**kw):super().__init__(*a,**kw);self.saved=[]
    def showPage(self):self.saved.append(dict(self.__dict__));self._startPage()
    def save(self):
        count=len(self.saved)
        for state in self.saved:
            self.__dict__.update(state)
            self.setStrokeColor(LINE);self.setLineWidth(.6);self.line(14*mm,15*mm,PAGE_W-14*mm,15*mm)
            write_rtl(self,'صفحة '+str(self._pageNumber)+' من '+str(count),PAGE_W-14*mm,10.5*mm,size=8.5,color=MUTED)
            self.setFont('Cairo-Regular',8.5);self.setFillColor(MUTED);self.drawString(14*mm,10.5*mm,'OCTAGRAM | 2027')
            super().showPage()
        super().save()

def table(block, compact=False):
    widths=[WIDTH*x for x in block.get('widths',[1/len(block['headers'])]*len(block['headers']))][::-1]
    data=[]
    for ri,row in enumerate([block['headers']]+block['rows']):
        data.append([Arabic(c,size=9.5 if compact else 9.8,bold=ri==0,color=white if ri==0 else INK,after=0) for c in row[::-1]])
    t=Table(data,colWidths=widths,repeatRows=1,hAlign='RIGHT',splitByRow=1)
    styles=[('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,0),TEAL),('GRID',(0,0),(-1,-1),.45,LINE),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),3.5 if compact else 6),('BOTTOMPADDING',(0,0),(-1,-1),3.5 if compact else 6)]
    for i in range(1,len(data)):
        if i%2==0:styles.append(('BACKGROUND',(0,i),(-1,i),HexColor('#f3f8f7')))
    t.setStyle(TableStyle(styles));t.spaceAfter=9
    return t

def task(b):
    heading=[Arabic(b['title'],size=11.2,bold=True,color=TEAL,after=2)]
    if b.get('deadline'):heading.append(Arabic('الموعد: '+b['deadline'],size=9,color=MUTED,after=0))
    output=[Arabic('المخرج المطلوب: '+b['deliverable'],size=10.2,bold=True,after=0)]
    acceptance=[Arabic('معايير القبول',size=9,bold=True,color=ORANGE,after=2)]+[Arabic('• '+a,size=10.2,leading=14.5,after=1) for a in b['acceptance']]
    rows=[[heading],[output],[acceptance]]
    if b.get('dependencies'):
        rows.append([[Arabic('الاعتماديات والتنسيق: '+'؛ '.join(b['dependencies']),size=9.2,color=MUTED,leading=13.6,after=0)]])
    t=Table(rows,colWidths=[WIDTH],hAlign='RIGHT')
    t.setStyle(TableStyle([('BOX',(0,0),(-1,-1),.6,LINE),('BACKGROUND',(0,0),(-1,0),TINT),('LINEBELOW',(0,0),(-1,0),.5,LINE),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),2.5),('BOTTOMPADDING',(0,0),(-1,-1),2.5)]+([('BACKGROUND',(0,3),(0,3),HexColor('#f7fafb')),('LINEABOVE',(0,3),(0,3),.4,LINE)] if len(rows)>3 else [])))
    t.spaceAfter=6
    return KeepTogether([t])

def compact_spec_blocks(blocks):
    result=[];i=0
    while i<len(blocks):
        if blocks[i]['type']=='bullet':
            j=i
            while j<len(blocks) and blocks[j]['type']=='bullet':j+=1
            group=blocks[i:j]
            if len(group)>=6 and all(len(b['text'])<100 and not re.match(r'^\d+\.',b['text']) for b in group):
                result.append({'type':'bulletgrid','items':[b['text'] for b in group]})
            else:result.extend(group)
            i=j
        else:
            b=blocks[i]
            if b['type']=='p' and b.get('bold') and len(b['text'])<90 and not b['text'].startswith(('OCTAGRAM','OctaClub','Version')):
                b={'type':'h','text':b['text']}
            result.append(b);i+=1
    return result

def render(plan):
    file=ROOT/'pdf'/(plan['id']+'.pdf')
    def header(c,doc):
        c.saveState()
        c.setFillColor(TEAL);c.rect(0,PAGE_H-2*mm,PAGE_W,2*mm,fill=1,stroke=0)
        c.setFillColor(HexColor('#ed873b'));c.rect(0,PAGE_H-2*mm,42*mm,2*mm,fill=1,stroke=0)
        c.drawImage(str(ASSETS/'octagram-logo.png'),PAGE_W-31*mm,PAGE_H-26*mm,20*mm,20*mm,mask='auto')
        c.setFont('Cairo-Bold',12);c.setFillColor(TEAL);c.drawRightString(PAGE_W-34*mm,PAGE_H-17*mm,'Octagram')
        write_rtl(c,'ديسمبر 2026 - فبراير 2027' if plan['id']=='octaclub' else 'أبريل - ديسمبر 2027 | مقترح للاعتماد' if plan['id']=='octacare' else 'دليل الخدمات' if plan['id']=='commercial' else 'الخطة التشغيلية السنوية 2027',73*mm,PAGE_H-17*mm,size=9,color=MUTED)
        c.setStrokeColor(LINE);c.line(14*mm,PAGE_H-29*mm,PAGE_W-14*mm,PAGE_H-29*mm)
        c.restoreState()
    story=[]
    for i,page in enumerate(plan['pages']):
        if i:
            if plan['id']=='octaclub' or (plan['id'] in ['tareq','mazen','zaid-backend','zaid-ai'] and i>=4):story.extend([Spacer(1,14),CondPageBreak(105*mm)])
            else:story.append(PageBreak())
        story.extend([Arabic(plan['title'],size=9.5,color=MUTED,after=4,keep=True),Arabic(page['title'],size=20,bold=True,color=TEAL,leading=29,after=7,keep=True),Arabic('القسم '+str(i+1)+' من '+str(len(plan['pages'])),size=8.5,color=MUTED,after=10,keep=True)])
        for b in (compact_spec_blocks(page['blocks']) if plan['id']=='octaclub' else page['blocks']):
            typ=b['type']
            if typ=='bulletgrid':
                rows=[]
                for k in range(0,len(b['items']),2):
                    cells=[Arabic('• '+v,size=10.2,leading=14.7,after=0) for v in b['items'][k:k+2]]
                    if len(cells)<2:cells.append('')
                    rows.append(cells[::-1])
                t=Table(rows,colWidths=[WIDTH/2,WIDTH/2],hAlign='RIGHT')
                t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),5),('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),2),('BOTTOMPADDING',(0,0),(-1,-1),2)]))
                t.spaceAfter=5;story.append(t)
            elif typ=='code':
                code=b['text'].replace('├──','+--').replace('└──','+--').replace('│','|')
                story.append(Preformatted(code,ParagraphStyle('Code',fontName='Cairo-Regular',fontSize=7,leading=9.2,spaceAfter=7)))
            elif typ=='table':story.append(table(b,compact=plan['id']=='octaclub'))
            elif typ=='task':story.append(task(b))
            elif typ=='h':story.append(Arabic(b['text'],size=12,bold=True,color=TEAL,after=4,keep=True))
            elif typ=='bullet':story.append(Arabic('• '+b['text'],after=5))
            elif typ=='p':
                if b.get('bold'):
                    t=Table([[Arabic(b['text'],bold=True,size=10.3,after=0)]],colWidths=[WIDTH]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),TINT),('LINEAFTER',(-1,0),(-1,-1),2,HexColor('#51a8a4')),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]));t.spaceAfter=8;story.append(t)
                else:story.append(Arabic(b['text'],after=5,keep=plan['id']=='octaclub' and b['text'].endswith(':')))
            elif typ=='link':story.append(Arabic(b.get('label') or b['url'],size=9.5,color=TEAL,link=b['url'],after=7))
            elif typ=='space':story.append(Spacer(1,5))
    doc=SimpleDocTemplate(str(file),pagesize=A4,rightMargin=14*mm,leftMargin=14*mm,topMargin=34*mm,bottomMargin=20*mm,title=plan['title'],author='Octagram',pageCompression=1)
    doc.build(story,onFirstPage=header,onLaterPages=header,canvasmaker=NumberedCanvas)
    print('Rendered',file.name,flush=True)

if __name__=='__main__':
    selected=[p for p in PLANS if p.get('pdfSource')!='original' and (len(sys.argv)<2 or p['id']==sys.argv[1])]
    for plan in selected:render(plan)
