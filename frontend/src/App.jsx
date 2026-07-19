import { AuthProvider } from './context/AuthContext';
import Login from './features/auth/Login';

function App() {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  )
}

export default App;