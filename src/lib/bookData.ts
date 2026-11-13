import { supabase, CARD_BUCKET } from './supabase';
import type { TeacherChapter, Teacher, Memory, Quote, GreetingCard } from '../types';

export async function loadBook(): Promise<TeacherChapter[]> {
  if (!supabase) return [];
  const { data: teachers, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('published', true)
    .order('sort_order');

  if (error) throw error;
  const rows = (teachers ?? []) as Teacher[];

  const chapters = await Promise.all(rows.map(async (teacher) => {
    const [memoryResult, quoteResult, cardResult] = await Promise.all([
      supabase!.from('memories').select('*').eq('teacher_id', teacher.id).order('sort_order'),
      supabase!.from('quotes').select('*').eq('teacher_id', teacher.id).order('sort_order'),
      supabase!.from('greeting_cards').select('*').eq('teacher_id', teacher.id).order('sort_order')
    ]);

    if (memoryResult.error) throw memoryResult.error;
    if (quoteResult.error) throw quoteResult.error;
    if (cardResult.error) throw cardResult.error;

    const cards = await Promise.all(((cardResult.data ?? []) as GreetingCard[]).map(async (card) => {
      const { data, error: urlError } = await supabase!.storage
        .from(CARD_BUCKET).createSignedUrl(card.storage_path, 60 * 30);
      if (urlError) console.warn('Không tạo được URL ảnh:', urlError.message);
      return { ...card, imageUrl: data?.signedUrl };
    }));

    return {
      ...teacher,
      memories: (memoryResult.data ?? []) as Memory[],
      quotes: (quoteResult.data ?? []) as Quote[],
      cards
    };
  }));

  return chapters;
}
