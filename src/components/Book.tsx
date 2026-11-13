import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, BookOpen, List, X } from 'lucide-react';
import type { TeacherChapter } from '../types';
import { getSubjectTheme } from '../data/subjectThemes';
import React from 'react'
type Props = { chapters: TeacherChapter[]; onAdmin: () => void };

type Page = { key: string; kind: string; teacher?: TeacherChapter };

export default function Book({ chapters, onAdmin }: Props) {
  const [opened, setOpened] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const pages = useMemo<Page[]>(() => {
    const result: Page[] = [
      { key: 'letter', kind: 'letter' },
      { key: 'contents', kind: 'contents' }
    ];
    chapters.forEach((teacher) => result.push({ key: teacher.id, kind: 'teacher', teacher }));
    result.push({ key: 'closing', kind: 'closing' });
    return result;
  }, [chapters]);

  const current = pages[pageIndex];
  const next = () => setPageIndex((v) => Math.min(v + 1, pages.length - 1));
  const previous = () => setPageIndex((v) => Math.max(v - 1, 0));
  const jumpTo = (teacherId: string) => {
    const index = pages.findIndex((p) => p.key === teacherId);
    if (index >= 0) setPageIndex(index);
    setTocOpen(false);
  };

  if (!opened) {
    return (
      <main className="cover-stage">
        <div className="cover-shadow" />
        <motion.button
          className="hardcover"
          initial={{ rotateY: -12, y: 18, opacity: 0 }}
          animate={{ rotateY: 0, y: 0, opacity: 1 }}
          whileHover={{ y: -7, rotateY: -4 }}
          transition={{ duration: .8, ease: 'easeOut' }}
          onClick={() => setOpened(true)}
          aria-label="Mở cuốn sách tri ân"
        >
          <span className="cover-spine" />
          <span className="cover-corner corner-one" />
          <span className="cover-corner corner-two" />
          <span className="cover-flower flower-one">✿</span>
          <span className="cover-flower flower-two">❧</span>
          <span className="cover-small">A BOOK OF GRATITUDE · 2026</span>
          <span className="cover-rule" />
          <span className="cover-title">Những Trang<br/><i>Thương Mến</i></span>
          <span className="cover-subtitle">Lưu giữ những điều đẹp đẽ<br/>trên hành trình trưởng thành</span>
          <span className="cover-stamp">11A3<br/>♡</span>
          <span className="cover-open"><BookOpen size={15}/> MỞ SÁCH</span>
        </motion.button>
        <button className="admin-entry" onClick={onAdmin}>Quản trị viên</button>
      </main>
    );
  }

  return (
    <main className="reader-shell">
      <header className="reader-toolbar">
        <div className="toolbar-brand"><span>✿</span> NHỮNG TRANG THƯƠNG MẾN</div>
        <div className="toolbar-actions">
          <button className="icon-button" onClick={() => setTocOpen(true)} aria-label="Mục lục"><List size={18}/><span>Mục lục</span></button>
          <button className="text-button" onClick={() => { setOpened(false); setPageIndex(0); }}>Đóng sách</button>
        </div>
      </header>

      <section className="book-area">
        <div className="book-object">
          <div className="book-pages-edge" />
          <AnimatePresence mode="wait">
            <motion.article
              key={current.key}
              className={`paper-page ${current.kind === 'teacher' && current.teacher ? getSubjectTheme(current.teacher.subject).className : ''}`}
              initial={{ rotateY: pageIndex > 0 ? 14 : -14, opacity: 0, x: pageIndex > 0 ? 35 : -35 }}
              animate={{ rotateY: 0, opacity: 1, x: 0 }}
              exit={{ rotateY: pageIndex > 0 ? -16 : 16, opacity: 0, x: pageIndex > 0 ? -25 : 25 }}
              transition={{ duration: .48, ease: [.22, .7, .2, 1] }}
            >
              <div className="paper-texture" />
              {current.kind === 'letter' && <LetterPage onNext={next}/>}
              {current.kind === 'contents' && <ContentsPage chapters={chapters} onJump={jumpTo}/>}
              {current.kind === 'teacher' && current.teacher && <TeacherPage teacher={current.teacher} onImage={setLightbox}/>}
              {current.kind === 'closing' && <ClosingPage/>}
              <div className="page-number">{String(pageIndex + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}</div>
            </motion.article>
          </AnimatePresence>
        </div>
        <div className="page-controls">
          <button onClick={previous} disabled={pageIndex === 0}><ArrowLeft size={17}/> Trang trước</button>
          <span>{pageIndex + 1} / {pages.length}</span>
          <button onClick={next} disabled={pageIndex === pages.length - 1}>Trang sau <ArrowRight size={17}/></button>
        </div>
      </section>

      {tocOpen && (
        <div className="modal-backdrop" onClick={() => setTocOpen(false)}>
          <section className="toc-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setTocOpen(false)}><X size={18}/></button>
            <p className="eyebrow">THE CONTENTS</p>
            <h2>Mục lục cuốn sách</h2>
            <button className="toc-row" onClick={() => { setPageIndex(0); setTocOpen(false); }}><span>01</span> Lời ngỏ</button>
            <button className="toc-row" onClick={() => { setPageIndex(1); setTocOpen(false); }}><span>02</span> Mục lục</button>
            {chapters.map((teacher, i) => (
              <button className="toc-row" key={teacher.id} onClick={() => jumpTo(teacher.id)}>
                <span>{String(i + 3).padStart(2, '0')}</span>
                {teacher.name}<small>{teacher.subject}</small>
              </button>
            ))}
            <button className="toc-row" onClick={() => { setPageIndex(pages.length - 1); setTocOpen(false); }}><span>✧</span> Lời kết</button>
          </section>
        </div>
      )}
      {lightbox && <div className="lightbox" onClick={() => setLightbox(null)}><button onClick={() => setLightbox(null)}><X/></button><img src={lightbox} alt="Thiệp tri ân phóng to"/></div>}
    </main>
  );
}

function LetterPage({ onNext }: { onNext: () => void }) {
  return <div className="page-content letter-page">
    <p className="eyebrow">A LETTER FROM OUR CLASS</p>
    <div className="pressed-flower">✿</div>
    <h1>Gửi những người<br/><i>gieo mầm tri thức</i></h1>
    <p className="handwritten">Có những bài học rồi sẽ khép lại, nhưng tình cảm và những điều thầy cô trao gửi sẽ còn ở lại thật lâu...</p>
    <p>Cuốn sách nhỏ này được tạo nên từ những kỷ niệm, những lời muốn nói và những tấm thiệp mà chúng em dành tặng thầy cô. Mỗi trang sách là một mảnh ký ức, mỗi dòng chữ là một lời cảm ơn chân thành.</p>
    <p>Cảm ơn thầy cô vì đã kiên nhẫn đồng hành, truyền cảm hứng và giúp chúng em trưởng thành hơn qua từng ngày đến lớp.</p>
    <div className="signature">Thương mến,<br/><b>Tập thể lớp 11A3</b></div>
    <button className="inline-link" onClick={onNext}>Bắt đầu hành trình <ArrowRight size={15}/></button>
  </div>;
}

function ContentsPage({ chapters, onJump }: { chapters: TeacherChapter[]; onJump: (id: string) => void }) {
  return <div className="page-content contents-page">
    <p className="eyebrow">THE CONTENTS</p>
    <h1>Mục lục</h1>
    <p className="muted">Mỗi người thầy, cô là một chương đặc biệt.</p>
    <div className="contents-list">
      {chapters.length === 0 && <p className="empty-note">Những chương tri ân đang được chuẩn bị. Hẹn bạn ở những trang tiếp theo nhé!</p>}
      {chapters.map((teacher, i) => (
        <button key={teacher.id} className="contents-item" onClick={() => onJump(teacher.id)}>
          <span className="contents-index">{String(i + 1).padStart(2, '0')}</span>
          <span className="contents-name">{teacher.name}<small>{teacher.subject}</small></span>
          <span className="contents-dots"/>
          <span className="contents-motif">{getSubjectTheme(teacher.subject).motif}</span>
        </button>
      ))}
    </div>
    <div className="taped-note">“Một người thầy tốt giống như ngọn nến — cháy hết mình để soi sáng con đường.”</div>
  </div>;
}

function TeacherPage({ teacher, onImage }: { teacher: TeacherChapter; onImage: (url: string) => void }) {
  const theme = getSubjectTheme(teacher.subject);
  const memories = teacher.memories.filter(m => m.kind === 'memory');
  const gratitude = teacher.memories.filter(m => m.kind === 'gratitude');
  return <div className="page-content teacher-page">
    <div className="chapter-topline"><span>CHAPTER · {teacher.subject.toUpperCase()}</span><span className="chapter-motif">{theme.motif}</span></div>
    <div className="teacher-heading">
      <div>
        <p className="eyebrow">A SPECIAL CHAPTER</p>
        <h1>{teacher.name}</h1>
        <span className="subject-pill">{teacher.subject}</span>
      </div>
      {teacher.portrait_path && <div className="portrait-placeholder"><span>Ảnh chân dung</span></div>}
    </div>
    {teacher.intro && <p className="teacher-intro">{teacher.intro}</p>}
    {teacher.quote_intro && <blockquote className="teacher-quote">“{teacher.quote_intro}”</blockquote>}

    <section className="chapter-section">
      <h2><span>01</span> Góc nhìn lại kỷ niệm</h2>
      {memories.length ? memories.map(m => <div className="memory-note" key={m.id}><h3>{m.title}</h3><p>{m.body}</p></div>) : <p className="empty-note">Những câu chuyện đẹp sẽ được viết vào đây...</p>}
    </section>
    <section className="chapter-section">
      <h2><span>02</span> Góc tri ân</h2>
      {gratitude.length ? gratitude.map(m => <div className="gratitude-letter" key={m.id}><p>{m.body}</p></div>) : <p className="empty-note">Một lời cảm ơn chân thành đang chờ được gửi trao.</p>}
    </section>
    <section className="chapter-section">
      <h2><span>03</span> Những câu nói thân quen</h2>
      <div className="quote-grid">
        {teacher.quotes.length ? teacher.quotes.map(q => <div className="quote-card" key={q.id}>“{q.body}”{q.caption && <small>— {q.caption}</small>}</div>) : <p className="empty-note">Những câu nói mà cả lớp sẽ còn nhớ mãi...</p>}
      </div>
    </section>
    <section className="chapter-section">
      <h2><span>04</span> Góc thiệp yêu thương</h2>
      <div className="card-gallery">
        {teacher.cards.length ? teacher.cards.map(card => card.imageUrl ? (
          <button className="greeting-card" key={card.id} onClick={() => onImage(card.imageUrl!)}>
            <img src={card.imageUrl} alt={card.title || 'Thiệp tri ân'}/>
            <span>{card.title || 'Một tấm thiệp thương mến'}</span>
            {card.caption && <small>{card.caption}</small>}
          </button>
        ) : null) : <p className="empty-note">Những tấm thiệp dành riêng cho thầy/cô sẽ được đặt tại đây.</p>}
      </div>
    </section>
    <p className="chapter-ending">Cảm ơn thầy/cô vì đã là một phần thật đẹp trong thanh xuân của chúng em. ♡</p>
  </div>;
}

function ClosingPage() {
  return <div className="page-content closing-page">
    <span className="closing-ornament">❧</span>
    <p className="eyebrow">UNTIL WE MEET AGAIN</p>
    <h1>Trang sách khép lại,<br/><i>lòng biết ơn còn mãi.</i></h1>
    <p>Có thể thời gian sẽ đưa chúng em đến những hành trình khác nhau, nhưng những bài học, lời động viên và ký ức dưới mái trường sẽ luôn là hành trang quý giá.</p>
    <p className="handwritten">Kính chúc thầy cô luôn mạnh khỏe, hạnh phúc và giữ mãi ngọn lửa yêu nghề.</p>
    <div className="signature">Với tất cả sự trân trọng,<br/><b>Những học trò thương mến</b></div>
  </div>;
}
