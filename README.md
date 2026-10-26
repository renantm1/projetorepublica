# REPÚBLICA

**O poder tem um preço.** Um simulador político brasileiro para navegador, com uma campanha presidencial jogável de quatro anos. React 19, TypeScript, Vite, Tailwind CSS, Zustand, Recharts e Lucide.

## Executar

Requer Node.js **22.12 ou mais recente**. Este ambiente usa Node 24.

```sh
cd /workspace/projetorepublica
npm ci --cache /workspace/.cache/npm
npm run dev
```

O Vite escuta na porta **5173** e em todas as interfaces. Em instalações fora deste ambiente, use `npm ci` com o cache padrão do seu sistema. Não são necessários banco de dados, conta, backend, variáveis secretas ou serviços externos. O mapa e todos os recursos são servidos localmente; a instalação usa `registry.npmjs.org`.

```sh
npm test             # testes dos motores
npm run build        # TypeScript e bundle de produção em dist/
npm run test:e2e     # build + testes reais de navegador na porta 5174
npm run preview      # servir a compilação em produção
npm run format:check # formatação
```

Os testes de navegador usam `/usr/bin/chromium` quando disponível. Em outra máquina, execute `npx playwright install chromium`, ou informe `CHROMIUM_PATH=/caminho/para/chromium`. A suíte inicia seu próprio servidor de produção na porta 5174; mantenha essa porta livre. Vite e testes usam portas diferentes para que o recarregamento de desenvolvimento não interrompa uma campanha de teste.

## Jogar

1. Selecione **Nova campanha**. Defina nome, origem, histórico, partido e convicções econômicas e sociais independentes. Distribua 48 pontos entre oito atributos e escolha dificuldade e seed.
2. Você assume a Presidência em **janeiro de 2027**. Resolva a decisão na mesa do presidente e use suas **três ações mensais** para negociar, propor leis, fazer campanha ou abrir agendas diplomáticas.
3. **Avançar mês** processa economia, opinião pública, partidos, adversários, implantação das políticas, efeitos atrasados, pesquisas e notícias. Uma decisão pendente precisa ser resolvida antes de avançar.
4. Em **Políticas públicas**, proponha uma intensidade de 0 a 3. Passe pela **Câmara**, pelo **Senado** e pela **sanção**. O texto pode ser moderado em meio nível para ampliar apoio. Um veto pode ser derrubado pelas duas Casas.
5. Investimentos têm custo anual recorrente; serviços melhoram após a implantação. Ampliações mantêm os serviços existentes enquanto o novo nível não está pronto. A opinião dos grupos sociais reage a emprego, serviços, renda, confiança e investimento.
6. Em **outubro de 2030**, acompanhe a votação ponderada pelos 27 eleitorados estaduais. Sem mais de 50% no primeiro turno, há segundo turno no mesmo mês, com até duas ações extras. Conclua a apuração antes de avançar.
7. Complete os **48 turnos** e consulte seu balanço em janeiro de 2031: resultado eleitoral, aprovação, políticas e dívida. A vitória é registrada como reeleição; o segundo mandato não é jogável nesta versão.

O manual dentro do jogo explica os custos e as simplificações. Todas as seções possuem dados conectados à partida; as notícias são geradas pelos acontecimentos registrados, não por textos soltos.

## Salvamento

O estado global usa Zustand. O salvamento é um JSON versionado em `localStorage`, na chave `republica.campaign.v1`, validado com Zod ao carregar ou importar. O salvamento automático ocorre a cada ação válida; pode ser desativado. **Configurações → Exportar partida** produz uma cópia transportável. A importação valida tipo, versão, limites, campos e consistência temporal antes de substituir a partida.

Os arquivos de salvamento não contêm credenciais. Nome e escolhas do personagem ficam apenas neste navegador ou no arquivo exportado. Limpar o armazenamento do navegador remove a cópia local. Se o armazenamento não estiver disponível, a interface avisa e mantém o jogo da sessão em memória; exporte uma cópia.

## Arquitetura

```text
src/
  engine/
    types.ts         Contratos de estado e ações
    data.ts          Partidos, políticas e parâmetros do cenário
    game.ts          Transações, turnos, agenda, eleições e tramitação
    economy.ts       Economia, orçamento e relações entre indicadores
    opinion.ts       Grupos sociais e aprovação
    legislature.ts   Apoio por bancada, projeção e votação
    election.ts      Pesquisas regionais, ponderação e apuração
    events.ts        Dilemas, escolhas e consequências atrasadas
    characters.ts    Adversários e respostas ao contexto
    random.ts        Incerteza determinística por seed, turno e chave
    save.ts          Validação de arquivos e persistência
    game.test.ts     Testes dos sistemas centrais
  components/        Telas e elementos visuais
  store.ts           Estado global e persistência coordenada
  App.tsx            Navegação, criação e ciclo da interface
  styles.css         Identidade visual e responsividade
public/data/         Mapa vetorial local, atribuição e licença
 tests/browser/      Fluxos de ponta a ponta com Playwright
```

Os motores são funções sem dependência da interface. `execute` produz um novo estado somente para ações válidas; pré-condições inválidas preservam a partida original e retornam uma explicação. A aleatoriedade é uma função pura: mesma seed, turno, chave e escolhas produzem o mesmo resultado. O mapa e as tabelas permitem seleção por teclado; diálogos prendem o foco e fecham com Escape. Há preferências de movimento reduzido e salvamento automático.

Os gráficos são carregados sob demanda. O primeiro ponto do gráfico é a posse; séries anteriores ao mandato não são inventadas.

## O que está implementado

- Menu inicial, criação de personagem e posições em dois eixos.
- Ciclo presidencial de quatro anos, três ações mensais, capital político e oito atributos com efeitos mecânicos.
- 21 indicadores macroeconômicos, sociais e institucionais; cinco grupos de opinião pública.
- Nove políticas em três intensidades, custo fiscal recorrente, capacidade de execução e defasagem.
- Oito bancadas fictícias, **513 deputados e 81 senadores**, coalizão, negociação, emendas, duas votações, sanção e veto.
- Onze eventos com três escolhas, efeitos imediatos e atrasados, registro de decisões e notícias contextuais.
- Adversários, debates, entrevistas, visitas, propaganda, arrecadação, pesquisas e eleição em até dois turnos.
- Mapa vetorial de **26 estados e Distrito Federal**, com consulta de indicadores, eleitorados, intenção de voto e apuração.
- Diplomacia comercial, climática e regional com prazos e custos; histórico, jornal, salvamento, importação e exportação.

## Limites do MVP

Esta entrega segue a prioridade do briefing: **um MVP vertical presidencial completo**. Carreira de vereador até presidente, outros cargos jogáveis, eleições proporcionais completas, formação de ministérios individuais, projetos próprios dos adversários e múltiplos mandatos ficam para expansão. O perfil e os contratos de tipos admitem cargos para evolução futura, mas a interface e os fluxos validados oferecem a Presidência.

Leis ordinárias usam **quórum pleno e maioria absoluta** nas duas Casas como abstração: não há simulação de PECs, todas as modalidades de maioria, suplentes, faltas ou votação individual de 594 personagens. Emendas moderam intensidade; vetos são avaliados com o apoio calculado de cada Casa. Governadores e relações externas são indicadores e agendas agregadas. Não há cadastro individual de eleitores; diferenças de renda, idade e escolaridade são representadas de forma agregada por grupos e desenvolvimento regional.

As relações econômicas são abstrações para estratégia, com incerteza e defasagem; não constituem um modelo de previsão. Nenhuma ideologia recebe multiplicador automático de sucesso: posições influenciam afinidades; execução, apoio, recursos, economia e campanha influenciam resultados.

**Personagens, partidos, indicadores, populações, eleitorados, rendas e pesquisas são fictícios.** Não são dados atuais do Brasil. A geografia estadual é real. Cores no mapa representam aprovação ou votação simulada.

## Mapa e atribuição

Os caminhos vetoriais vêm de **[@svg-maps/brazil v2.0.0](https://www.npmjs.com/package/@svg-maps/brazil)**, baseado no mapa de **[MapSVG](https://mapsvg.com/maps/brazil)**, sob **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**. Os caminhos foram preservados, os IDs convertidos em maiúsculas e coordenadas de rótulos adicionadas. Veja [atribuição](public/data/ATTRIBUTION.md) e [licença](public/data/LICENSE-map.md). O mapa serve para visualização de jogo, não para delimitação administrativa oficial.

A arquitetura de Brasília da tela inicial é uma ilustração SVG criada para o projeto. Ícones: Lucide (ISC). Fontes: Georgia e fontes de sistema, sem chamadas de rede.

## Ambiente na nuvem

Use o checkout existente em `/workspace/projetorepublica`: cada tarefa já executa em um ambiente isolado; não crie worktrees para inicialização. Dependências e arquivos podem ser retidos no snapshot, mas processos devem ser iniciados de novo. Reproduza com `npm ci --cache /workspace/.cache/npm`, valide com `npm test` e `npm run build`, e inicie `npm run dev -- --port 5173 --strictPort` se a porta ainda não tiver a aplicação correta.

A configuração reutilizável do ambiente é salva separadamente como `install_script` e `start_skill`; salvá-la não publica a aplicação nem envia os arquivos ao GitHub.

## Publicar o jogo na internet

A aplicação é estática. Gere a versão pública com `npm ci` e `npm run build`; a pasta a hospedar é **`dist/`**, com `index.html` na raiz. Vercel e Netlify podem usar o comando de build `npm run build` e o diretório de saída `dist`. O build usa caminhos relativos para também funcionar em um subdiretório, como os sites de projeto do GitHub Pages.

O GitHub Pages requer configurar a publicação no repositório e enviar os arquivos ou um workflow de implantação. Vercel e Netlify requerem vincular o projeto à conta do proprietário. Não coloque tokens em arquivos ou no chat; configure autenticação na plataforma escolhida.

O botão de publicação do ambiente Codex salva o ambiente de desenvolvimento. A hospedagem pública do site é uma operação separada. Um endereço só deve ser anunciado como publicado após a implantação e uma verificação HTTP e funcional no domínio público.

### GitHub Pages neste repositório

O workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) instala as dependências pelo lockfile, executa os testes dos motores, compila e publica `dist/`. As Actions estão fixadas por SHA de seus respectivos releases. Cada envio para `main` inicia uma publicação; também é possível executar o workflow manualmente.

A ativação inicial requer acesso administrativo ao repositório:

1. Abra [Settings → Pages](https://github.com/renantm1/projetorepublica/settings/pages).
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Em **Actions**, execute ou reexecute **Publicar REPÚBLICA no GitHub Pages**.
4. Acompanhe o job **Publicar o site**. O endereço real da publicação aparece no ambiente `github-pages` e no resultado da Action. Verifique o endereço antes de anunciá-lo como disponível.

O token padrão do workflow publica no Pages, mas não possui a permissão administrativa necessária à ativação inicial. Se o repositório for privado, confira se o plano da conta oferece Pages; este fluxo não muda a visibilidade do repositório. Nenhum token adicional é necessário dentro do workflow.
