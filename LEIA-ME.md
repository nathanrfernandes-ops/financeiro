# 📱 Controle Financeiro — PWA
## Guia de Instalação e Configuração

---

## O que é este PWA?

Um app leve que roda no navegador do Android e se comporta como um app nativo.
Permite lançar despesas, receitas e consultar o resumo do mês — tudo gravando
diretamente na sua planilha Google Sheets.

---

## 📦 INSTALAÇÃO NO ANDROID

### Opção 1 — GitHub Pages (Recomendada, grátis)

1. Crie uma conta em **github.com**
2. Crie um repositório público chamado `financeiro`
3. Faça upload dos 4 arquivos desta pasta:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`
4. Vá em **Settings → Pages → Source: main branch**
5. Seu app estará em: `https://SEU_USUARIO.github.io/financeiro`
6. Abra essa URL no Chrome do Android
7. Toque no menu (⋮) → **"Adicionar à tela inicial"**
8. Pronto — aparece como app na tela inicial!

### Opção 2 — Servidor local (para testes rápidos)

Se tiver Python instalado no computador:
```bash
cd pasta-do-pwa
python3 -m http.server 8080
```
Acesse `http://SEU_IP:8080` no celular (mesma rede Wi-Fi)

---

## ⚙️ CONFIGURAÇÃO DA PLANILHA

### Passo 1 — Obter o ID da Planilha

1. Abra sua planilha no Google Sheets
2. Copie o ID da URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_É_O_ID]/edit
   ```

### Passo 2 — Criar uma API Key do Google

1. Acesse: **console.cloud.google.com**
2. Crie um novo projeto (ou use um existente)
3. Vá em **APIs e Serviços → Biblioteca**
4. Busque e ative **"Google Sheets API"**
5. Vá em **APIs e Serviços → Credenciais**
6. Clique em **Criar credenciais → Chave de API**
7. Copie a chave gerada (começa com `AIza...`)
8. **Importante:** Em "Restrições de API", selecione "Google Sheets API"

### Passo 3 — Tornar a planilha acessível

A API Key só lê planilhas **públicas** (somente leitura) ou requer OAuth para editar.

**Para lançamentos (escrita):** você precisa autorizar via OAuth ou usar um
Google Apps Script como intermediário.

#### Alternativa mais simples — Apps Script como API:

Adicione esta função ao seu Apps Script da planilha:

```javascript
function doPost(e) {
  try {
    const dados = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ws = ss.getSheetByName(dados.aba);
    ws.appendRow(dados.linha);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, erro: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  const ss  = SpreadsheetApp.getActiveSpreadsheet();
  const aba = e.parameter.aba || 'Despesas';
  const ws  = ss.getSheetByName(aba);
  const dados = ws.getDataRange().getValues();
  return ContentService
    .createTextOutput(JSON.stringify({ valores: dados }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Depois:
1. **Implantar → Nova implantação**
2. Tipo: **App da Web**
3. Executar como: **Eu mesmo**
4. Acesso: **Qualquer pessoa**
5. Copie a URL gerada — use como "URL do Script" nas configurações do app

---

## 📱 COMO USAR

### Lançar despesa
1. Abra o app
2. Selecione o tipo (Despesa ou Receita)
3. Preencha: data, valor, categoria e descrição
4. Toque em **Lançar**

### Ver resumo do mês
1. Toque na aba **Resumo**
2. Navegue entre meses com ‹ ›
3. Toque em **Atualizar dados**

### Ver histórico
1. Toque na aba **Histórico**
2. Toque em **Sincronizar**

---

## 🔒 PRIVACIDADE

- Nenhum dado é enviado para servidores de terceiros
- Tudo vai direto para sua planilha Google Sheets
- A API Key fica salva apenas no seu celular (localStorage)
- O app funciona offline para visualizar o histórico local

---

## 📋 ARQUIVOS DO PWA

| Arquivo | Função |
|---|---|
| `index.html` | App completo (HTML + CSS + JS) |
| `manifest.json` | Metadados do app (nome, ícone, cor) |
| `sw.js` | Service Worker (cache offline) |
| `icon-192.png` | Ícone para Android |
| `icon-512.png` | Ícone para Play Store / splash screen |
