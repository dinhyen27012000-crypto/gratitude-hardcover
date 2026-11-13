export type Teacher = {
  id: string;
  name: string;
  subject: string;
  intro: string;
  portrait_path: string | null;
  quote_intro: string;
  theme_key: string;
  sort_order: number;
  published: boolean;
};

export type Memory = {
  id: string;
  teacher_id: string;
  kind: 'memory' | 'gratitude';
  title: string;
  body: string;
  sort_order: number;
};

export type Quote = {
  id: string;
  teacher_id: string;
  body: string;
  caption: string;
  sort_order: number;
};

export type GreetingCard = {
  id: string;
  teacher_id: string;
  title: string;
  caption: string;
  storage_path: string;
  sort_order: number;
  imageUrl?: string;
};

export type TeacherChapter = Teacher & {
  memories: Memory[];
  quotes: Quote[];
  cards: GreetingCard[];
};
