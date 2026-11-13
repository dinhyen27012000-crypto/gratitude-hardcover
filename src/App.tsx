import { useEffect, useState } from 'react';
import Book from './components/Book';
import Admin from './components/Admin';
import { loadBook } from './lib/bookData';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import type { TeacherChapter } from './types';

export default function App() {
  const [admin, setAdmin] = useState(false);
  const [chapters, setChapters] = useState<TeacherChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh() {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    try {
      setError('');
      const data = await loadBook();
      setChapters(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu.');
    } finally { setLoading(false); }
  }

  useEffect(() => {
    refresh();
    if (!supabase) return;
    const channel = supabase.channel('public-book-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'greeting_cards' }, refresh)
      .subscribe();
    return () => { supabase?.removeChannel(channel); };
  }, []);

  return admin
    ? <Admin onBack={() => { setAdmin(false); refresh(); }}/>
    : <>
        {loading && <div className="loading-ribbon">Đang mở cuốn sách…</div>}
        {error && <div className="error-ribbon">Chưa tải được dữ liệu: {error}. Kiểm tra cấu hình Supabase và chính sách RLS.</div>}
        {!isSupabaseConfigured && <div className="setup-ribbon">Bản xem trước đang dùng dữ liệu trống. Kết nối Supabase trong file .env để hiển thị nội dung thật.</div>}
        <Book chapters={chapters} onAdmin={() => setAdmin(true)}/>
      </>;
}
