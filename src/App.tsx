import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Landmark,
  ChartNoAxesCombined,
  Vote,
  ScrollText,
  Flag,
  MapPinned,
  Users,
  Newspaper,
  Globe2,
  History as HistoryIcon,
  Settings,
  ArrowRight,
  ChevronRight,
  Save,
  Bell,
  Menu,
  X,
  CircleHelp,
  Check,
  LogOut,
  Shield,
  ChevronDown,
  Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MainMenu, CharacterCreation, GlobalSettings } from './components/Menu';
import { Overview } from './components/Overview';
import {
  Congress,
  DecisionModal,
  Diplomacy,
  Economy,
  Elections,
  GameSettings,
  History,
  Manual,
  MapPage,
  Newspaper as NewsPage,
  Parties,
  Policies,
  Presidency,
} from './components/Pages';
import { Bar, Modal, Seal } from './components/ui';
import { dateLabel, number } from './engine/data';
import type { Profile } from './engine/types';
import { parseSave } from './engine/save';
import { useGame } from './store';
import type { Screen } from './store';
const NAV: { id: Screen; label: string; icon: LucideIcon; section?: string }[] = [
  { id: 'overview', label: 'Visão geral', icon: LayoutDashboard, section: 'GABINETE' },
  { id: 'presidency', label: 'Presidência', icon: Landmark },
  { id: 'economy', label: 'Economia', icon: ChartNoAxesCombined },
  { id: 'congress', label: 'Congresso', icon: Vote },
  { id: 'policies', label: 'Políticas públicas', icon: ScrollText },
  { id: 'elections', label: 'Eleições', icon: Flag, section: 'CENÁRIO POLÍTICO' },
  { id: 'map', label: 'Mapa do Brasil', icon: MapPinned },
  { id: 'parties', label: 'Partidos', icon: Users },
  { id: 'news', label: 'Notícias', icon: Newspaper },
  { id: 'diplomacy', label: 'Rel. internacionais', icon: Globe2 },
  { id: 'history', label: 'Histórico', icon: HistoryIcon, section: 'ARQUIVO' },
  { id: 'settings', label: 'Configurações', icon: Settings },
];
const SUBTITLES: Record<Screen, string> = {
  overview: 'O país em perspectiva. Suas decisões em movimento.',
  presidency: 'O mandato, a sociedade e a construção do seu legado.',
  economy: 'Os números contam uma parte da história.',
  congress: 'Maiorias se constroem. Acordos têm consequências.',
  policies: 'Prioridades precisam de recursos, tempo e apoio.',
  elections: 'A próxima eleição começa nas escolhas de hoje.',
  map: 'Vinte e sete unidades. Muitos Brasis.',
  parties: 'Interesses, convicções e a aritmética do poder.',
  news: 'As escolhas do gabinete, nas páginas do país.',
  diplomacy: 'O mundo também participa do seu mandato.',
  history: 'O registro das escolhas que trouxeram você até aqui.',
  settings: 'Seu arquivo, suas preferências, sua campanha.',
};
export default function App() {
  const {
    game: g,
    screen,
    setScreen,
    act,
    newGame,
    load,
    toast,
    notify,
    save,
    savedAt,
    reducedMotion,
    autosave,
  } = useGame();
  const [view, setView] = useState<'menu' | 'creation' | 'game'>('menu');
  const [settings, setSettings] = useState(false);
  const [decision, setDecision] = useState(false);
  const [help, setHelp] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [selectedState, setSelectedState] = useState('SP');
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [newProfile, setNewProfile] = useState<{ profile: Profile; seed: number } | null>(null);
  const [endDismissed, setEndDismissed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => notify(null), 6000);
    return () => clearTimeout(id);
  }, [toast, notify]);
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
  }, [reducedMotion]);
  useEffect(() => {
    if (view === 'game') mainRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    setMobile(false);
  }, [screen, view]);
  const openImport = () => fileRef.current?.click();
  const continueGame = () => {
    if (g || load()) setView('game');
  };
  const stateLink = (uf: string) => {
    setSelectedState(uf);
    setScreen('map');
  };
  const advance = () => {
    if (!g) return;
    if (g.eventId) {
      setDecision(true);
      return;
    }
    if (g.elections.phase === 'runoff') {
      setScreen('elections');
      notify('Conclua o segundo turno para avançar.');
      return;
    }
    act({ type: 'advance' });
    if (g.turn === 44) setScreen('elections');
  };
  const start = (profile: Profile, seed: number) => {
    if (g) {
      setNewProfile({ profile, seed });
      return;
    }
    newGame(profile, seed);
    setEndDismissed(false);
    setView('game');
  };
  let content = null;
  if (g) {
    switch (screen) {
      case 'overview':
        content = <Overview game={g} onDecision={() => setDecision(true)} onState={stateLink} />;
        break;
      case 'presidency':
        content = <Presidency game={g} onDecision={() => setDecision(true)} />;
        break;
      case 'economy':
        content = <Economy game={g} />;
        break;
      case 'congress':
        content = <Congress game={g} />;
        break;
      case 'policies':
        content = <Policies game={g} />;
        break;
      case 'elections':
        content = <Elections game={g} />;
        break;
      case 'map':
        content = <MapPage key={selectedState} game={g} initialState={selectedState} />;
        break;
      case 'parties':
        content = <Parties game={g} />;
        break;
      case 'news':
        content = <NewsPage game={g} />;
        break;
      case 'diplomacy':
        content = <Diplomacy game={g} />;
        break;
      case 'history':
        content = <History game={g} />;
        break;
      case 'settings':
        content = (
          <GameSettings
            game={g}
            onImport={openImport}
            onMenu={() => setView('menu')}
            onHelp={() => setHelp(true)}
          />
        );
        break;
    }
  }
  return (
    <>
      <input
        ref={fileRef}
        hidden
        type="file"
        accept=".json,application/json"
        aria-label="Arquivo de salvamento"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          try {
            if (file.size > 2_000_000) throw new Error('O arquivo deve ter no máximo 2 MB.');
            const text = await file.text();
            parseSave(text);
            setPendingImport(text);
          } catch (error) {
            notify(error instanceof Error ? error.message : 'Não foi possível ler o arquivo.');
          }
        }}
      />
      {view === 'menu' ? (
        <MainMenu
          hasGame={!!g}
          onNew={() => setView('creation')}
          onContinue={continueGame}
          onImport={openImport}
          onSettings={() => setSettings(true)}
        />
      ) : view === 'creation' ? (
        <CharacterCreation onBack={() => setView('menu')} onStart={start} />
      ) : (
        g && (
          <div className="app-shell">
            <a className="skip-link" href="#main-content">
              Pular para o conteúdo
            </a>
            {mobile && <div className="sidebar-scrim" onClick={() => setMobile(false)} />}
            <aside className={`sidebar ${mobile ? 'open' : ''}`}>
              <button
                className="sidebar-brand"
                onClick={() => setView('menu')}
                aria-label="REPÚBLICA — menu inicial"
              >
                <Seal />
                <span>
                  REPÚBLICA<small>SIMULADOR POLÍTICO</small>
                </span>
              </button>
              <div className="mandate-label">
                <span className="live-dot" /> MANDATO 2027—2030 <span>I</span>
              </div>
              <nav className="sidebar-nav" aria-label="Navegação do gabinete">
                {NAV.map((item) => (
                  <div key={item.id}>
                    {item.section && <span className="nav-section">{item.section}</span>}
                    <button
                      className={screen === item.id ? 'active' : ''}
                      aria-label={item.label}
                      aria-current={screen === item.id ? 'page' : undefined}
                      onClick={() => setScreen(item.id)}
                    >
                      <item.icon size={17} strokeWidth={1.5} />
                      <span>{item.label}</span>
                      {item.id === 'news' && g.history.length > 1 && <i className="nav-dot" />}
                      {item.id === 'elections' && g.elections.phase === 'runoff' && (
                        <span className="nav-badge" aria-hidden="true">
                          2º
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </nav>
              <div className="sidebar-bottom">
                <button className="help-button" onClick={() => setHelp(true)}>
                  <CircleHelp size={17} />
                  <span>Manual do gabinete</span>
                  <ArrowRight size={14} />
                </button>
                <div className="sidebar-country">
                  <span className="brazil-flag">
                    <i />
                  </span>
                  <div>
                    <strong>República Federativa</strong>
                    <small>Cenário fictício · Brasil</small>
                  </div>
                  <Shield size={14} />
                </div>
              </div>
            </aside>
            <div className="workspace-shell">
              <header className="topbar">
                <button
                  className="icon-button mobile-menu"
                  aria-label={mobile ? 'Fechar navegação' : 'Abrir navegação'}
                  onClick={() => setMobile(!mobile)}
                >
                  {mobile ? <X size={20} /> : <Menu size={20} />}
                </button>
                <div className="topbar-profile">
                  <div className="avatar">
                    {g.profile.firstName[0]}
                    {g.profile.lastName[0]}
                  </div>
                  <div>
                    <strong>
                      <span className="president-name">
                        {g.profile.firstName} {g.profile.lastName}
                      </span>
                      <span className="profile-party">{g.profile.party}</span>
                    </strong>
                    <span className="profile-office">Presidente da República</span>
                    <time className="profile-mobile-date">{dateLabel(g.turn)}</time>
                  </div>
                </div>
                <div className="topbar-right">
                  <div className="topbar-date">
                    <span className="eyebrow">BRASÍLIA, DISTRITO FEDERAL</span>
                    <strong>
                      {dateLabel(g.turn)} <ChevronDown size={12} />
                    </strong>
                  </div>
                  <span className="topbar-divider" />
                  <div className="topbar-capital">
                    <span>Capital político</span>
                    <strong>
                      {number(g.capital, 0)}
                      <small> CP</small>
                    </strong>
                  </div>
                  <button
                    className={`icon-button notification ${g.eventId ? 'has-event' : ''}`}
                    aria-label={g.eventId ? 'Abrir decisão pendente' : 'Sem decisões pendentes'}
                    onClick={() =>
                      g.eventId ? setDecision(true) : notify('Não há decisões pendentes neste mês.')
                    }
                  >
                    <Bell size={18} />
                    {g.eventId && <i />}
                  </button>
                  <button className="advance-button" disabled={g.finished} onClick={advance}>
                    {g.finished ? 'Mandato concluído' : 'Avançar mês'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </header>
              <main className="main-content" id="main-content" ref={mainRef}>
                <div className="page-heading">
                  <div>
                    <div className="breadcrumb">
                      <span>BRASIL</span>
                      <ChevronRight size={10} />
                      <span>
                        {screen === 'overview'
                          ? 'PAINEL DE GOVERNO'
                          : NAV.find((n) => n.id === screen)?.label.toUpperCase()}
                      </span>
                    </div>
                    <h1>{NAV.find((n) => n.id === screen)?.label}</h1>
                    <p>{SUBTITLES[screen]}</p>
                  </div>
                  <div className="heading-actions">
                    <span className="simulation-label">
                      <span /> DADOS SIMULADOS
                    </span>
                    <button className="button compact" onClick={save}>
                      <Save size={13} />
                      <span>Salvar</span>
                    </button>
                  </div>
                </div>
                {g.elections.phase === 'runoff' && screen !== 'elections' && (
                  <div className="notice">
                    <Flag size={17} />
                    <strong>O segundo turno está aberto.</strong>
                    <span>Conclua a eleição antes do próximo mês.</span>
                    <button className="text-button" onClick={() => setScreen('elections')}>
                      Ir à apuração <ArrowRight size={14} />
                    </button>
                  </div>
                )}
                {content}
                <footer className="game-footer">
                  <span>
                    <span className="footer-dot" />
                    {autosave
                      ? savedAt
                        ? `Salvo às ${savedAt}`
                        : 'Salvamento automático ativo'
                      : 'Salvamento manual'}
                    <span className="footer-divider">/</span> Seed {g.seed}
                  </span>
                  <span>
                    REPÚBLICA <b>01</b>
                    <span className="footer-divider">/</span> O poder tem um preço.
                  </span>
                </footer>
              </main>
            </div>
          </div>
        )
      )}
      {settings && <GlobalSettings onClose={() => setSettings(false)} />}
      {decision && g?.eventId && <DecisionModal game={g} onClose={() => setDecision(false)} />}
      {help && <Manual onClose={() => setHelp(false)} />}
      {pendingImport && (
        <Modal title="Importar esta campanha?" onClose={() => setPendingImport(null)}>
          <div className="prose">
            <p>
              O arquivo foi validado. Importar substituirá o salvamento deste navegador. Exporte a
              partida atual se quiser preservá-la.
            </p>
            <button
              className="button primary full"
              onClick={() => {
                try {
                  useGame.getState().importSave(pendingImport);
                  setPendingImport(null);
                  setEndDismissed(false);
                  setView('game');
                } catch (error) {
                  notify(error instanceof Error ? error.message : 'Erro ao importar.');
                }
              }}
            >
              Importar e continuar <ArrowRight size={15} />
            </button>
          </div>
        </Modal>
      )}
      {newProfile && (
        <Modal title="Assumir um novo mandato?" onClose={() => setNewProfile(null)}>
          <div className="prose">
            <p>
              Uma nova campanha substituirá o salvamento atual. Para manter uma cópia, exporte sua
              partida nas configurações antes de continuar.
            </p>
            <button
              className="button primary full"
              onClick={() => {
                newGame(newProfile.profile, newProfile.seed);
                setNewProfile(null);
                setEndDismissed(false);
                setView('game');
              }}
            >
              Começar nova campanha <ArrowRight size={15} />
            </button>
          </div>
        </Modal>
      )}
      {view === 'game' && g?.finished && !endDismissed && (
        <Modal
          title="O poder passa. O legado permanece."
          onClose={() => setEndDismissed(true)}
          wide
        >
          <div className="ending">
            <Trophy size={38} strokeWidth={1} />
            <span className="eyebrow gold-text">BALANÇO DO MANDATO · 2027—2030</span>
            <h3>{g.elections.won ? 'A confiança foi renovada.' : 'Um mandato chega ao fim.'}</h3>
            <p>
              {g.elections.won
                ? 'Sua candidatura conquistou a reeleição. Este ciclo de quatro anos está completo.'
                : 'O eleitorado escolheu a alternância. As escolhas do seu governo continuam registradas.'}
            </p>
            <div className="ending-stats">
              <div>
                <strong>{number(g.metrics.approval)}%</strong>
                <span>Aprovação final</span>
              </div>
              <div>
                <strong>{Object.values(g.policies).filter((v) => v > 0).length}</strong>
                <span>Políticas em vigor</span>
              </div>
              <div>
                <strong>{number(g.metrics.debt)}%</strong>
                <span>Dívida / PIB</span>
              </div>
            </div>
            <Bar value={g.metrics.trust} label="Confiança institucional final" />
            <p className="help">
              Confiança nas instituições: {number(g.metrics.trust)} / 100. Reeleição é um resultado;
              o legado também está na economia, nos serviços e na estabilidade.
            </p>
            <div className="ending-buttons">
              <button
                className="button primary"
                onClick={() => {
                  setEndDismissed(true);
                  setScreen('history');
                }}
              >
                Rever o histórico <HistoryIcon size={15} />
              </button>
              <button
                className="button"
                onClick={() => {
                  setEndDismissed(true);
                  setView('menu');
                }}
              >
                Voltar ao menu <LogOut size={15} />
              </button>
            </div>
          </div>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          <span>{toast}</span>
          <button className="icon-button" aria-label="Fechar aviso" onClick={() => notify(null)}>
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}
