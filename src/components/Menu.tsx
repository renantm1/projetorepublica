import { useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  ArrowLeft,
  Check,
  Minus,
  Plus,
  RotateCcw,
  Play,
  FolderOpen,
  Settings,
  Info,
} from 'lucide-react';
import { Architecture, Modal, Seal } from './ui';
import { ATTRIBUTES, DEFAULT_PROFILE, IDEOLOGIES, PARTIES, REGIONS } from '../engine/data';
import type { Profile } from '../engine/types';
import { readSave } from '../engine/save';
import { useGame } from '../store';
export function MainMenu({
  onNew,
  onContinue,
  onImport,
  onSettings,
  hasGame = false,
}: {
  onNew: () => void;
  onContinue: () => void;
  onImport: () => void;
  onSettings: () => void;
  hasGame?: boolean;
}) {
  const [credits, setCredits] = useState(false);
  const hasSave = hasGame || !!readSave();
  return (
    <main className="main-menu">
      <div className="menu-top">
        <div className="brand-line">
          <Seal small />
          <span>UM SIMULADOR POLÍTICO BRASILEIRO</span>
        </div>
        <span className="edition">EDIÇÃO 01 / CENÁRIO 2027</span>
      </div>
      <Architecture />
      <div className="menu-content">
        <div className="menu-kicker">
          <span /> A HISTÓRIA AINDA ESTÁ POR ESCREVER
        </div>
        <h1>
          REPÚBLICA<span>O poder tem um preço.</span>
        </h1>
        <div className="title-rule" />
        <p className="menu-description">
          Um país de muitos interesses.
          <br />
          Quatro anos para deixar sua marca.
        </p>
        <nav className="main-menu-nav" aria-label="Menu inicial">
          <button className="menu-primary" onClick={onNew}>
            <span>Nova campanha</span>
            <ArrowRight size={20} />
          </button>
          <button disabled={!hasSave} onClick={onContinue}>
            <Play size={15} />
            <span>Continuar campanha</span>
            <ChevronRight size={15} />
          </button>
          <button onClick={onImport}>
            <FolderOpen size={15} />
            <span>Carregar jogo</span>
          </button>
          <button onClick={onSettings}>
            <Settings size={15} />
            <span>Configurações</span>
          </button>
          <button onClick={() => setCredits(true)}>
            <Info size={15} />
            <span>Créditos</span>
          </button>
        </nav>
      </div>
      <div className="menu-caption">
        <span>15°47′ S &nbsp; 47°52′ O</span>
        <strong>BRASÍLIA, DISTRITO FEDERAL</strong>
        <span>O centro das decisões. O início da sua história.</span>
      </div>
      <footer className="menu-footer">
        <span>ESTRATÉGIA. NEGOCIAÇÃO. CONSEQUÊNCIAS.</span>
        <span>Simulação independente · v1.0</span>
      </footer>
      {credits && (
        <Modal title="Sobre REPÚBLICA" onClose={() => setCredits(false)}>
          <div className="prose">
            <Seal />
            <p>
              Um jogo independente sobre escolhas públicas, instituições e as consequências de
              governar.
            </p>
            <p>
              Personagens, partidos, populações, pesquisas e indicadores são fictícios. Os contornos
              estaduais são geográficos, derivados de{' '}
              <a href="https://mapsvg.com/maps/brazil" target="_blank" rel="noreferrer">
                svg-maps / MapSVG
              </a>{' '}
              (CC BY 4.0). A simulação usa regras brasileiras como referência, com simplificações
              descritas no manual.
            </p>
            <p>
              Interface: React, Lucide e Recharts. Tipografia: Georgia e fontes de sistema. Sem
              serviços de IA ou coleta de dados durante o jogo.
            </p>
          </div>
        </Modal>
      )}
    </main>
  );
}
export function CharacterCreation({
  onBack,
  onStart,
}: {
  onBack: () => void;
  onStart: (p: Profile, seed: number) => void;
}) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>(structuredClone(DEFAULT_PROFILE));
  const [seed, setSeed] = useState(2027);
  const update = (values: Partial<Profile>) => setProfile((p) => ({ ...p, ...values }));
  const points = 48 - Object.values(profile.attributes).reduce((s, a) => s + a, 0);
  const party = PARTIES.find((p) => p.id === profile.party)!;
  const valid =
    profile.firstName.trim().length > 0 &&
    profile.lastName.trim().length > 0 &&
    Number.isInteger(profile.age) &&
    profile.age >= 35 &&
    profile.age <= 85 &&
    points === 0;
  return (
    <main className="creation">
      <header className="creation-top">
        <button className="text-button" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar ao início
        </button>
        <div className="wordmark">
          REPÚBLICA<span>ARQUIVO DE CANDIDATURA</span>
        </div>
        <span className="muted">CENÁRIO 2027—2030</span>
      </header>
      <div className="creation-layout">
        <aside className="creation-aside">
          <span className="eyebrow gold-text">ANTES DA POSSE</span>
          <h1>
            Todo legado
            <br />
            começa com
            <br />
            uma escolha.
          </h1>
          <p>
            Quem você é muda a forma como o país responde. Defina sua trajetória e o mandato que
            deseja construir.
          </p>
          <div className="steps">
            {['Sua identidade', 'Convicções políticas', 'Atributos & desafio'].map((s, i) => (
              <button key={s} className={step === i ? 'active' : ''} onClick={() => setStep(i)}>
                <span>{step > i ? <Check size={13} /> : String(i + 1).padStart(2, '0')}</span>
                {s}
              </button>
            ))}
          </div>
          <div className="candidate-preview">
            <div className="monogram">
              {profile.firstName[0]}
              {profile.lastName[0]}
            </div>
            <div>
              <strong>
                {profile.firstName} {profile.lastName}
              </strong>
              <span>
                {party.id} · {profile.state} · Presidência
              </span>
            </div>
          </div>
        </aside>
        <section className="creation-form">
          <span className="eyebrow">ETAPA 0{step + 1} DE 03</span>
          <h2>
            {
              [
                'O nome na faixa presidencial.',
                'Suas ideias, seus compromissos.',
                'Governar exige mais que convicção.',
              ][step]
            }
          </h2>
          {step === 0 ? (
            <>
              <div className="form-grid">
                <label>
                  Nome
                  <input
                    maxLength={30}
                    value={profile.firstName}
                    onChange={(e) => update({ firstName: e.target.value })}
                  />
                </label>
                <label>
                  Sobrenome
                  <input
                    maxLength={40}
                    value={profile.lastName}
                    onChange={(e) => update({ lastName: e.target.value })}
                  />
                </label>
                <label>
                  Idade <small>(35 a 85 anos)</small>
                  <input
                    type="number"
                    min={35}
                    max={85}
                    value={profile.age}
                    onChange={(e) => update({ age: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Estado de origem
                  <select value={profile.state} onChange={(e) => update({ state: e.target.value })}>
                    {REGIONS.map((r) => (
                      <option key={r.uf} value={r.uf}>
                        {r.name} · {r.uf}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="span-2">
                  Histórico profissional
                  <select
                    value={profile.background}
                    onChange={(e) => update({ background: e.target.value })}
                  >
                    {[
                      'Administração pública',
                      'Direito',
                      'Economia',
                      'Educação',
                      'Empreendedorismo',
                      'Movimentos sociais',
                    ].map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="scenario-note">
                <span className="eyebrow gold-text">CAMPANHA PRESIDENCIAL</span>
                <h3>Um mandato. Quatro anos. Muitas consequências.</h3>
                <p>
                  Você assume a Presidência em janeiro de 2027. Construa uma base, transforme suas
                  prioridades em leis e dispute a reeleição em outubro de 2030.
                </p>
                <span className="muted">
                  Primeira versão: ciclo presidencial completo. Partidos e cenário inteiramente
                  fictícios.
                </span>
              </div>
            </>
          ) : step === 1 ? (
            <>
              <label>
                Partido político
                <select
                  value={profile.party}
                  onChange={(e) => {
                    const p = PARTIES.find((p) => p.id === e.target.value)!;
                    update({ party: p.id, ideology: p.ideology });
                  }}
                >
                  {PARTIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} — {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="party-description">
                <span className="party-dot" style={{ background: party.color }} />
                {party.seats} deputados · {party.senate} senadores ·{' '}
                {IDEOLOGIES[party.ideology + 3]}
              </div>
              <label>
                Identidade política
                <select
                  value={profile.ideology}
                  onChange={(e) => update({ ideology: Number(e.target.value) })}
                >
                  {IDEOLOGIES.map((i, n) => (
                    <option key={i} value={n - 3}>
                      {i}
                    </option>
                  ))}
                </select>
              </label>
              <div className="axis">
                <label htmlFor="economic">
                  Posição econômica{' '}
                  <strong>
                    {profile.economic < 0
                      ? 'Mais intervenção'
                      : profile.economic > 0
                        ? 'Mais mercado'
                        : 'Economia mista'}
                  </strong>
                </label>
                <input
                  id="economic"
                  type="range"
                  min={-3}
                  max={3}
                  value={profile.economic}
                  onChange={(e) => update({ economic: Number(e.target.value) })}
                />
                <div>
                  <span>Intervenção estatal</span>
                  <span>Livre mercado</span>
                </div>
              </div>
              <div className="axis">
                <label htmlFor="social">
                  Posição social{' '}
                  <strong>
                    {profile.social < 0
                      ? 'Progressista'
                      : profile.social > 0
                        ? 'Conservadora'
                        : 'Moderada'}
                  </strong>
                </label>
                <input
                  id="social"
                  type="range"
                  min={-3}
                  max={3}
                  value={profile.social}
                  onChange={(e) => update({ social: Number(e.target.value) })}
                />
                <div>
                  <span>Progressista</span>
                  <span>Conservadora</span>
                </div>
              </div>
              <p className="help">
                Nenhuma posição garante bons resultados. Afinidades influenciam eleitores e
                partidos; recursos, contexto e execução definem as consequências.
              </p>
            </>
          ) : (
            <>
              <div className="attributes-head">
                <p>Distribua 48 pontos. Cada atributo aceita de 1 a 10.</p>
                <span className={points !== 0 ? 'gold-text' : ''}>{points} disponíveis</span>
              </div>
              <div className="attributes">
                {ATTRIBUTES.map((a) => (
                  <div className="attribute" key={a.id}>
                    <div>
                      <strong>{a.name}</strong>
                      <small>{a.description}</small>
                    </div>
                    <div className="attribute-control">
                      <button
                        className="icon-button"
                        aria-label={`Diminuir ${a.name}`}
                        disabled={profile.attributes[a.id] <= 1}
                        onClick={() =>
                          update({
                            attributes: {
                              ...profile.attributes,
                              [a.id]: profile.attributes[a.id] - 1,
                            },
                          })
                        }
                      >
                        <Minus size={13} />
                      </button>
                      <span>{profile.attributes[a.id]}</span>
                      <button
                        className="icon-button"
                        aria-label={`Aumentar ${a.name}`}
                        disabled={profile.attributes[a.id] >= 10 || points <= 0}
                        onClick={() =>
                          update({
                            attributes: {
                              ...profile.attributes,
                              [a.id]: profile.attributes[a.id] + 1,
                            },
                          })
                        }
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="form-grid">
                <label>
                  Dificuldade
                  <select
                    value={profile.difficulty}
                    onChange={(e) =>
                      update({ difficulty: e.target.value as Profile['difficulty'] })
                    }
                  >
                    {['Aprendiz', 'Estrategista', 'Veterano'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Seed da simulação
                  <input
                    type="number"
                    min={0}
                    max={2147483647}
                    value={seed}
                    onChange={(e) =>
                      setSeed(Math.trunc(Math.max(0, Math.min(2147483647, Number(e.target.value)))))
                    }
                  />
                </label>
              </div>
              <p className="help">
                A seed reproduz os mesmos choques e votações quando as escolhas são iguais. A
                dificuldade altera o capital inicial e a pressão macroeconômica.
              </p>
              <button
                className="text-button"
                onClick={() => update({ attributes: { ...DEFAULT_PROFILE.attributes } })}
              >
                <RotateCcw size={13} /> Redistribuir igualmente
              </button>
            </>
          )}
          <div className="creation-actions">
            {step > 0 && (
              <button className="button" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={15} /> Anterior
              </button>
            )}
            {step < 2 ? (
              <button className="button primary" onClick={() => setStep(step + 1)}>
                Continuar <ArrowRight size={15} />
              </button>
            ) : (
              <button
                className="button primary"
                disabled={!valid}
                onClick={() =>
                  onStart(
                    {
                      ...profile,
                      firstName: profile.firstName.trim(),
                      lastName: profile.lastName.trim(),
                    },
                    seed,
                  )
                }
              >
                Assumir a Presidência <ArrowRight size={15} />
              </button>
            )}
          </div>
          {step === 2 && !valid && (
            <p className="help negative">
              Preencha nome e sobrenome, use idade de 35 a 85 anos e distribua todos os pontos.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
export function GlobalSettings({ onClose }: { onClose: () => void }) {
  const { autosave, reducedMotion, setAutosave, setReducedMotion } = useGame();
  return (
    <Modal title="Configurações" onClose={onClose}>
      <div className="settings-list">
        <label className="toggle-row">
          <div>
            <strong>Salvamento automático</strong>
            <span>Salva cada decisão e turno neste navegador.</span>
          </div>
          <input
            type="checkbox"
            checked={autosave}
            onChange={(e) => setAutosave(e.target.checked)}
          />
        </label>
        <label className="toggle-row">
          <div>
            <strong>Reduzir movimento</strong>
            <span>Desativa animações e transições da interface.</span>
          </div>
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
          />
        </label>
        <p className="help">
          Não há áudio nesta versão. O jogo funciona localmente e não requer conta. Limpar os dados
          do navegador remove os salvamentos; exporte uma cópia nas configurações da campanha.
        </p>
      </div>
    </Modal>
  );
}
