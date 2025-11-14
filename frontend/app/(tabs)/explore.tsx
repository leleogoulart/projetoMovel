import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, useAuth } from '../_layout'; // Pega o user logado

import {
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot, // O "ouvinte" em tempo real
  orderBy,
  query,
  setDoc,
  where
} from 'firebase/firestore';

const db = getFirestore(auth.app);

export default function ProfileScreen() {
  const { user } = useAuth();
  
  const [savedSetup, setSavedSetup] = useState<any>(null);
  const [pastQueries, setPastQueries] = useState<any[]>([]);
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [loadingQueries, setLoadingQueries] = useState(true);

  // States do form de setup
  const [isEditing, setIsEditing] = useState(false);
  const [cpu, setCpu] = useState('');
  const [motherboard, setMotherboard] = useState('');
  const [gpu, setGpu] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [psu, setPsu] = useState('');
  const [pcCase, setPcCase] = useState('');

  const handleLogout = () => {
    signOut(auth).catch(error => Alert.alert("Erro", "Não foi possível sair."));
  };

  // Carrega os dados do user
  useEffect(() => {
    if (user) {
      // 1. Carrega o setup (só 1 vez)
      const loadSetup = async () => {
        setLoadingSetup(true);
        const setupRef = doc(db, "setups", user.uid);
        const setupSnap = await getDoc(setupRef);
        if (setupSnap.exists()) {
          setSavedSetup(setupSnap.data());
        }
        setLoadingSetup(false);
      };
      
      loadSetup();

      // 2. "Ouve" o histórico de pesquisas em tempo real
      setLoadingQueries(true);
      const queriesRef = collection(db, "queries");
      const q = query(
        queriesRef, 
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc") // Mais novas primeiro
      );

      // onSnapshot atualiza a tela sozinho qnd o DB muda
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const queries: any[] = [];
        querySnapshot.forEach((doc) => {
          queries.push({ id: doc.id, ...doc.data() });
        });
        setPastQueries(queries);
        setLoadingQueries(false);
      }, (error) => {
        console.error("Erro ao 'ouvir' as queries:", error);
        Alert.alert("Erro de Histórico", "Não foi possível carregar o seu histórico de pesquisas.");
        setLoadingQueries(false);
      });
      
      // Limpa o listener quando a página fecha
      return () => unsubscribe();

    }
  }, [user]);

  // Preenche o form para editar
  const handleEdit = () => {
    if (savedSetup) {
      setCpu(savedSetup.cpu || '');
      setMotherboard(savedSetup.motherboard || '');
      setGpu(savedSetup.gpu || '');
      setRam(savedSetup.ram || '');
      setStorage(savedSetup.storage || '');
      setPsu(savedSetup.psu || '');
      setPcCase(savedSetup.pcCase || '');
    }
    setIsEditing(true);
  };
  
  // Salva o setup no Firebase
  const handleSaveSetup = async () => {
    if (!cpu || !motherboard || !ram || !storage || !psu) {
        Alert.alert("Campos Obrigatórios", "Por favor, preencha todos os campos, exceto os opcionais.");
        return;
    }
    const setupData = { cpu, motherboard, gpu, ram, storage, psu, pcCase };
    if (user) {
        const setupRef = doc(db, "setups", user.uid);
        try {
            await setDoc(setupRef, setupData, { merge: true }); // merge: true eh p/ n apagar campos
            setSavedSetup(setupData);
            setIsEditing(false);
            Alert.alert("Sucesso!", "O seu setup foi salvo.");
        } catch (error) {
            console.error("Erro ao salvar o setup:", error);
            Alert.alert("Erro", "Não foi possível salvar o seu setup.");
        }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.pageContainer}>
        <Text style={styles.headerTitle}>Área do Utilizador</Text>
        <Text style={styles.subtitle}>Gestão do seu perfil e histórico.</Text>

        {/* Seção Meu Setup Atual */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Meu Setup Atual</Text>
          {loadingSetup ? <ActivityIndicator color="#FFFFFF" style={{margin: 20}}/> : (
            isEditing ? (
              <>
                <TextInput style={styles.input} value={cpu} onChangeText={setCpu} placeholder="Processador (CPU)" placeholderTextColor="#888" />
                <TextInput style={styles.input} value={motherboard} onChangeText={setMotherboard} placeholder="Placa-Mãe" placeholderTextColor="#888" />
                <TextInput style={styles.input} value={ram} onChangeText={setRam} placeholder="Memória RAM" placeholderTextColor="#888" />
                <TextInput style={styles.input} value={storage} onChangeText={setStorage} placeholder="Disco (Armazenamento)" placeholderTextColor="#888" />
                <TextInput style={styles.input} value={psu} onChangeText={setPsu} placeholder="Fonte (PSU)" placeholderTextColor="#888" />
                <TextInput style={styles.input} value={gpu} onChangeText={setGpu} placeholder="Placa de Vídeo (GPU) (Opcional)" placeholderTextColor="#888" />
                <TextInput style={styles.input} value={pcCase} onChangeText={setPcCase} placeholder="Gabinete (Opcional)" placeholderTextColor="#888" />
                <View style={styles.buttonGroup}>
                  <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsEditing(false)}>
                      <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveSetup}>
                      <Text style={styles.buttonText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : savedSetup ? (
              <>
                {Object.entries(savedSetup).map(([key, value]) => value ? (
                  <Text key={key} style={styles.infoText}><Text style={{fontWeight: 'bold', textTransform: 'capitalize'}}>{key}:</Text> {value as string}</Text>
                ) : null)}
                <TouchableOpacity style={styles.button} onPress={handleEdit}>
                  <Text style={styles.buttonText}>Editar Setup</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.infoText}>Você ainda não registou o seu setup.</Text>
                <TouchableOpacity style={styles.button} onPress={handleEdit}>
                  <Text style={styles.buttonText}>Registar meu Setup</Text>
                </TouchableOpacity>
              </>
            )
          )}
        </View>

        {/* Seção Histórico de Pesquisas */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Histórico de Pesquisas</Text>
          {loadingQueries ? <ActivityIndicator color="#FFFFFF" style={{margin: 20}} /> : (
            pastQueries.length > 0 ? (
              pastQueries.map(q => (
                <View key={q.id} style={styles.historyItem}>
                  <Text style={styles.historyRequest}>Pedido: R${q.budget} para {q.use}</Text>
                  <Text style={styles.historyResult}>{q.result}</Text> 
                </View>
              ))
            ) : (
              <Text style={styles.infoText}>Nenhuma pesquisa encontrada.</Text>
            )
          )}
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Sair (Logout)</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  pageContainer: { padding: 20, paddingBottom: 40 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#B3B3B3', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 12, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
  infoText: { fontSize: 16, color: '#E0E0E0', marginBottom: 10, lineHeight: 22, textTransform: 'capitalize' },
  input: { width: '100%', height: 50, backgroundColor: '#121212', color: '#FFFFFF', paddingHorizontal: 15, borderRadius: 8, borderWidth: 1, borderColor: '#333', fontSize: 16, marginBottom: 10 },
  button: { flex: 1, backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  buttonGroup: { flexDirection: 'row', gap: 10, marginTop: 10 },
  saveButton: { backgroundColor: '#34C759' },
  cancelButton: { backgroundColor: '#555' },
  
  historyItem: { backgroundColor: '#333', padding: 15, borderRadius: 8, marginBottom: 10 },
  historyRequest: { color: '#AAA', fontSize: 14, fontStyle: 'italic', marginBottom: 8 },
  historyResult: { color: '#E0E0E0', fontSize: 16, lineHeight: 24 }, // Estilo p/ resposta do LLM
  
  logoutButton: { width: '100%', maxWidth: 500, alignSelf: 'center', backgroundColor: '#dc3545', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
});