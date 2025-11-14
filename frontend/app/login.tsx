import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
// Pega o auth la do layout
import { auth } from './_layout';

const googleProvider = new GoogleAuthProvider();

export default function LoginScreen() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Limpa os campos
  const clearInputs = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  // Logica de login
  const handleLogin = () => {
    if (!email || !password) return setError('Por favor, preencha todos os campos.');
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .catch(error => setError(getFriendlyErrorMessage(error.code)))
      .finally(() => setLoading(false));
  };

  // Logica de registro
  const handleSignUp = () => {
    if (!email || !password || !confirmPassword) return setError('Por favor, preencha todos os campos.');
    if (password !== confirmPassword) return setError('As senhas não coincidem.');
    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .catch(error => setError(getFriendlyErrorMessage(error.code)))
      .finally(() => setLoading(false));
  };

  // Login com Google (popup)
  const handleGoogleLogin = () => {
    setLoading(true);
    signInWithPopup(auth, googleProvider)
      .catch((error) => {
        setError(getFriendlyErrorMessage(error.code));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Reset de senha
  const handlePasswordReset = () => {
    if (!email) {
      setError('Digite o seu email no campo acima para redefinir a senha.');
      return;
    }
    setLoading(true);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setError('Sucesso! Um link para redefinir a senha foi enviado para o seu email.');
      })
      .catch(error => {
        setError(getFriendlyErrorMessage(error.code));
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  // Mapeia os erros do firebase pra algo amigavel
  const getFriendlyErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'O formato do email é inválido.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Email ou senha incorretos.';
      case 'auth/email-already-in-use':
        return 'Este email já está a ser utilizado.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      case 'auth/popup-closed-by-user':
        return 'A janela de login foi fechada. Tente novamente.';
      default:
        return 'Ocorreu um erro. Tente novamente.';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.card}
      >
        <Text style={styles.headerTitle}>{isLoginView ? 'Login' : 'Crie sua Conta'}</Text>
        
        {/* Mostra msg de erro/sucesso */}
        {error ? <Text style={[styles.errorText, error.startsWith('Sucesso!') && styles.successText]}>{error}</Text> : null}
        
        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          value={email} 
          onChangeText={text => { setEmail(text); setError(''); }} // Limpa o erro ao digitar
          autoCapitalize="none" 
          keyboardType="email-address" 
          placeholderTextColor="#888" 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Senha" 
          value={password} 
          onChangeText={text => { setPassword(text); setError(''); }}
          secureTextEntry 
          placeholderTextColor="#888" 
        />
        {!isLoginView && (
          <TextInput 
            style={styles.input} 
            placeholder="Confirme a Senha" 
            value={confirmPassword} 
            onChangeText={text => { setConfirmPassword(text); setError(''); }}
            secureTextEntry 
            placeholderTextColor="#888" 
          />
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#FFFFFF" style={{ marginVertical: 15 }} />
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={isLoginView ? handleLogin : handleSignUp}>
              <Text style={styles.buttonText}>{isLoginView ? 'Entrar' : 'Cadastrar'}</Text>
            </TouchableOpacity>
            
            {isLoginView && ( // Mostra o "esqueci senha" so no login
              <>
                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                  <Text style={styles.buttonText}>Entrar com Google</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handlePasswordReset}>
                  <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
        
        <TouchableOpacity onPress={() => { if (!loading) { setIsLoginView(!isLoginView); clearInputs(); }}}>
          <Text style={styles.switchText}>{isLoginView ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', backgroundColor: '#1E1E1E', padding: 20, borderRadius: 12, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
  input: { width: '100%', height: 50, backgroundColor: '#121212', color: '#FFFFFF', paddingHorizontal: 15, borderRadius: 8, borderWidth: 1, borderColor: '#333', fontSize: 16, marginBottom: 15 },
  button: { width: '100%', backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  googleButton: { width: '100%', backgroundColor: '#DB4437', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  switchText: { color: '#007AFF', marginTop: 20 },
  errorText: { color: '#FF453A', marginBottom: 15, textAlign: 'center' },
  successText: { color: '#34C759' }, 
  forgotPasswordText: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 15,
    textDecorationLine: 'underline',
  },
});