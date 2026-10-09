import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import { getStoredUser } from "./api";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Admin from "./pages/Admin";

function AdminRoute() {
  const user = getStoredUser();
  return user?.isAdmin ? <Admin /> : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/products" element={<Products />} />

        <Route path="/admin" element={<AdminRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
