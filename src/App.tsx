import { createContext, useState, useEffect } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { Routes } from "react-router";

import { Home } from "./pages/Home";
import { NewMeeting } from "./pages/NewMeeting";
import { Meeting } from "./pages/Meeting";

import { auth } from "./services/firebase";
import firebase from "firebase/compat/app";

import "./styles/global.css";

interface UserProps {
  id: string;
  name: string;
  votedTopics: string[];
}

interface AuthContextType {
  user: UserProps | undefined;
  signInWithGoogle: () => Promise<void>;
}

export const AuthContext = createContext({} as AuthContextType);

function App() {
  const [user, setUser] = useState<UserProps>();

  // recupera estado de autenticação
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        const { displayName, uid } = user;

        if (!displayName) {
          throw new Error("Informação insuficiente");
        }

        setUser({
          id: uid,
          name: displayName,
          votedTopics: [],
        });
      }
    });
  }, []);

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    const result = await auth.signInWithPopup(provider);

    // se autenticação deu certo
    if (result.user) {
      const { displayName, uid } = result.user;

      // se usuário não possuir nome para display = erro
      if (!displayName) {
        throw new Error("Informação insuficiente");
      }

      // se usuário possuir nome para display = configurar usuário
      setUser({
        id: uid,
        name: displayName,
        votedTopics: [],
      });
    }
  }

  return (
    <BrowserRouter>
      <AuthContext.Provider value={{ user, signInWithGoogle }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meetings/new" element={<NewMeeting />} />
          <Route path="/meetings/:id" element={<Meeting />} />
        </Routes>
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

export default App;
