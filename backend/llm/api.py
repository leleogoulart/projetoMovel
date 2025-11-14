from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

# Importa a função principal do agente
from agent import gerar_setup_completo 

app = Flask(__name__)
CORS(app) # Habilita o CORS para o app React poder chamar

@app.route('/gerar-setup', methods=['POST'])
def handle_gerar_setup():
    try:
        data = request.json
        budget = data.get('budget')
        use_case = data.get('use')
        user_id = data.get('userId')

        if not budget or not use_case or not user_id:
            return jsonify({'error': 'Dados incompletos (budget, use, userId são obrigatórios).'}), 400

        print(f"[API] Pedido recebido para User: {user_id}. Chamando o agente...")
        
        # Chama a função pesada do LangChain e espera a resposta
        resultado_do_llm = gerar_setup_completo(user_id, budget, use_case)
        
        print(f"[API] Resposta do agente recebida. Enviando para o app.")

        # Devolve a resposta final do LLM
        return jsonify({
            'status': 'sucesso',
            'setup_gerado': resultado_do_llm
        })

    except Exception as e:
        print(f"[API] ERRO NO SERVIDOR: {e}")
        traceback.print_exc() 
        return jsonify({'error': f'Ocorreu um erro interno no servidor: {e}'}), 500

if __name__ == '__main__':
    # Roda o servidor na porta 5000
    app.run(debug=True, port=5000)