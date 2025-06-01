# Things MCP - Refactoring Tasks

Este documento contém as tarefas de refatoração identificadas na análise de código para otimizar, remover duplicação e simplificar a codebase.

## 📊 Status Atual

- **Duplicação estimada**: 35-40% do código de handlers
- **Arquivos com padrões repetitivos**: 7 de 15 arquivos
- **Linhas de código desnecessárias**: ~150-200 linhas
- **Potencial de redução**: 25-30% do codebase

## 🚀 Tarefas de Refatoração

### Alta Prioridade

#### 1. Criar AbstractToolHandler Base Class
**Arquivo**: `src/lib/abstract-tool-handler.ts` (novo)
**Objetivo**: Eliminar duplicação nos handlers de tools

**Tarefas**:
- [ ] Criar classe abstrata `AbstractToolHandler<TSchema, TParams>`
- [ ] Implementar método genérico `handle()` com tratamento de erros
- [ ] Definir métodos abstratos `schema` e `execute()`
- [ ] Adicionar método `handleError()` centralizado
- [ ] Implementar tipagem genérica para responses

**Arquivos impactados**: `src/tools/add.ts`, `src/tools/get.ts`, `src/tools/search.ts`, `src/tools/show.ts`

#### 2. Implementar ToolRegistry System
**Arquivo**: `src/lib/tool-registry.ts` (novo)
**Objetivo**: Automatizar registro de tools e eliminar boilerplate

**Tarefas**:
- [ ] Criar classe `ToolRegistry`
- [ ] Implementar método `registerTool(name, handler)`
- [ ] Adicionar método `getHandler(name)`
- [ ] Criar método `getAllTools()`
- [ ] Implementar auto-descoberta de tools via decorators ou convenção

**Arquivos impactados**: `src/index.ts`

#### 3. Unificar Schema Definitions
**Objetivo**: Remover duplicação entre JSON schemas e Zod schemas

**Tarefas**:
- [ ] Remover JSON schemas duplicados de `src/tools/*.ts`
- [ ] Criar utility function `zodToJsonSchema()` em `src/lib/schema-utils.ts`
- [ ] Atualizar tools para gerar JSON schemas a partir dos Zod schemas
- [ ] Verificar compatibilidade com MCP SDK

**Arquivos impactados**: `src/tools/add.ts`, `src/tools/get.ts`, `src/tools/search.ts`, `src/tools/show.ts`

### Média Prioridade

#### 4. Refatorar Tool Handlers
**Objetivo**: Migrar handlers existentes para usar AbstractToolHandler

**Tarefas**:
- [ ] **AddToolHandler**: Refatorar `src/tools/add.ts`
  - [ ] Estender `AbstractToolHandler`
  - [ ] Implementar `execute()` específico
  - [ ] Remover código duplicado de error handling
- [ ] **GetToolHandler**: Refatorar `src/tools/get.ts`
  - [ ] Estender `AbstractToolHandler`
  - [ ] Simplificar lógica de script mapping
  - [ ] Corrigir tipagem de `args`
- [ ] **SearchToolHandler**: Refatorar `src/tools/search.ts`
  - [ ] Estender `AbstractToolHandler`
  - [ ] Implementar `execute()` específico
- [ ] **ShowToolHandler**: Refatorar `src/tools/show.ts`
  - [ ] Estender `AbstractToolHandler`
  - [ ] Implementar `execute()` específico

#### 5. Otimizar Parser Logic
**Arquivo**: `src/lib/parser.ts`
**Objetivo**: Eliminar delegação desnecessária e melhorar performance

**Tarefas**:
- [ ] Analisar diferenças reais entre `ThingsTodo` e `ThingsProject`
- [ ] Se idênticos, criar type alias: `type ThingsProject = ThingsTodo`
- [ ] Se diferentes, implementar `parseProjectList()` específico
- [ ] Adicionar benchmarks para parsing de listas grandes
- [ ] Considerar streaming parser para datasets muito grandes

#### 6. Melhorar Type Safety
**Objetivo**: Eliminar type casts e melhorar inferência de tipos

**Tarefas**:
- [ ] Corrigir cast em `src/tools/get.ts:135`
- [ ] Definir interface `GetToolArgs` com `max_results?: number`
- [ ] Atualizar handlers para usar tipos específicos
- [ ] Adicionar generic constraints onde necessário

#### 7. Extrair Constants e Configuration
**Arquivo**: `src/lib/constants.ts` (novo)
**Objetivo**: Centralizar configurações e strings mágicas

**Tarefas**:
- [ ] Extrair `MAX_URL_LENGTH` de `src/lib/urlscheme.ts`
- [ ] Centralizar timeout values de `src/lib/applescript.ts`
- [ ] Criar enum para Things lists
- [ ] Definir constantes para error codes
- [ ] Extrair regex patterns de validação

### Baixa Prioridade

#### 8. Adicionar Caching Layer
**Arquivo**: `src/lib/cache.ts` (novo)
**Objetivo**: Melhorar performance para operações frequentes

**Tarefas**:
- [ ] Implementar `MemoryCache` simples
- [ ] Adicionar TTL para entradas
- [ ] Cachear resultados de `testThingsAvailable()`
- [ ] Cachear listas que mudam pouco (areas, tags)
- [ ] Adicionar cache invalidation

#### 9. Implementar Retry Logic
**Arquivo**: `src/lib/retry.ts` (novo)
**Objetivo**: Melhorar robustez para operações intermitentes

**Tarefas**:
- [ ] Criar decorator `@retry()` para métodos
- [ ] Implementar exponential backoff
- [ ] Adicionar retry para AppleScript executions
- [ ] Configurar retry policies por tipo de operação

#### 10. Adicionar Comprehensive Logging
**Arquivo**: `src/lib/logger.ts` (novo)
**Objetivo**: Melhorar observabilidade e debugging

**Tarefas**:
- [ ] Implementar structured logging
- [ ] Adicionar log levels (debug, info, warn, error)
- [ ] Logar performance metrics
- [ ] Adicionar correlation IDs para requests

## 🔄 Ordem de Execução Recomendada

1. **Semana 1**: Tasks 1-3 (Alta Prioridade)
   - Criar base classes e utilities
   - Estabelecer nova arquitetura

2. **Semana 2**: Tasks 4-6 (Média Prioridade)
   - Migrar handlers existentes
   - Melhorar type safety

3. **Semana 3**: Task 7 + Testing
   - Extrair constantes
   - Testes comprehensive da refatoração

4. **Semana 4**: Tasks 8-10 (Baixa Prioridade)
   - Features adicionais conforme necessário

## ✅ Critérios de Aceitação

Para cada task:
- [ ] Código funcional sem regressões
- [ ] Testes unitários passando
- [ ] Type checking sem erros
- [ ] ESLint sem warnings
- [ ] Documentação atualizada
- [ ] Performance igual ou melhor

## 📝 Notas de Implementação

### Compatibilidade
- Manter compatibilidade com MCP SDK atual
- Preservar API pública existente
- Manter funcionalidade de segurança

### Testing Strategy
- Testar cada refatoração incrementalmente
- Usar mocks para AppleScript calls
- Adicionar integration tests para fluxos completos

### Rollback Plan
- Cada task em branch separada
- Commits atômicos
- Possibilidade de rollback individual

## 🎯 Benefícios Esperados

- **Redução de ~200 linhas** de código duplicado
- **Melhoria na manutenibilidade** - mudanças centralizadas
- **Redução de bugs** - menos código para manter sincronizado
- **Facilidade para adicionar novos tools** - padrão estabelecido
- **Melhor testabilidade** - componentes mais coesos
- **Performance melhorada** - caching e otimizações

---

*Documento criado pela análise de refatoração do things-mcp em 06/01/2025*