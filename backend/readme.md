# Backend - Agente de IA (Build My Setup)

Este diretório (`llm/`) contém o "cérebro" da aplicação. É um micro-serviço em Python que funciona como uma API para o frontend em React Native.

A sua principal responsabilidade é receber um orçamento, um tipo de uso e um ID de utilizador, e devolver uma sugestão completa de setup de PC.

---

## Como Funciona

Este backend utiliza o Flask para criar um servidor de API local. O fluxo de um pedido é o seguinte:

1.  **Receção do Pedido:** O ficheiro `api.py` (o "garçom") expõe um único endpoint: `/gerar-setup`. Ele recebe um JSON do frontend contendo `budget`, `use` e `userId`.

2.  **Chamada do Agente:** A `api.py` imediatamente chama a função principal `gerar_setup_completo` que está no `agent.py` (a "cozinha"), passando-lhe esses dados.

3.  **Processamento (LangChain):** O `agent.py` assume o controlo. Ele:
    * Constrói um prompt detalhado e rigoroso com base nos dados recebidos.
    * Utiliza o `LangChain` para orquestrar o LLM (`Groq` - Llama3) e a ferramenta de busca (`TavilySearchResults`).
    * O LLM faz uma primeira chamada para decidir o que pesquisar.
    * O LLM faz uma segunda chamada para analisar os resultados da busca e gerar a resposta final (o setup).

4.  **Persistência (Firestore):** Antes de terminar, o `agent.py` liga-se ao Firebase Admin e salva o resultado completo (o `budget`, `use` e o `result` do LLM) na coleção `queries` do Firestore, associado ao `userId`.

5.  **Resposta (Síncrona):** O `agent.py` retorna o texto do setup gerado para a `api.py`. A `api.py` então envia esse texto de volta para o frontend (React Native) como uma resposta JSON (`{'setup_gerado': ...}`).

---

## Stack Utilizada

* **Flask:** Para criar o servidor web e o endpoint da API.
* **Flask-CORS:** Para permitir que o `localhost` do app (React Native) comunique com o `localhost` da API (Python).
* **LangChain:** Para a orquestração do agente (LLM + Ferramentas).
* **Groq:** Como provedor do LLM (Llama 3).
* **Tavily:** Para a ferramenta de busca na web.
* **Firebase Admin:** Para autenticação do servidor e para salvar os resultados no Firestore.

---

*Nota: Esta pasta `llm` (backend) deve estar no mesmo diretório que a pasta `app` (frontend). O projeto foi desenhado para rodar com os dois servidores (frontend e backend) em simultâneo.*