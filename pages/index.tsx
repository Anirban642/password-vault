import type { NextPage } from 'next';
import Head from 'next/head';
import PasswordGenerator from '../components/PasswordGenerator';
import VaultForm from '../components/VaultForm';
import VaultList from '../components/VaultList';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Home: NextPage = () => {
  const { token, login, signup, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [refreshVault, setRefreshVault] = useState(0);
  const [generatedPassword, setGeneratedPassword] = useState(''); // New state

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(email, password);
      await login(email, password);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    setEmail('');
    setPassword('');
    setError('');
    setGeneratedPassword(''); // Clear generated password on logout
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Password Vault</title>
        <meta name="description" content="A simple password generator and vault" />
      </Head>
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Password Vault</h1>
        {token && (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        )}
      </header>
      <main>
        {token ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <PasswordGenerator
                key="password-generator"
                onGenerate={setGeneratedPassword}
              />
              <VaultForm
                onAdd={() => setRefreshVault(prev => prev + 1)}
                generatedPassword={generatedPassword}
              />
            </div>
            <VaultList key="vault-list" refreshVault={refreshVault} />
          </div>
        ) : (
          <div className="max-w-md mx-auto p-4 border border-gray-300 rounded-md">
            <h2 className="text-xl font-bold mb-4">Login / Signup</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form className="mb-4" onSubmit={handleSignup}>
              <h3 className="text-lg font-semibold mb-2">Signup</h3>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-2 mb-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-2 mb-2 border border-gray-300 rounded-md"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded-md"
              >
                Signup
              </button>
            </form>
            <form onSubmit={handleLogin}>
              <h3 className="text-lg font-semibold mb-2">Login</h3>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-2 mb-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-2 mb-2 border border-gray-300 rounded-md"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded-md"
              >
                Login
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;