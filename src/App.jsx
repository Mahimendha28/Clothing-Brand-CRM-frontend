import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { logout, setCredentials, syncStoredAuth } from "./features/auth/authSlice";
import AppRoutes from "./routes/AppRoutes";
import { getCurrentUser } from "./services/authService";
import { getStoredToken } from "./utils/auth";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    let ignore = false;

    const initializeAuth = async () => {
      dispatch(syncStoredAuth());

      const token = getStoredToken();

      if (!token) {
        return;
      }

      try {
        const response = await getCurrentUser();

        if (!ignore && response.user) {
          dispatch(
            setCredentials({
              token,
              user: response.user
            })
          );
        }
      } catch (apiError) {
        if (!ignore && (apiError.status === 401 || apiError.status === 403)) {
          dispatch(logout());
        }
      }
    };

    initializeAuth();

    return () => {
      ignore = true;
    };
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;
