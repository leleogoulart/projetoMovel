import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../_layout'; // Hook p/ pegar o user logado

const useCases = [
    { id: 'games', label: 'Jogos 🎮' },
    { id: 'edicao', label: 'Edição 🎬' },
    { id: 'trabalho', label: 'Trabalho 💼' },
    { id: 'estudo', label: 'Estudo 📚' },
];

export default function HomeScreen() {
    const [budget, setBudget] = useState('');
    const [selectedUse, setSelectedUse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<string | null>(null);
    
    const { user } = useAuth();

    // Chamada principal da API
    const handleGenerateSuggestion = async () => {
        if (!budget || !selectedUse) {
            Alert.alert('Atenção', 'Por favor, defina um orçamento e selecione um uso.');
            return;
        }
        if (!user) {
            Alert.alert('Erro', 'Você não está logado.');
            return;
        }

        setIsLoading(true);
        setGeneratedResult(null); 

        try {
            // Se for android, usa 10.0.2.2. Se nao, localhost
            const apiUrl = Platform.OS === 'android' 
                ? 'http://10.0.2.2:5000/gerar-setup' 
                : 'http://localhost:5000/gerar-setup';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    budget: budget,
                    use: selectedUse,
                    userId: user.uid, 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro desconhecido do servidor');
            }

            // Salva a resposta do LLM no estado
            setGeneratedResult(data.setup_gerado);
            
            setBudget('');
            setSelectedUse(null);

        } catch (error: any) {
            console.error('Erro ao chamar a API:', error);
            setGeneratedResult(`Ocorreu um erro na conexão: ${error.message}. Verifique se o servidor Python está a rodar.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.pageContainer}>
                
                {/* O 'require' sobe 2 pastas p/ achar o assets */}
                <Image
                  style={styles.logo}
                  source={require('../../assets/images/logo.png')}
                />
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Qual seu orçamento máximo?</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Ex: 3500" 
                        placeholderTextColor="#888"
                        keyboardType="numeric" 
                        value={budget} 
                        onChangeText={text => setBudget(text.replace(/[^0-9]/g, ''))}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Qual será o uso principal?</Text>
                    <View style={styles.useCaseContainer}>
                        {useCases.map((use) => (
                            <TouchableOpacity 
                                key={use.id} 
                                style={[styles.useCaseButton, selectedUse === use.id && styles.selectedUseCaseButton]} 
                                onPress={() => setSelectedUse(use.id)}
                            >
                                <Text style={[styles.useCaseText, selectedUse === use.id && styles.selectedUseCaseText]}>
                                    {use.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Mostra o loading ou o botao */}
                {isLoading ? (
                    <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
                ) : (
                    <TouchableOpacity style={styles.button} onPress={handleGenerateSuggestion}>
                        <Text style={styles.buttonText}>Gerar Sugestão</Text>
                    </TouchableOpacity>
                )}

                {/* Mostra o card de resultado se existir */}
                {generatedResult && (
                    <View style={styles.resultContainer}>
                        <Text style={styles.resultTitle}>
                            {generatedResult.startsWith('Ocorreu um erro') ? 'Ocorreu um Erro' : 'Sugestão Gerada:'}
                        </Text>
                        <Text style={[
                            styles.resultText, 
                            generatedResult.startsWith('Ocorreu um erro') && styles.errorText
                        ]}>
                            {generatedResult}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  pageContainer: { padding: 20, paddingBottom: 60 },
  
  logo: {
    width: 250, 
    height: 100, 
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 30,
  },
  
  inputGroup: { marginBottom: 25, width: '100%' },
  label: { fontSize: 18, color: '#E0E0E0', marginBottom: 10 },
  input: { width: '100%', height: 50, backgroundColor: '#1E1E1E', color: '#FFFFFF', paddingHorizontal: 15, borderRadius: 8, borderWidth: 1, borderColor: '#333', fontSize: 16 },
  useCaseContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  useCaseButton: { backgroundColor: '#1E1E1E', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#333', width: '48%', marginBottom: 10, alignItems: 'center' },
  selectedUseCaseButton: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  useCaseText: { color: '#FFFFFF', fontSize: 16 },
  selectedUseCaseText: { fontWeight: 'bold' },
  button: { width: '100%', backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  
  resultContainer: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 8,
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 16,
    color: '#E0E0E0',
    lineHeight: 24, 
    textAlign: 'left',
  },
  errorText: {
    color: '#FF453A', 
    textAlign: 'center',
    lineHeight: 22,
  },
});