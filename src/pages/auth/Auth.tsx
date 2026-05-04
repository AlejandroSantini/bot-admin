import { useState } from "react";
import Login from "../../components/auth/Login";
import Register from "../../components/auth/Register";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <Login onToggleMode={() => setIsLogin(false)} />
  ) : (
    <Register onToggleMode={() => setIsLogin(true)} />
  );
}