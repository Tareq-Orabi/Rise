import React, { useEffect, useId, useRef, useState } from 'react';
import { logoUrl } from './assets.js';
import { normalize } from './management.js';
import './reader.css';

const arabicNumbers = new Intl.NumberFormat('ar-JO', { numberingSystem: 'arab' });
const number = value => arabicNumbers.format(value);

function Icon({ type }) {
  const paths = {
    index: <><path d="M4 5h16M4 12h16M4 19h16" /><path d="M16 3v4m-7 3v4m5 3v4" /></>,
    search: <><circle cx="10.7" cy="10.7" r="6.3" /><path d="m15.5 15.5 4.3 4.3" /></>,
    down: <path d="m6 9 6 6 6-6" />,
    download: <><path d="M12 3v11m-4-4 4 4 4-4" /><path d="M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4" /></>,
    print: <><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M7 14h10v7H7zM17 11h.01" /></>,
    previous: <><path d="M4 12h16m-6-6 6 6-6 6" /></>,
    next: <><path d="M20 12H4m6-6-6 6 6 6" /></>,
    link: <><path d="M9 15l6-6M8 13l-2 2a3 3 0 0 0 4 4l3-3M16 11l2-2a3 3 0 0 0-4-4l-3 3" /></>,
  };
  return <svg className="or-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[type]}</svg>;
}

function PlanTable({ block }) {
  return (
    <div className="or-table-wrap">
      <table className="or-table">
        {block.widths?.length === block.headers?.length && <colgroup>{block.widths.map((width, i) => <col key={i} style={{ width: `${width * 100}%` }} />)}</colgroup>}
        <thead><tr>{block.headers.map((cell, i) => <th scope="col" key={i}>{cell}</th>)}</tr></thead>
        <tbody>{block.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function PlanTask({ block }) {
  return (
    <section className="or-task">
      <div className="or-task-head"><h3>{block.title}</h3>{block.deadline && <span className="or-task-date">{block.deadline}</span>}</div>
      <div className="or-task-output"><span className="or-field-label">المخرج المطلوب</span><p>{block.deliverable}</p></div>
      <div className="or-task-acceptance"><h4>معايير القبول</h4><ul>{block.acceptance.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
      {block.dependencies?.length > 0 && <div className="or-task-dependencies"><h4>الاعتماديات والتنسيق</h4><ul>{block.dependencies.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
    </section>
  );
}

export function PlanBlocks({ page }) {
  const nodes = [];
  let bulletItems = [];
  function flushBullets() {
    if (!bulletItems.length) return;
    nodes.push(<ul className="or-list" key={`list-${nodes.length}`}>{bulletItems.map((text, i) => <li key={i}>{text}</li>)}</ul>);
    bulletItems = [];
  }
  for (const [index, block] of page.blocks.entries()) {
    if (block.type === 'bullet') { bulletItems.push(block.text); continue; }
    flushBullets();
    switch (block.type) {
      case 'code':
        nodes.push(<pre className="or-code" dir="ltr" key={index}><code>{block.text}</code></pre>);
        break;
      case 'task':
        nodes.push(<PlanTask block={block} key={index} />);
        break;
      case 'h':
        nodes.push(<h3 key={index}>{block.text}</h3>);
        break;
      case 'p':
        nodes.push(<p className={block.bold ? 'or-emphasis' : undefined} key={index}>{block.bold ? <strong>{block.text}</strong> : block.text}</p>);
        break;
      case 'table':
        nodes.push(<PlanTable block={block} key={index} />);
        break;
      case 'link':
        nodes.push(<div className="or-reference" key={index}><Icon type="link" /><a href={block.url} target="_blank" rel="noopener noreferrer" dir="auto">{block.label || block.url}</a></div>);
        break;
      case 'space':
        nodes.push(<div key={index} className="or-space" aria-hidden="true" />);
        break;
      default:
        if (block.text) nodes.push(<p key={index}>{block.text}</p>);
    }
  }
  flushBullets();
  return <div className="or-body">{nodes}</div>;
}

function PlanSubtitle({ plan }) {
  const lines = [...new Set([plan.subtitle, plan.role].filter(Boolean))];
  return lines.length > 0 && <div className="or-subtitles">{lines.map(line => <span key={line}><bdi dir="auto">{line}</bdi></span>)}</div>;
}

export function PlanReader({ plan, pageIndex = 0, onSelectPage, onPrint }) {
  const [indexOpen, setIndexOpen] = useState(false);
  const [query, setQuery] = useState('');
  const indexId = useId();
  const titleId = useId();
  const toggle = useRef(null);
  const sectionTitle = useRef(null);
  const focusSection = useRef(false);
  const safePageIndex = Math.max(0, Math.min(Math.trunc(Number(pageIndex)) || 0, (plan?.pages?.length || 1) - 1));
  useEffect(() => { setIndexOpen(false); setQuery(''); }, [plan?.id]);
  useEffect(() => {
    if (!focusSection.current || !sectionTitle.current) return;
    focusSection.current = false;
    sectionTitle.current.focus({ preventScroll: true });
    sectionTitle.current.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [safePageIndex, plan?.id]);
  if (!plan?.pages?.length) return null;
  const page = plan.pages[safePageIndex];
  const count = plan.pages.length;
  const needle = normalize(query.trim());
  const sections = plan.pages.map((section, index) => ({ title: section.title, index }))
    .filter(({ title, index }) => !needle || normalize(title).includes(needle) || String(index + 1) === needle || number(index + 1) === needle);
  const sectionCount = count === 1 ? 'قسم واحد' : count === 2 ? 'قسمان'
    : `${number(count)} ${count <= 10 ? 'أقسام' : 'قسمًا'}`;
  const selectPage = nextIndex => {
    setIndexOpen(false);
    setQuery('');
    if (nextIndex === safePageIndex) {
      sectionTitle.current?.focus({ preventScroll: true });
      sectionTitle.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
      return;
    }
    focusSection.current = true;
    onSelectPage(nextIndex);
  };
  const onIndexKeyDown = event => {
    if (event.key === 'Escape' && indexOpen) {
      setIndexOpen(false);
      toggle.current?.focus();
    }
  };
  return (
    <section className="octa-reader" dir="rtl" lang="ar" aria-labelledby={titleId}>
      <header className="or-head">
        <div className="or-head-copy"><div className="or-document-label">{plan.id === 'octaclub' ? 'برنامج إعادة الهندسة · ديسمبر 2026–فبراير 2027' : plan.id === 'octacare' ? 'مشروع OctaCare · أبريل–ديسمبر 2027 · مقترح للاعتماد' : 'الخطة التشغيلية السنوية · 2027'}</div><h1 id={titleId}>{plan.title}</h1><PlanSubtitle plan={plan} /></div>
        <div className="or-actions">
          <a className="or-control or-download" href={plan.pdfUrl} download={`Octagram-2027-${plan.id}.pdf`}><Icon type="download" /> {plan.pdfLabel || 'تحميل PDF'}</a>
          <button className="or-control" type="button" onClick={onPrint || (() => window.print())}><Icon type="print" /> طباعة الخطة</button>
        </div>
      </header>
      <div className="or-layout">
        <aside className="or-index" onKeyDown={onIndexKeyDown}>
          <button ref={toggle} type="button" className="or-index-toggle" onClick={() => setIndexOpen(!indexOpen)} aria-expanded={indexOpen} aria-controls={indexId}>
            <span className="or-index-label"><Icon type="index" /> فهرس الخطة</span>
            <span className="or-index-count">{sectionCount}</span><span className={indexOpen ? 'or-chevron is-open' : 'or-chevron'}><Icon type="down" /></span>
          </button>
          <div className="or-rail-head" aria-hidden="true"><span className="or-index-label"><Icon type="index" /> فهرس الخطة</span><span className="or-index-count">{sectionCount}</span></div>
          <nav id={indexId} className={'or-index-content' + (indexOpen ? ' is-open' : '')} aria-label="فهرس أقسام الخطة">
            {count > 4 && <label className="or-find"><Icon type="search" /><input type="search" aria-label="بحث في فهرس الخطة" placeholder="بحث في الفهرس" value={query} onChange={event => setQuery(event.target.value)} /></label>}
            <ol className="or-index-list">{sections.map(({ title, index }) => <li key={index}><button type="button" aria-current={index === safePageIndex ? 'page' : undefined} onClick={() => selectPage(index)}><span className="or-section-num" aria-hidden="true">{number(index + 1)}</span><span>{title}</span></button></li>)}</ol>
            {sections.length === 0 && <p className="or-no-match" role="status">لا توجد أقسام مطابقة.</p>}
          </nav>
        </aside>
        <article className="or-paper">
          <div className="or-meta"><span>القسم {number(safePageIndex + 1)} من {number(count)}</span><span className="or-progress" aria-hidden="true"><span style={{ width: `${(safePageIndex + 1) / count * 100}%` }} /></span></div>
          <h2 ref={sectionTitle} className="or-section-heading" tabIndex={-1}>{page.title}</h2>
          <PlanBlocks page={page} />
          <nav className="or-pager" aria-label="تصفح أقسام الخطة">
            <button type="button" disabled={safePageIndex === 0} onClick={() => selectPage(safePageIndex - 1)} className="or-pager-button"><Icon type="previous" /><span><small>القسم السابق</small>{plan.pages[safePageIndex - 1]?.title}</span></button>
            <button type="button" disabled={safePageIndex === count - 1} onClick={() => selectPage(safePageIndex + 1)} className="or-pager-button or-forward"><span><small>القسم التالي</small>{plan.pages[safePageIndex + 1]?.title}</span><Icon type="next" /></button>
          </nav>
        </article>
      </div>
    </section>
  );
}

export function PrintDocument({ plan }) {
  if (!plan?.pages?.length) return null;
  return (
    <div className="octa-print-document" dir="rtl" lang="ar" aria-label={plan.title}>
      {plan.pages.map((page, i) => (
        <section key={`${plan.id}-${i}`} className="or-print-sheet" data-print-page={i + 1}>
          <header className="or-print-head">
            <div className="or-print-brand"><img src={logoUrl} alt="Octagram" /><span dir="ltr">OCTAGRAM</span></div>
            <div className="or-print-series">خطة النهوض <bdi>2027</bdi></div>
          </header>
          <div className="or-print-title"><p>{plan.title}</p>{i === 0 && <PlanSubtitle plan={plan} />}<h2>{page.title}</h2></div>
          <PlanBlocks page={page} />
          <footer className="or-print-foot"><span>{plan.name || plan.title}</span><span>القسم {number(i + 1)} من {number(plan.pages.length)}</span></footer>
        </section>
      ))}
    </div>
  );
}
