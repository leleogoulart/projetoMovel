import { Slot, useRouter } from 'expo-router';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// Config do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBWfo477jE2kjfR9LKKESeLj0bZS8pfAVY",
  authDomain: "pimp-my-setup.firebaseapp.com",
  projectId: "pimp-my-setup",
  storageBucket: "pimp-my-setup.firebasestorage.app",
  messagingSenderId: "170069456651",
  appId: "1:170069456651:web:ea8c294f48fa974b58940e"
};

// Inicializa o app
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Contexto p/ guardar o user logado
const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vigia do firebase p/ saber se o user logou ou deslogou
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function Layout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Roda qnd o user ou o loading mudam
    if (loading) {
      return; // Nao faz nada se tiver carregando
    }
    if (user) {
      // Logado -> vai p/ home
      router.replace('/(tabs)');
    } else {
      // Nao logado -> vai p/ login
      router.replace('/login');
    }
  }, [user, loading]);
  
  // Tela de loading inicial
  if (loading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212'
    }
});