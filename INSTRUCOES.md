# 📖 Instruções de Instalação - Para Não Programadores

Este guia vai te ajudar a instalar e usar o bot Surebets de forma simples, mesmo sem conhecimento de programação.

## 🚀 Instalação Rápida (3 passos)

### Passo 1: Instalar Node.js

1. Acesse o site: https://nodejs.org/
2. Clique no botão verde "LTS" (versão recomendada)
3. Baixe e instale o arquivo (siga as instruções na tela)
4. **IMPORTANTE**: Durante a instalação, certifique-se de marcar a opção "Add to PATH" se aparecer

### Passo 2: Instalar o Bot

1. Abra a pasta do projeto (onde estão os arquivos)
2. **Clique duas vezes** no arquivo `setup.bat`
3. Aguarde a instalação terminar (pode demorar alguns minutos)
4. Quando aparecer "INSTALAÇÃO CONCLUÍDA", você pode fechar a janela

### Passo 3: Configurar o Bot

**Nota:** O script de instalação já cria os arquivos `.env` e `config.json` automaticamente! Se eles já existirem, você só precisa editá-los.

#### 3.1. Configurar o arquivo `.env`

1. Abra o arquivo `.env` com o Bloco de Notas (ele já foi criado automaticamente)
2. Preencha as informações conforme abaixo:

**Como obter as credenciais do Telegram:**

- Acesse: https://my.telegram.org/apps
- Faça login com sua conta do Telegram
- Clique em "Create new application"
- Preencha os dados e copie o `api_id` e `api_hash`
- Cole no arquivo `.env` nos campos correspondentes
- Adicione seu número de telefone (com código do país, ex: +5511999999999)
- Se tiver senha de duas etapas no Telegram, adicione também

**Como obter a URL do Webhook do Discord:**

- Abra o Discord
- Vá nas configurações do servidor onde quer receber as mensagens
- Clique em "Integrações" > "Webhooks"
- Clique em "Novo Webhook" ou "Criar Webhook"
- Copie a URL do webhook
- Cole no arquivo `.env` no campo `DISCORD_WEBHOOK_URL`

#### 3.2. Configurar o arquivo `config.json`

1. Abra o arquivo `config.json` com o Bloco de Notas (ele já foi criado automaticamente)
2. Por enquanto, deixe o `groupIds` como array vazio: `[]`
3. Salve o arquivo

## ▶️ Como Usar

1. **Clique duas vezes** no arquivo `run.bat`
2. Na primeira vez, o bot vai pedir um código de verificação
3. Verifique seu Telegram e digite o código na janela do bot
4. O bot vai começar a descobrir os grupos automaticamente
5. Quando aparecer mensagens com IDs de grupos, anote os IDs dos grupos que você quer monitorar
6. Pare o bot (pressione Ctrl+C)
7. Edite o `config.json` e adicione os IDs no array `groupIds`, exemplo:
   ```json
   "groupIds": ["-1001234567890", "-1009876543210"]
   ```
8. Execute o `run.bat` novamente

## ❓ Problemas Comuns

### "Node.js não encontrado"

- Você precisa instalar o Node.js primeiro (Passo 1)
- Certifique-se de reiniciar o computador após instalar

### "Dependências não instaladas"

- Execute o `setup.bat` novamente

### "Arquivo .env não encontrado"

- Certifique-se de ter criado o arquivo `.env` baseado no `env.example`
- O arquivo deve se chamar exatamente `.env` (com o ponto na frente)

### O bot não está enviando mensagens

- Verifique se o webhook do Discord está correto
- Verifique se os IDs dos grupos no `config.json` estão corretos
- Certifique-se de que o bot está rodando (janela aberta)

## 🛑 Como Parar o Bot

- Pressione `Ctrl+C` na janela onde o bot está rodando
- Ou simplesmente feche a janela

## 📝 Dicas

- Deixe a janela do bot aberta enquanto quiser que ele funcione
- Se fechar a janela, o bot para de funcionar
- Para iniciar novamente, basta executar o `run.bat` novamente
