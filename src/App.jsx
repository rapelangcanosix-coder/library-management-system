import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Transactions from "./pages/Transactions";
import Members from "./pages/Members";

function ProtectedRoute({ children }) {
  const loggedIn = localStorage.getItem("loggedIn");

  if (loggedIn !== "true") {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books"
          element={
            <ProtectedRoute>
              <Books />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;