// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import AuthRedirect from './AuthRedirect';
import UserContextProvider from './context/UserProvider';
import Todo from "./Todo";

const App: React.FC = () => {
  return (
    <UserContextProvider>
      <Router>
        <Routes>
          <Route path="/auth-redirect" element={<AuthRedirect />} />
          <Route path="/" element={<Home />} />
          <Route path="/todos" element={<Todo />} />
        </Routes>
      </Router>
    </UserContextProvider>
  );
}

export default App;
