# **Build My Setup**

Este é um projeto full-stack que gera recomendações de setups de PC com base no orçamento e no uso principal do usuário. A aplicação utiliza um frontend em React Native (Expo) para a interface do usuário e um backend em Python (Flask + LangChain) para processar os pedidos com um agente de IA (Groq).

---

## 🚀 Funcionalidades Principais

* **Autenticação Completa:** Registo e login com Email/Senha e Google (via Firebase Auth).
* **Recuperação de Senha:** Funcionalidade de "Esqueci minha senha" com envio de email.
* **Agente de IA (LLM):** Um agente LangChain com Groq (Llama3) que usa ferramentas de busca (Tavily) para encontrar peças de PC.
* **Geração Síncrona:** O app aguarda a resposta do agente e a exibe diretamente na UI.
* **Banco de Dados:** O Firebase Firestore é usado para:
    * Salvar o setup personalizado de cada usuário (CPU, GPU, etc.).
    * Salvar o histórico de todas as pesquisas geradas pela IA.
* **Perfil de Usuário:** Uma área onde o usuário pode editar seu setup atual e ver seu histórico de pesquisas em tempo real.

---

## 🛠️ Stack de Tecnologias

* **Frontend (Pasta `app/`):**
    * React Native (Expo)
    * TypeScript
    * Expo Router (para navegação)
* **Backend (Pasta `llm/`):**
    * Python 3.10+
    * Flask (para a API)
    * Flask-CORS (para permitir a comunicação)
    * LangChain (para o agente)
    * Groq API (LLM)
    * Tavily API (Ferramenta de Busca)
* **Banco de Dados & Auth:**
    * Firebase Authentication
    * Firebase Firestore

---

## ⚙️ Configuração do Projeto

Antes de executar, você precisa configurar os dois ambientes (Frontend e Backend).

### 1. Configuração do Backend (Pasta `llm/`)

O backend Python é responsável por rodar o agente de IA.

1.  **Navegue até a pasta `llm`:**
    ```bash
    cd llm
    ```
2.  **Crie um Ambiente Virtual (venv):**
    ```bash
    python -m venv venv
    ```
3.  **Ative o venv:**
    * No Windows: `.\venv\Scripts\activate`
    * No Mac/Linux: `source venv/bin/activate`

4.  **Instale as dependências Python:**
    ```bash
    pip install flask flask-cors langchain langchain-groq langchain-community tavily-search firebase-admin python-dotenv
    ```
5.  **Adicione a Chave de Serviço do Firebase:**
    * Faça o download do seu ficheiro `serviceAccountKey.json` no painel do Firebase (Configurações do Projeto > Contas de Serviço).
    * Coloque este ficheiro dentro da pasta `llm/`.

6.  **Crie o ficheiro `.env`:**
    * Na pasta `llm/`, crie um ficheiro chamado `.env`.
    * Adicione as suas chaves de API (necessárias para o Groq e Tavily):
    ```.env
    GROQ_API_KEY=sua_chave_aqui
    TAVILY_API_KEY=sua_chave_aqui
    ```

### 2. Configuração do Frontend (Pasta Raiz / `app/`)

O frontend é a sua aplicação React Native (Expo).

1.  **Navegue até a pasta raiz do projeto** (um nível *acima* de `app/`).
2.  **Instale as dependências do Node.js:**
    ```bash
    npm install
    ```
    ou (se tiver o `yarn.lock`)
    ```bash
    yarn install
    ```
3.  **Instale as dependências do Expo:**
    ```bash
    npx expo install
    ```
    *Certifique-se de que `expo-router`, `expo-linking` e `expo-web-browser` estão instalados.*

4.  **Verifique as Configurações do Firebase:**
    * Os seus ficheiros (`app/_layout.tsx`, `app/login.tsx`, etc.) já devem conter as configurações do Firebase (o objeto `firebaseConfig`). Confirme que elas estão corretas.

### 3. Configuração do Firebase (no Site)

Para a aplicação funcionar, garanta que no seu [Console do Firebase](https://console.firebase.google.com/):
* **Authentication > Sign-in method:** `Email/Senha` e `Google` estão **Ativados**.
* **Authentication > Settings > Authorized domains:** O `localhost` está na lista.
* **Firestore Database > Regras:** As regras de segurança para `setups` e `queries` estão publicadas.

---

## 🚀 Como Executar a Aplicação

Para a aplicação funcionar, o Frontend e o Backend precisam estar a rodar **ao mesmo tempo em dois terminais separados**.

### Terminal 1: Iniciar o Backend (Servidor Python)

Este terminal vai rodar o seu "garçom" (a API Flask) que espera pelos pedidos.

```bash
# 1. Navegue até a pasta do backend
cd llm

# 2. Ative o ambiente virtual
.\venv\Scripts\activate

# 3. Inicie o servidor Flask
python api.py

# Você deve ver uma mensagem: * Running on [http://127.0.0.1:5000](http://127.0.0.1:5000)
# Deixe este terminal aberto.

```

### Terminal 2: Iniciar o Frontend (App Expo)

- Este terminal vai rodar a sua aplicação visual.

- Abra um NOVO terminal no VS Code

### 1. Certifique-se de que está na pasta RAIZ do projeto (a que tem a pasta 'app' e 'llm')
#### Se estiver em 'llm', digite: cd ..

### 2. Inicie o servidor do Expo
npx expo start

### 3. Pressione 'w' no terminal para abrir a aplicação no seu navegador
#### (geralmente em http://localhost:8081)

---

Agora você pode usar a aplicação! Faça login, vá para a Home, gere um setup e veja o resultado aparecer.