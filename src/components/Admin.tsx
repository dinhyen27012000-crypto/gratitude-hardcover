import { useEffect, useState } from 'react';
import { supabase, CARD_BUCKET } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { ArrowLeft, LogOut, Plus, Upload, Trash2, RefreshCw } from 'lucide-react';
import type { Teacher } from '../types';

type Props = { onBack: () => void };

export default function Admin({ onBack }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selected, setSelected] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function refresh() {
    if (!supabase) return;
    const { data, error } = await supabase.from('teachers').select('*').order('sort_order');
    if (error) setNotice(error.message);
    else setTeachers((data ?? []) as Teacher[]);
  }

  useEffect(() => { if (session) refresh(); }, [session]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true); setNotice('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setNotice('Đăng nhập chưa thành công: ' + error.message);
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setTeachers([]); setSelected('');
  }

  async function addTeacher(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const form = new FormData(e.currentTarget);
    setBusy(true); setNotice('');
    const { error } = await supabase.from('teachers').insert({
      name: String(form.get('name')).trim(),
      subject: String(form.get('subject')).trim(),
      intro: String(form.get('intro') || ''),
      quote_intro: String(form.get('quote_intro') || ''),
      theme_key: String(form.get('subject')).trim().toLocaleLowerCase('vi'),
      sort_order: teachers.length,
      published: false
    });
    setBusy(false);
    if (error) setNotice(error.message);
    else { setNotice('Đã thêm chương ở trạng thái bản nháp.'); e.currentTarget.reset(); refresh(); }
  }

  async function publishTeacher(teacher: Teacher) {
    if (!supabase) return;
    const { error } = await supabase.from('teachers').update({ published: !teacher.published }).eq('id', teacher.id);
    setNotice(error ? error.message : (teacher.published ? 'Đã chuyển về bản nháp.' : 'Đã xuất bản chương.'));
    refresh();
  }

  async function deleteTeacher(teacher: Teacher) {
    if (!supabase || !confirm(`Xóa chương của ${teacher.name}? Các nội dung liên quan cũng sẽ bị xóa.`)) return;
    const { error } = await supabase.from('teachers').delete().eq('id', teacher.id);
    setNotice(error ? error.message : 'Đã xóa chương.');
    if (selected === teacher.id) setSelected('');
    refresh();
  }

  async function addTextContent(e: React.FormEvent<HTMLFormElement>, table: 'memories' | 'quotes') {
    e.preventDefault();
    if (!supabase || !selected) return;
    const form = new FormData(e.currentTarget);
    const payload = table === 'memories'
      ? { teacher_id: selected, kind: String(form.get('kind')), title: String(form.get('title')), body: String(form.get('body')) }
      : { teacher_id: selected, body: String(form.get('body')), caption: String(form.get('caption') || '') };
    const { error } = await supabase.from(table).insert(payload);
    setNotice(error ? error.message : 'Đã lưu nội dung.');
    if (!error) e.currentTarget.reset();
  }

  async function uploadCard(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase || !selected) return;
    const form = new FormData(e.currentTarget);
    const file = form.get('image') as File;
    if (!file || !file.size) { setNotice('Bạn chưa chọn ảnh thiệp.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setNotice('Chỉ hỗ trợ JPG, PNG hoặc WEBP.'); return; }
    if (file.size > 10 * 1024 * 1024) { setNotice('Ảnh vượt quá 10 MB.'); return; }
    const path = `${selected}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    setBusy(true);
    const { error: uploadError } = await supabase.storage.from(CARD_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) { setBusy(false); setNotice(uploadError.message); return; }
    const { error } = await supabase.from('greeting_cards').insert({
      teacher_id: selected,
      title: String(form.get('title') || ''),
      caption: String(form.get('caption') || ''),
      storage_path: path
    });
    setBusy(false);
    if (error) {
      await supabase.storage.from(CARD_BUCKET).remove([path]);
      setNotice(error.message);
    } else { setNotice('Đã tải thiệp lên thành công.'); e.currentTarget.reset(); }
  }

  if (!supabase) return <AdminShell onBack={onBack}><div className="admin-panel"><h1>Chưa kết nối Supabase</h1><p>Hãy tạo file <code>.env</code> từ <code>.env.example</code> và điền Project URL cùng Publishable/anon key.</p></div></AdminShell>;

  if (!session) return <AdminShell onBack={onBack}>
    <form className="login-panel" onSubmit={signIn}>
      <p className="eyebrow">PRIVATE ADMIN AREA</p>
      <h1>Trang quản trị</h1>
      <p className="muted">Đăng nhập để biên tập cuốn sách tri ân.</p>
      <label>Email quản trị<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username"/></label>
      <label>Mật khẩu<input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password"/></label>
      <button className="primary-button" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      {notice && <p className="notice">{notice}</p>}
    </form>
  </AdminShell>;

  const selectedTeacher = teachers.find(t => t.id === selected);

  return <AdminShell onBack={onBack}>
    <div className="admin-dashboard">
      <header className="admin-header"><div><p className="eyebrow">BOOK EDITOR</p><h1>Quản trị cuốn sách</h1></div><button className="secondary-button" onClick={signOut}><LogOut size={16}/> Đăng xuất</button></header>
      {notice && <p className="notice">{notice}</p>}
      <div className="admin-grid">
        <section className="admin-panel">
          <h2><Plus size={18}/> Thêm chương giáo viên</h2>
          <form className="stack-form" onSubmit={addTeacher}>
            <label>Họ và tên<input name="name" required placeholder="Ví dụ: Cô Nguyễn Thị A"/></label>
            <label>Môn học<input name="subject" required placeholder="Ví dụ: Ngữ văn"/></label>
            <label>Giới thiệu<textarea name="intro" rows={3} placeholder="Một vài nét về thầy/cô…"/></label>
            <label>Câu dẫn đặc trưng<textarea name="quote_intro" rows={2} placeholder="Một câu nói gợi nhớ…"/></label>
            <button className="primary-button" disabled={busy}>Thêm chương (bản nháp)</button>
          </form>
        </section>
        <section className="admin-panel">
          <h2><RefreshCw size={18}/> Danh sách chương</h2>
          <div className="teacher-admin-list">
            {teachers.map(t => <div className="teacher-admin-row" key={t.id}>
              <button className="teacher-select" onClick={() => setSelected(t.id)}><b>{t.name}</b><small>{t.subject}</small></button>
              <span className={`status ${t.published ? 'published' : ''}`}>{t.published ? 'Đã xuất bản' : 'Bản nháp'}</span>
              <button className="tiny-button" onClick={() => publishTeacher(t)}>{t.published ? 'Ẩn' : 'Xuất bản'}</button>
              <button className="tiny-button danger" onClick={() => deleteTeacher(t)} aria-label="Xóa"><Trash2 size={14}/></button>
            </div>)}
            {!teachers.length && <p className="empty-note">Chưa có chương nào.</p>}
          </div>
        </section>
      </div>

      {selectedTeacher && <section className="admin-panel editor-panel">
        <p className="eyebrow">ĐANG BIÊN TẬP</p><h2>{selectedTeacher.name} · {selectedTeacher.subject}</h2>
        <div className="admin-grid">
          <form className="stack-form" onSubmit={e => addTextContent(e, 'memories')}>
            <h3>Thêm kỷ niệm / lời tri ân</h3>
            <label>Loại nội dung<select name="kind"><option value="memory">Góc nhìn lại kỷ niệm</option><option value="gratitude">Góc tri ân</option></select></label>
            <label>Tiêu đề<input name="title" required placeholder="Ví dụ: Tiết học đầu tiên"/></label>
            <label>Nội dung<textarea name="body" rows={5} required placeholder="Viết nội dung…"/></label>
            <button className="primary-button">Lưu nội dung</button>
          </form>
          <form className="stack-form" onSubmit={e => addTextContent(e, 'quotes')}>
            <h3>Thêm câu nói đặc trưng</h3>
            <label>Câu nói<textarea name="body" rows={3} required placeholder="Câu nói mà cả lớp nhớ…"/></label>
            <label>Chú thích<input name="caption" placeholder="Ví dụ: Trong mỗi tiết học"/></label>
            <button className="primary-button">Lưu câu nói</button>
          </form>
          <form className="stack-form" onSubmit={uploadCard}>
            <h3><Upload size={17}/> Tải thiệp lên</h3>
            <label>Tiêu đề thiệp<input name="title" placeholder="Tên tấm thiệp"/></label>
            <label>Chú thích<input name="caption" placeholder="Lời nhắn đi kèm"/></label>
            <label>Chọn ảnh<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required/></label>
            <small className="muted">JPG, PNG, WEBP · tối đa 10 MB</small>
            <button className="primary-button" disabled={busy}>{busy ? 'Đang tải…' : 'Tải thiệp lên'}</button>
          </form>
        </div>
      </section>}
    </div>
  </AdminShell>;
}

function AdminShell({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return <main className="admin-shell"><button className="back-to-book" onClick={onBack}><ArrowLeft size={16}/> Trở về cuốn sách</button>{children}</main>;
}
