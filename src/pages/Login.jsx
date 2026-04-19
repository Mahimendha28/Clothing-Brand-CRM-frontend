import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";

import PasswordToggleButton from "../components/PasswordToggleButton";
import StatusBanner from "../components/common/StatusBanner";
import { setCredentials } from "../features/auth/authSlice";
import { loginUser } from "../services/authService";
import { getDefaultRouteForRole } from "../utils/redirect";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(formData);
      dispatch(setCredentials({ token: response.token, user: response.user }));
      const redirectTarget = location.state?.from
        ? `${location.state.from.pathname}${location.state.from.search || ""}`
        : getDefaultRouteForRole(response.user.role);

      navigate(redirectTarget, { replace: true });
    } catch (apiError) {
      setError(apiError.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10">
         <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Welcome Back</h2>
         <p className="text-gray-400 text-sm font-medium tracking-wide">
            Manage your orders, wishlist, and recommendations.
         </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-1">
           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Email Address</label>
           <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
                 <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="YOUR NAME @ EMAIL.COM"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all"
                value={formData.email}
                onChange={handleChange}
                required
              />
           </div>
        </div>

        <div className="space-y-1">
           <div className="flex justify-between items-end mb-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Password</label>
              <Link to="/forgot-password" size="xs" className="text-[9px] font-black uppercase tracking-widest text-[var(--color-primary)]">Forgot?</Link>
           </div>
           <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
                 <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-12 text-xs font-bold uppercase tracking-widest outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <PasswordToggleButton
                visible={showPassword}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              />
           </div>
        </div>

        {error && <StatusBanner tone="danger">{error}</StatusBanner>}

        <button 
          type="submit" 
          disabled={loading} 
          className="btn-primary w-full py-4 rounded-xl shadow-[0_10px_20px_rgba(255,63,108,0.2)]"
        >
          {loading ? "AUTHENTICATING..." : "SIGN IN"}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-gray-100 text-center">
         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">New to Badshah?</p>
         <Link to="/signup" className="group flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-black hover:text-[var(--color-primary)] transition-all">
            Create an Account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
         </Link>
      </div>
    </div>
  );
}

export default Login;
