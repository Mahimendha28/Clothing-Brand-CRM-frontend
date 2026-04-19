import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, User, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

import PasswordToggleButton from "../components/PasswordToggleButton";
import StatusBanner from "../components/common/StatusBanner";
import { setCredentials } from "../features/auth/authSlice";
import { loginUser, registerUser } from "../services/authService";
import { getDefaultRouteForRole } from "../utils/redirect";

function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      const loginResponse = await loginUser({
        email: formData.email,
        password: formData.password
      });

      dispatch(setCredentials({ token: loginResponse.token, user: loginResponse.user }));
      navigate(getDefaultRouteForRole(loginResponse.user.role));
    } catch (apiError) {
      setError(apiError.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10">
         <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Create Account</h2>
         <p className="text-gray-400 text-sm font-medium tracking-wide">
            Join the community for early access to drops and exclusive offers.
         </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1">
           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Full Name</label>
           <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
                 <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                placeholder="FIRST LAST"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all"
                value={formData.name}
                onChange={handleChange}
                required
              />
           </div>
        </div>

        <div className="space-y-1">
           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Email Address</label>
           <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
                 <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="EMAIL @ EXAMPLE.COM"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all"
                value={formData.email}
                onChange={handleChange}
                required
              />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Password</label>
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

           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Confirm</label>
              <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors">
                    <Lock className="w-4 h-4" />
                 </div>
                 <input
                   type={showPassword ? "text" : "password"}
                   name="confirmPassword"
                   placeholder="••••••••"
                   className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all"
                   value={formData.confirmPassword}
                   onChange={handleChange}
                   required
                 />
              </div>
           </div>
        </div>

        {error && <StatusBanner tone="danger">{error}</StatusBanner>}

        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
           By creating an account, you agree to our <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
        </p>

        <button 
          type="submit" 
          disabled={loading} 
          className="btn-primary w-full py-4 rounded-xl shadow-[0_10px_20px_rgba(255,63,108,0.2)]"
        >
          {loading ? "CREATING ACCOUNT..." : "JOIN THE TRIBE"}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-gray-100 text-center">
         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Already a member?</p>
         <Link to="/login" className="group flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-black hover:text-[var(--color-primary)] transition-all">
            Login to Profile
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
         </Link>
      </div>
    </div>
  );
}

export default Signup;
