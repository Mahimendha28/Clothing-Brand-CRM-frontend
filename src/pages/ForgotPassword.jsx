import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";

import StatusBanner from "../components/common/StatusBanner";
import { requestPasswordReset } from "../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await requestPasswordReset({ email });
      setSuccessMessage(response.message || "If an account exists, a reset link has been sent.");
    } catch (apiError) {
      setError(apiError.message || "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10">
         <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Reset Password</h2>
         <p className="text-gray-400 text-sm font-medium tracking-wide">
            Enter your email address and we'll send you a link to reset your password.
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
           </div>
        </div>

        {error && <StatusBanner tone="danger">{error}</StatusBanner>}
        {successMessage && <StatusBanner tone="success">{successMessage}</StatusBanner>}

        <button 
          type="submit" 
          disabled={loading} 
          className="btn-primary w-full py-4 rounded-xl shadow-[0_10px_20px_rgba(255,63,108,0.2)]"
        >
          {loading ? "SENDING LINK..." : "SEND RESET LINK"}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-gray-100 text-center">
         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Remembered password?</p>
         <Link to="/login" className="group flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-black hover:text-[var(--color-primary)] transition-all">
            Back to Login
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
         </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
