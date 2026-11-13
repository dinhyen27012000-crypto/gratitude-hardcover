export type SubjectTheme = {
  label: string;
  className: string;
  motif: string;
  accent: string;
};

const themes: Record<string, SubjectTheme> = {
  'ngữ văn': { label: 'Ngữ văn', className: 'theme-literature', motif: '✒', accent: '#986d4c' },
  'toán': { label: 'Toán học', className: 'theme-math', motif: '∑', accent: '#526b83' },
  'vật lí': { label: 'Vật lí', className: 'theme-physics', motif: '✧', accent: '#6b648e' },
  'hóa học': { label: 'Hóa học', className: 'theme-chemistry', motif: '⚗', accent: '#588477' },
  'sinh học': { label: 'Sinh học', className: 'theme-biology', motif: '❧', accent: '#68835e' },
  'lịch sử': { label: 'Lịch sử', className: 'theme-history', motif: '⌖', accent: '#946d49' },
  'địa lí': { label: 'Địa lí', className: 'theme-geography', motif: '◎', accent: '#56818a' },
  'tiếng anh': { label: 'Ngoại ngữ', className: 'theme-language', motif: '✉', accent: '#a05d56' },
  'tin học': { label: 'Tin học', className: 'theme-informatics', motif: '▦', accent: '#557b8a' },
  'giáo dục thể chất': { label: 'Giáo dục thể chất', className: 'theme-sport', motif: '✦', accent: '#9a7650' },
  'âm nhạc': { label: 'Âm nhạc', className: 'theme-music', motif: '♫', accent: '#98709a' },
  'mĩ thuật': { label: 'Mĩ thuật', className: 'theme-art', motif: '✿', accent: '#b2765f' },
  'default': { label: 'Trang tri ân', className: 'theme-default', motif: '❀', accent: '#98785b' }
};

export function getSubjectTheme(subject: string): SubjectTheme {
  const normalized = subject.trim().toLocaleLowerCase('vi');
  return themes[normalized] ?? themes.default;
}
