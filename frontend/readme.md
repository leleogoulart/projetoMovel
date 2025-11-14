# Frontend - Aplicativo "Pimp My Setup"

Este diretório contém o código-fonte completo do frontend da aplicação, construído em **React Native** com **Expo**.

Esta é a interface visual (o "cliente") que o utilizador final vê e com a qual interage, seja no telemóvel (Android/iOS) ou na web (`localhost`).

---

## Arquitetura e Fluxo

A aplicação é estruturada usando **Expo Router (file-based routing)**, que usa a estrutura de pastas para definir a navegação.

1.  **`app/_layout.tsx` (O "Cérebro"):**
    * Este é o ficheiro de layout principal da aplicação.
    * A sua **única responsabilidade** é inicializar o Firebase e "embrulhar" toda a aplicação num **Contexto de Autenticação (`AuthContext`)**.
    * Ele monitoriza o estado de login (`onAuthStateChanged`) e disponibiliza o `user` e o estado de `loading` para todos os componentes "filhos".

2.  **`app/login.tsx` (Página Pública):**
    * Esta é a página de entrada. Como está fora da pasta `(tabs)`, ela **não é protegida** pelo "segurança".
    * Contém toda a lógica visual para login, registo, login com Google e redefinição de senha.
    * As suas funções (ex: `handleLogin`) comunicam diretamente com o Firebase Auth (`signInWithEmailAndPassword`, etc.).

3.  **`app/(tabs)/_layout.tsx` (O "Segurança"):**
    * Este ficheiro protege a área principal da aplicação.
    * Ele usa o hook `useAuth()` para verificar se há um `user`.
    * Se **não houver utilizador**, ele redireciona (`<Redirect>`) forçadamente para a página `/login`.
    * Se **houver um utilizador**, ele mostra a barra de navegação inferior com as abas "Home" e "Perfil".

4.  **`app/(tabs)/index.tsx` (Home - Montador de PC):**
    * A página principal para gerar setups.
    * Quando o utilizador clica em "Gerar Sugestão", esta página usa a função `fetch()` para fazer um pedido `POST` ao servidor backend em Python (`http://localhost:5000/gerar-setup`).
    * Ela envia o `budget`, `use` e `userId`.
    * Ela aguarda (sincronamente) a resposta completa do LLM e, em seguida, exibe-a diretamente na UI.

5.  **`app/(tabs)/explore.tsx` (Perfil):**
    * Esta página usa o `onSnapshot` do Firestore para "ouvir" em tempo real a coleção `queries` (filtrada pelo `userId`).
    * Assim que o agente Python (Backend) salva uma nova sugestão no banco de dados, esta página atualiza-se "magicamente" para mostrar o novo histórico.
    * Também permite ao utilizador registar e salvar o seu setup pessoal na coleção `setups` do Firestore.

---

## Stack Utilizada

* **React Native (Expo):** Framework principal para a construção da UI.
* **TypeScript:** Para segurança de tipos.
* **Expo Router:** Para a navegação baseada em ficheiros.
* **Firebase JS SDK:** Usado para:
    * **Authentication:** Login, registo, Google Pop-up, e gestão de sessão.
    * **Firestore:** Leitura e escrita em tempo real na base de dados (histórico e setups).
* **Fetch API:** Para a comunicação direta com o backend Python (`api.py`).

---

*Nota: Esta pasta `app` (frontend) deve estar no mesmo diretório que a pasta `llm` (backend). O projeto foi desenhado para rodar com os dois servidores (frontend e backend) em simultâneo.*