import os
import datetime
import time 
from dotenv import load_dotenv
load_dotenv()

import firebase_admin
from firebase_admin import credentials, firestore

from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages import HumanMessage, ToolMessage

# Inicializa o Firebase Admin
try:
    cred = credentials.Certificate("serviceAccountKey.json") 
    firebase_admin.initialize_app(cred)
except ValueError:
    # gambiarra pro flask n quebrar qnd recarrega
    pass 
db = firestore.client()

# Config do Agente
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)
# NOTA: max_results=3 eh crucial pra n estourar o limite de token do groq
search_tool = TavilySearchResults(max_results=3) 
llm_with_search = llm.bind_tools([search_tool])
tools = {
    "tavily_search_results_json": search_tool
}

def get_text_content(message_content):
    """Extrai o conteúdo de texto de uma mensagem."""
    if isinstance(message_content, list) and message_content:
        text_block = next((block['text'] for block in message_content if block.get('type') == 'text'), None)
        return text_block if text_block else ""
    elif isinstance(message_content, str):
        return message_content
    return ""

# Funcao principal do agente
def gerar_setup_completo(user_id, budget_usuario, uso_usuario):
    
    now = datetime.datetime.now()
    meses_pt = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]
    data_contextual = f"{meses_pt[now.month - 1]} de {now.year}"

    # O prompt principal. Tem q ser bem detalhado
    prompt_usuario = f"""
    **OBJETIVO:**
    Atue como um especialista **expert** em hardware de PC no Brasil. A sua missão é montar o **melhor setup de PC possível**, maximizando a performance para o *Uso Principal* dentro do *Orçamento-Alvo*.

    **DADOS DE ENTRADA:**
    * **ORÇAMENTO MÁXIMO (LIMITE RÍGIDO): R${budget_usuario}**
    * Uso Principal: {uso_usuario}
    * Peças a incluir: Processador, Placa Mãe, Memória RAM, Armazenamento (SSD), Fonte, Gabinete e Placa de Vídeo (se o orçamento permitir).

    **LOJAS DE REFERÊNCIA (BRASIL):**
    Use estas lojas como referência principal para preços:
    * Kabum, Pichau, TerabyteShop.

    **TAREFAS E REGRAS CRÍTICAS:**

    1.  **REGRA DE TRIAGEM (A MAIS IMPORTANTE):**
        Primeiro, analise o `ORÇAMENTO MÁXIMO`.
        
        * **CASO 1: Orçamento > R$ 3.500:**
            O orçamento é suficiente para uma Placa de Vídeo (GPU) dedicada.
            Continue para a Regra de Maximização.
        
        * **CASO 2: Orçamento entre R$ 2.000 e R$ 3.500 (E Uso 'Games' ou 'Edição'):**
            O orçamento é **INSUFICIENTE** para uma GPU dedicada nova. Você **DEVE** montar um setup com **APU** (ex: AMD Ryzen 5 5600G) usando peças de lojas nacionais (Kabum, Pichau).
            **VERIFIQUE OS PREÇOS REAIS** das peças. Se a soma *real* ultrapassar o orçamento, **SIMPLIFIQUE** as outras peças (ex: placa-mãe A520, 8GB RAM, SSD 500GB, fonte 450W). O seu objetivo é montar um setup de APU funcional *dentro* do limite.

        * **CASO 3: Orçamento < R$ 2.000 (Orçamento Extremo):**
            É **IMPOSSÍVEL** montar um setup novo nas lojas nacionais por este preço. Você **DEVE** usar a "REGRA DO ALIEXPRESS".
            Não tente montar um setup com APU (como o 5600G), pois ele sozinho custa quase metade disso. Siga a Regra do AliExpress.

    2.  **REGRA DE VERIFICAÇÃO DE PREÇO (TOLERÂNCIA ZERO):**
        Após montar a lista de peças, use a sua ferramenta de busca para encontrar o preço médio de CADA PEÇA no Brasil.
        Some os valores. O `Valor Final Aproximado` **DEVE** ser esta soma real.
        Se a soma real ultrapassar o `ORÇAMENTO MÁXIMO`, você **FALHOU** e deve recomeçar, escolhendo peças mais baratas (como descrito no CASO 2 ou 3) até que a soma real caiba no orçamento.
        **NUNCA INVENTE O PREÇO FINAL SÓ PARA CABER NO ORÇAMENTO.**

    3.  **REGRA DO ALIEXPRESS (Apenas para CASO 3):**
        * Busque por "Kit Xeon X99 AliExpress".
        * Monte o setup com este kit + uma GPU usada (ex: RX 580 8GB).
        * Calcule o `Valor Final Aproximado` em Reais (BRL), **incluindo uma estimativa de 92% de taxas de importação** (Remessa Conforme).
        * Adicione uma **NOTA DE RISCO** no final da sua resposta.

    4.  **REGRA DE COMPATIBILIDADE:**
        A Placa Mãe DEVE ser 100% compatível com o Processador.
        * **ERRO CRÍTICO A EVITAR:** Não recomende placas-mãe de entrada (ex: 'H610', 'A520') com processadores de alta performance (ex: 'Core i7/i9', 'Ryzen 7/9').

    **FORMATAÇÃO DA RESPOSTA FINAL (OBRIGATÓRIO):**
    Sua resposta final deve seguir *exclusivamente* este formato de lista.
    Preencha **todos** os campos.

    Processador: [Marca e Modelo]
    Placa Mãe: [Marca e Modelo]
    Memória RAM: [Marca e Modelo]
    Armazenamento: [Marca e Modelo]
    Fonte: [Marca e Modelo]
    Gabinete: [Marca e Modelo]
    Placa de Vídeo: [Marca e Modelo, ou "Gráficos Integrados do Processador", ou "GPU Usada (AliExpress)"]
    Valor Final Aproximado: R$[Valor Total]
    """

    prompt_completo = (
        f"Contexto de data atual: Estamos em {data_contextual}.\n\n"
        f"Instrução do usuário: {prompt_usuario}"
    )

    messages = [HumanMessage(content=prompt_completo)]
    resposta_final_texto = "" 

    try:
        print("[Agente] Iniciando chamada ao Groq...")
        ai_msg = llm_with_search.invoke(messages)
        messages.append(ai_msg)

        if ai_msg.tool_calls:
            print("[Agente] Groq solicitou o uso de ferramentas...")
            for tool_call in ai_msg.tool_calls:
                tool_name = tool_call['name'] 
                tool_args = tool_call['args']
                tool_call_id = tool_call['id']
                
                selected_tool = tools.get(tool_name)
                
                if selected_tool:
                    tool_output = selected_tool.invoke(tool_args)
                    messages.append(
                        ToolMessage(content=str(tool_output), tool_call_id=tool_call_id)
                    )
                else:
                    messages.append(
                        ToolMessage(content=f"Erro: Ferramenta '{tool_name}' não encontrada.", tool_call_id=tool_call_id)
                    )
            
            print("[Agente] Groq decidindo a resposta final...")
            final_response = llm_with_search.invoke(messages)
            resposta_final_texto = get_text_content(final_response.content)

        else:
            print("[Agente] Resposta gerada diretamente.")
            resposta_final_texto = get_text_content(ai_msg.content)

        # Salva no Firebase
        print(f"[Agente] Resposta gerada. Salvando no Firestore para o user: {user_id}")
        
        doc_ref = db.collection("queries").document() 
        doc_ref.set({
            "userId": user_id,
            "budget": budget_usuario,
            "use": uso_usuario,
            "result": resposta_final_texto,
            "timestamp": firestore.SERVER_TIMESTAMP
        })
        
        print("[Agente] Resposta salva com sucesso no Firestore.")

    except Exception as e:
        print(f"[Agente] Ocorreu um erro ao gerar o setup: {e}")
        resposta_final_texto = f"Ocorreu um erro ao gerar sua sugestão: {e}"
        # Tenta salvar o erro no Firestore
        try:
            doc_ref = db.collection("queries").document()
            doc_ref.set({
                "userId": user_id,
                "budget": budget_usuario,
                "use": uso_usuario,
                "result": resposta_final_texto,
                "timestamp": firestore.SERVER_TIMESTAMP
            })
        except:
            pass 
    
    # Devolve a resposta final para a api.py
    return resposta_final_texto