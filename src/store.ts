import { create } from 'zustand';
import { createGame, execute } from './engine/game';
import { parseSave, readSave, writeSave } from './engine/save';
import type { Game, GameAction, Profile } from './engine/types';
export type Screen =
  | 'overview'
  | 'presidency'
  | 'economy'
  | 'congress'
  | 'policies'
  | 'elections'
  | 'map'
  | 'parties'
  | 'news'
  | 'diplomacy'
  | 'history'
  | 'settings';
interface Store {
  game: Game | null;
  screen: Screen;
  toast: string | null;
  savedAt: string | null;
  autosave: boolean;
  reducedMotion: boolean;
  setScreen: (screen: Screen) => void;
  notify: (text: string | null) => void;
  newGame: (profile: Profile, seed: number) => void;
  act: (action: GameAction) => void;
  save: () => void;
  load: () => boolean;
  importSave: (text: string) => void;
  setAutosave: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
}
function setting(key: string, fallback: boolean) {
  try {
    return localStorage.getItem(key) === null ? fallback : localStorage.getItem(key) === 'true';
  } catch {
    return fallback;
  }
}
export const useGame = create<Store>((set, get) => ({
  game: null,
  screen: 'overview',
  toast: null,
  savedAt: null,
  autosave: setting('republica.autosave', true),
  reducedMotion: setting('republica.motion', false),
  setScreen: (screen) => set({ screen }),
  notify: (toast) => set({ toast }),
  newGame: (profile, seed) => {
    const game = createGame(profile, seed);
    set({ game, screen: 'overview', savedAt: null });
    if (get().autosave) {
      try {
        writeSave(game);
        set({ savedAt: new Date().toLocaleTimeString('pt-BR') });
      } catch {
        set({
          toast: 'Não foi possível salvar no navegador. Exporte a partida nas configurações.',
        });
      }
    }
  },
  act: (action) => {
    const old = get().game;
    if (!old) return;
    const { game, message } = execute(old, action);
    set({ game, toast: message });
    if (game !== old && get().autosave) {
      try {
        writeSave(game);
        set({ savedAt: new Date().toLocaleTimeString('pt-BR') });
      } catch {
        set({ toast: 'Armazenamento indisponível. Exporte sua partida nas configurações.' });
      }
    }
  },
  save: () => {
    const game = get().game;
    if (!game) return;
    try {
      writeSave(game);
      set({
        savedAt: new Date().toLocaleTimeString('pt-BR'),
        toast: 'Campanha salva neste navegador.',
      });
    } catch {
      set({ toast: 'Falha ao salvar. Exporte a partida para não perder seu progresso.' });
    }
  },
  load: () => {
    const game = readSave();
    if (!game) {
      set({ toast: 'Nenhuma campanha válida foi encontrada neste navegador.' });
      return false;
    }
    set({ game, screen: 'overview', toast: 'Campanha carregada.' });
    return true;
  },
  importSave: (text) => {
    const game = parseSave(text);
    set({ game, screen: 'overview', toast: 'Partida importada com sucesso.' });
    try {
      writeSave(game);
    } catch {
      set({
        toast: 'Partida importada. Salvamento local indisponível; preserve uma cópia exportada.',
      });
    }
  },
  setAutosave: (enabled) => {
    try {
      localStorage.setItem('republica.autosave', String(enabled));
    } catch {
      /* sessão continua sem persistência */
    }
    set({ autosave: enabled });
  },
  setReducedMotion: (enabled) => {
    try {
      localStorage.setItem('republica.motion', String(enabled));
    } catch {
      /* preferência desta sessão */
    }
    set({ reducedMotion: enabled });
  },
}));
