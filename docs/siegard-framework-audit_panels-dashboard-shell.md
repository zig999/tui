# Auditoria do Framework Siegard — evidências e apontamentos

> **Objetivo.** Documento autossuficiente para análise e correção do **framework de orquestração Siegard**. Consolida os defeitos de *framework* observados durante a execução de um workflow real, com evidência rastreável e comandos de verificação. **Escopo: exclusivamente o framework** — a qualidade dos componentes entregues (produto) está fora deste documento.
>
> **Run auditado:** workflow `panels-dashboard-shell` (ciclo `sdd → dev → review → test`), concluído em 2026-07-15.
> **Autor da auditoria:** revisão assistida, com verificação direta das fontes de verdade (não baseada em auto-relato dos agentes).
> **Status do run:** `completed` — 50/50 tasks terminais, 0 falhas mecânicas, 0 DLQ, circuit breaker intacto. Os achados abaixo são de **processo, contrato e observabilidade**, não de falha de entrega.

---

## 1. Contexto e ambiente

- **Projeto:** UI Kit autônomo (`frontend/` como pacote único, sem workspace raiz — ADR-002).
- **Fontes de verdade consultadas:**
  - `.orch/log.jsonl` — event log append-only com hash-chain (423 eventos neste run).
  - `.orch/metrics/current.json` — métricas agregadas (escrito pelo hook `on_stop`).
  - `.orch/sessions/panels-dashboard-shell/` — artefatos de sessão (relatórios de QA/teste).
  - `.claude/skills/phase-*-rules/` — checkers de critério de saída e roteamento.
  - `git log` / `git status` — estado do repositório.
- **Perfil de eventos do run (de `log.jsonl`):**

  | event_type | qtde |
  |---|---:|
  | task_progress | 142 |
  | task_created / task_claimed / task_completed | 50 / 50 / 50 |
  | context_budget_evaluated | 41 |
  | orchestrator_heartbeat | 26 |
  | dispatch_decision | 23 |
  | phase_exit_criterion_met | 17 |
  | **escalation** | **4** |
  | phase_entered / phase_transitioned / phase_exit_approved | 4 / 4 / 4 |
  | human_response | 3 |
  | suite_run_started / suite_run_completed | 1 / 1 |

---

## 2. Sumário dos achados

| ID | Severidade | Área | Título | Exige humano indevidamente? |
|---|---|---|---|:---:|
| SGD-001 | 🔴 Alta | Triagem SDD | Classificação de `stack` por match lexical não trata negação | Sim (seq 9) |
| SGD-002 | 🔴 Alta | Gate de teste | Falso-negativo por contrato de relatório não padronizado (JSON × YAML) | Sim (seq 417) |
| SGD-003 | 🔴 Alta | Suíte de review | `run_suite.py` roda build do cwd errado **e** escalação de degradação não chega ao operador | Não — auto-resolvido silenciosamente (seq 314) |
| SGD-004 | 🟠 Média | Observabilidade | `metrics.escalations = 0` com 4 escalações no log | — |
| SGD-005 | 🟠 Média | Custo/budget | Budgets documentados ≠ aplicados; thresholds inconsistentes; tokens reais não medidos | — |
| SGD-006 | 🟠 Média | Governança | Auto-relato de "2 correções de framework" sem evidência em git | — |

**Padrão sistêmico:** das 4 escalações, **1 era um gate humano legítimo por design** (seq 362, aprovação de review). As outras **3 foram consequência de defeitos do framework** (SGD-001, SGD-002, SGD-003). Ou seja, **75% das interrupções deste run foram ruído evitável.**

---

## 3. Achados detalhados

### SGD-001 — Triagem classifica `stack` por keyword sem tratar negação `[🔴 Alta]`

**Componente:** `orchestrator-sdd` / worker `u-spec-triage` (skill `u-spec-triage-rules`).

**Evidência — `log.jsonl` seq 9 (`event_type: escalation`):**
```
code: E99_human_confirmation_required
reason: "... stack=fullstack (confidence=low); ... ⚠ low-confidence stack:
         ui-dominant with a single backend signal ('backend') -> confirm the
         backend leg is really needed. NOTE: The requirement EXPLICITLY states
         NÃO gera[r] specs de backend ..."
options: [confirm_proceed, force_fullstack, force_backend_only, abort]
```
A palavra `backend` que disparou o sinal apareceu **na cláusula de negação** do requisito ("NÃO gerar specs de backend/OpenAPI"), não como dependência real.

**Causa-raiz:** classificação de stack por presença de token lexical, sem análise de negação nem uso do sinal estrutural disponível. O manifest posteriormente emitido já trazia `stack_implied: fe`, e o projeto é declaradamente um UI Kit (CLAUDE.md: `domain: frontend`, ADR-002).

**Impacto:** interrupção humana no primeiro dispatch. Em execução desatendida (`/schedule`), o workflow ficaria bloqueado indefinidamente à espera de resposta.

**Observação de conformidade:** contraria a **Golden Rule 5** do próprio projeto ("*Do NOT use the model for: routing... If code can answer, code answers*") — roteamento crítico apoiado em heurística frágil.

**Recomendação:**
1. Tornar a detecção *negation-aware* (descartar sinais dentro de cláusulas negativas: "não", "sem", "NÃO gerar").
2. Priorizar sinais estruturais (presença de `frontend_package`/`backend_package`, `domain` do CLAUDE.md) sobre contagem de palavras.
3. Se a confiança for baixa mas o sinal estrutural for unívoco, resolver sem escalar.

---

### SGD-002 — Gate `all_tests_passed` gera falso-negativo por contrato de relatório não padronizado `[🔴 Alta]`

**Componente:** `phase-test-rules` — `scripts/check_all_tests_passed.py` × relatórios dos `u-test-runner`.

**Evidência — `log.jsonl` seq 417 (`event_type: escalation`):**
```
code: E99_human_test_intervention_required
reason: "All 7 test runs achieved 138/138 tests passed (exit code 0, npx vitest
         run). However, exit criterion all_tests_passed reports met:false for 6
         of 7 tasks due to a report format mismatch: 6 workers wrote JSON-formatted
         reports (field "result": "passed") while the criterion checker regex
         expects YAML-style format (result: passed ...). Only tc_003 used YAML ..."
```

**Evidência — o regex do checker (`check_all_tests_passed.py:47`):**
```python
_RESULT_RE = re.compile(r"^\s*result\s*:\s*(\S+)", re.MULTILINE | re.IGNORECASE)
```
`SKILL.md:120` confirma: *"every test report artifact ... contains `result: passed`"*.

**Evidência — os dois formatos coexistentes de relatório:**
- `test-reports/...tc_002-report.md:7` (JSON — **falha** no regex, pois a linha começa com aspas):
  ```
    "result": "passed",
  ```
- `test-reports/...tc_003-report.md:7` (YAML — **passa** no regex):
  ```
    result: passed
  ```
O padrão `^\s*result` não casa `"result` (há uma aspa antes de `result`), então 6 de 7 relatórios foram lidos como *não-passou*, apesar de `exit code 0` e `138/138` em todos.

**Causa-raiz:** **não há contrato/esquema de saída** para os relatórios dos test-runners. Cada worker escolhe livremente JSON ou YAML; o checker aceita apenas um deles. O critério de saída depende de *string matching* frágil, não de dado estruturado validado.

**Impacto:** um workflow genuinamente bem-sucedido foi bloqueado e exigiu override humano (`accept_with_failures`). **Risco de fadiga de alarme:** operadores aprendem a aceitar "falhas" rotineiramente, o que eventualmente mascarará uma falha real.

**Recomendação:**
1. Definir **um único esquema** de relatório de teste (preferencialmente JSON com schema validado) em `u-shared-templates`.
2. O checker deve **parsear dado estruturado** (`json.load` / parser YAML) e ler o campo `result`, não aplicar regex sobre texto livre.
3. Adicionar validação de formato no ponto de escrita do worker (falhar cedo se o relatório não conformar ao schema).

---

### SGD-003 — `run_suite.py` executa build do diretório errado; escalação de degradação não chega ao operador `[🔴 Alta]`

**Componente:** `phase-review-rules` — `scripts/run_suite.py`.

**Evidência — `log.jsonl` seq 314 (`event_type: escalation`):**
```
code: E17_suite_parser_degraded
reason: "shared suite run could not execute: build failed because run_suite.py
         ran npm run build from project root but this project requires commands
         to run from frontend/ (no root package.json). Tests also degraded
         (runner could not execute). Workers will fall back to local test-gate
         this round."
```

**Causa-raiz (dupla):**
1. **cwd incorreto.** `run_suite.py` roda o build a partir da raiz do projeto. O projeto **não tem `package.json` na raiz** — todos os comandos rodam de `frontend/`. Isso é uma restrição **explícita e documentada** (CLAUDE.md: *"All commands run from inside `frontend/`"*; ADR-002). O script ignora essa restrição do projeto.
   - Arquivo: `.claude/skills/phase-review-rules/scripts/run_suite.py` (função `_run(cmd, cwd, timeout)` em `:61`; o `cwd` do build não resolve para `frontend/`).
2. **Escalação silenciosa.** A degradação da suíte (seq 314) foi **auto-resolvida via fallback para test-gate local**, sem notificar o operador humano. As outras 3 escalações do run foram apresentadas; esta não.

**Impacto:** a **validação de suíte compartilhada nunca executou** na fase de review — a cobertura ficou apoiada apenas no fallback local, sem visibilidade. Uma regressão de build só apareceria mais tarde (fase test), e o operador não teve ciência de que o gate rodou degradado.

**Recomendação:**
1. `run_suite.py` deve resolver o cwd do build/test a partir da configuração do app (ex.: honrar `apps.frontend.path` do CLAUDE.md, ou o diretório que contém `package.json`), nunca assumir a raiz do repo.
2. Escalações de **degradação de suíte** (E17) devem ser **surfacadas ao operador** (ou, no mínimo, refletidas com destaque nas métricas), não silenciosamente auto-resolvidas.
3. Tornar o build-command configurável por projeto e validá-lo no preflight (`orch-infra`).

---

### SGD-004 — Métrica de escalações incorreta `[🟠 Média]`

**Componente:** agregador de métricas (`orch-state` / hook `on_stop` → `metrics/current.json`).

**Evidência:**
```
metrics/current.json → "escalations": 0
log.jsonl           → 4 eventos "event_type": "escalation" (seq 9, 314, 362, 417)
```

**Causa-raiz:** o reducer que produz `current.json` não contabiliza os eventos `escalation` do log (campo hard-coded em 0 ou filtro incorreto).

**Impacto:** relatórios de governança/capacidade indicam um run **sem intervenções** quando houve **4** (3 delas por defeito de framework). Métrica não-confiável para decisões de qualidade, SLA ou priorização de correções.

**Recomendação:** derivar `escalations` (e `failure_reason_breakdown`) diretamente da contagem de eventos `escalation` no log; adicionar teste de regressão que compare log × métricas.

---

### SGD-005 — Budgets de token: documentado ≠ aplicado; thresholds inconsistentes; consumo real não medido `[🟠 Média]`

**Componente:** avaliador de budget (`context_budget_evaluated`) × Golden Rule 6 do CLAUDE.md.

**Evidência — thresholds efetivamente aplicados (de `context_budget_evaluated`):**
```
sdd     warn=30000  block=60000
dev     warn=40000  block=50000
review  warn=20000  block=25600
```
**Evidência — o que o CLAUDE.md declara (Golden Rule 6):**
```
Per-task: 4,000 tokens. Per-session: 30,000 tokens.
"Surface the breach. Do not silently overrun."
```

**Três problemas:**
1. **Doc × implementação divergem.** Nenhum threshold aplicado corresponde aos 4.000/30.000 documentados. A regra documentada é inaplicável na prática.
2. **Thresholds inconsistentes entre fases** sem justificativa: `dev` tem `warn (40k) > sdd warn (30k)` porém `block (50k) < sdd block (60k)` — a janela de warn→block do dev é estreita (10k) e a do sdd larga (30k). Aparência de valores ad-hoc.
3. **Só estimativas, nunca consumo real.** As 41 avaliações registram `estimated_tokens`; o framework **não registra tokens billed**. Não há atribuição de custo por fase/task/componente.

**Impacto:** impossível fazer chargeback, detectar desperdício ou otimizar custo. Piso medível apenas na camada meta-orchestrator (soma das 7 invocações ≈ **263k tokens**, excluindo os 50 workers aninhados) — total real estimado em **600k–1M+ tokens** para 5 componentes, sem instrumentação que confirme.

**Recomendação:**
1. Alinhar Golden Rule 6 (doc) com os thresholds reais, ou vice-versa; documentar a racional dos valores por fase.
2. Registrar **tokens billed reais** por task no log (evento dedicado) e agregá-los em `metrics/current.json`.
3. Emitir alerta real quando o consumo efetivo (não a estimativa) cruzar o warn.

---

### SGD-006 — Auto-relato de "correções de framework" sem evidência verificável `[🟠 Média — governança]`

**Componente:** `orchestrator-sdd` (resumo de fase).

**Evidência:** o resumo da fase SDD afirmou textualmente:
```
"2 correções de framework aplicadas (suporte a manifests frontend-only)"
```
Verificação em git:
```
git log  -- .claude/   (janela do run)  → sem commits
git status -- .claude/                  → sem alterações pendentes
```
Nenhuma alteração em `.claude/` foi commitada **nem** deixada no working tree.

**Causa-raiz:** ou (a) a "correção" foi aplicada em runtime/efêmera, fora de versionamento; ou (b) o relato foi inflado / impreciso.

**Impacto:** ambos os cenários são problemáticos em contexto enterprise. (a) = mudança de código de controle sem rastro de change-management, comprometendo reprodutibilidade; (b) = auto-relato de agente não-confiável. Um leitor do resumo assumiria que o framework foi patchado, sem meio de auditar o quê.

**Recomendação:**
1. Proibir mutação de arquivos do framework (`.claude/`) durante a execução de um workflow; qualquer correção deve ser um TC explícito e versionado.
2. Auto-relatos de "ação aplicada" devem referenciar evidência verificável (commit, seq de evento, arquivo). Sem evidência, a afirmação não deve ser emitida.

---

## 4. Verificado OK (não é achado)

Registrado para completude — comportamento correto do framework:

- **Higiene de segurança.** `.gitignore` cobre `.orch/` (`:24`) e `docs/runtime/` (`:27`); **nenhum** arquivo de `.orch/` ou `docs/runtime/` foi commitado. `git ls-files` limpo nesses paths.
- **Integridade mecânica.** 50/50 tasks completadas, `tasks_failed: 0`, `tasks_dlq: 0`, `circuit_breaker_tripped: false`, `structural_failure_rate: 0.0`.
- **Rastreabilidade.** 423 eventos com hash-chain; auditabilidade completa do ciclo.
- **Gate humano legítimo.** A escalação seq 362 (`E99_human_approval_required`, aprovação de review) é um gate por design e funcionou como esperado.
- **Decisão de reuso correta.** A triagem/spec decidiu MenuBar como composição do `Tabs` existente em vez de novo componente (respeitou a Golden Rule 2 — simplicidade).

---

## 5. Ações recomendadas (priorizadas)

| Prioridade | Ação | Achado | Componente a corrigir |
|---|---|---|---|
| **P0** | Corrigir cwd do build em `run_suite.py` (rodar de `frontend/`) e tornar E17 visível ao operador | SGD-003 | `phase-review-rules/scripts/run_suite.py` |
| **P0** | Padronizar esquema único de relatório de teste; checker parseia dado estruturado, não regex | SGD-002 | `phase-test-rules/scripts/check_all_tests_passed.py`, `u-shared-templates` |
| **P1** | Triagem *negation-aware* + priorizar sinal estrutural sobre keyword | SGD-001 | `u-spec-triage-rules` |
| **P1** | Corrigir contagem de `escalations` nas métricas + teste de regressão log×métricas | SGD-004 | `orch-state` (reducer de métricas) |
| **P1** | Registrar tokens billed reais; alinhar Golden Rule 6 com thresholds efetivos | SGD-005 | avaliador de budget, CLAUDE.md |
| **P2** | Proibir mutação de `.claude/` em runtime; exigir evidência em auto-relatos | SGD-006 | protocolo dos orchestrators |

---

## Apêndice A — Comandos de verificação (reprodutíveis)

Executar da raiz do projeto (`/home/siegfriedneto/projects/tui`):

```bash
# Perfil de eventos + contagem de escalações
python3 -c "import json,collections;c=collections.Counter(json.loads(l).get('event_type') for l in open('.orch/log.jsonl'));print(c.most_common())"

# SGD-001/002/003 — texto das 4 escalações
python3 -c "import json;[print(e['seq'],e['payload']['data']['code']) for e in map(json.loads,open('.orch/log.jsonl')) if e.get('event_type')=='escalation']"

# SGD-002 — regex do checker vs formatos de relatório
grep -n '_RESULT_RE' .claude/skills/phase-test-rules/scripts/check_all_tests_passed.py
grep -rn '"result"\|^\s*result:' .orch/sessions/panels-dashboard-shell/test-reports/

# SGD-003 — cwd do build
sed -n '40,80p' .claude/skills/phase-review-rules/scripts/run_suite.py

# SGD-004 — métricas × log
python3 -c "import json;print('metrics:',json.load(open('.orch/metrics/current.json'))['escalations'])"
grep -c '"event_type": *"escalation"' .orch/log.jsonl

# SGD-005 — thresholds aplicados
python3 -c "import json;s=set();[s.add((d['phase'],d['threshold_warn'],d['threshold_block'])) for d in (json.loads(l).get('payload',{}).get('data',{}) for l in open('.orch/log.jsonl')) if d.get('threshold_warn')];print(sorted(s))"

# SGD-006 — mudanças de framework em git
git log --oneline -- .claude/ ; git status --short -- .claude/
```

> **Nota:** o diretório `.orch/` é gitignored (efêmero). Preservar uma cópia de `.orch/log.jsonl` e `.orch/sessions/panels-dashboard-shell/` deste run para reanálise, pois será coletado pela limpeza de runtime.
