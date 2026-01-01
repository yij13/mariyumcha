
export interface Joke {
  setup: string;
  punchline: string;
  category: string;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum Language {
  ENGLISH = 'en',
  CHINESE = 'zh'
}
