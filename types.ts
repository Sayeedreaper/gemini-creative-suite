export enum AppTab {
  Chat = 'CHAT',
  Analyze = 'ANALYZE',
  Story = 'STORY'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface StoryState {
  image: File | null;
  imagePreview: string | null;
  generatedStory: string;
  isLoading: boolean;
  isPlayingAudio: boolean;
  error: string | null;
}

export interface AnalysisState {
  image: File | null;
  imagePreview: string | null;
  prompt: string;
  result: string;
  isLoading: boolean;
  error: string | null;
}
