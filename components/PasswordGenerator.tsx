import React, { useState } from 'react';

interface PasswordGeneratorProps {
  onGenerate: (password: string) => void;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onGenerate }) => {
  const [length, setLength] = useState<number>(12);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeLookAlikes, setExcludeLookAlikes] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Calculate password strength
  const getPasswordStrength = (pwd: string): { label: string; color: string } => {
    if (!pwd) return { label: '', color: '' };
    let score = 0;
    if (pwd.length >= 12) score += 2;
    else if (pwd.length >= 8) score += 1;
    if (includeNumbers) score += 1;
    if (includeSymbols) score += 1;
    if (excludeLookAlikes) score += 0.5;

    if (score >= 4) return { label: 'Strong', color: 'text-green-500' };
    if (score >= 2.5) return { label: 'Medium', color: 'text-yellow-500' };
    return { label: 'Weak', color: 'text-red-500' };
  };

  const strength = getPasswordStrength(password);

  const generatePassword = () => {
    let charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeLookAlikes) {
      charset = charset.replace(/[1lIoO0]/g, '');
    }

    let generated = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      generated += charset[randomIndex];
    }
    setPassword(generated);
    setCopied(false);
    onGenerate(generated);
  };

  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password).then(() => {
        setCopied(true);
        setTimeout(() => {
          navigator.clipboard.writeText('').catch(() => console.log('Clipboard clear failed'));
          setCopied(false);
        }, 15000);
      }).catch(err => console.error('Copy failed:', err));
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-md">
      <h2 className="text-xl font-bold mb-4">Password Generator</h2>
      <div className="mb-4">
        <label className="block mb-2">Length: {length}</label>
        <input
          type="range"
          min="8"
          max="32"
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={(e) => setIncludeNumbers(e.target.checked)}
            className="mr-2"
          />
          Include Numbers
        </label>
      </div>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={(e) => setIncludeSymbols(e.target.checked)}
            className="mr-2"
          />
          Include Symbols
        </label>
      </div>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={excludeLookAlikes}
            onChange={(e) => setExcludeLookAlikes(e.target.checked)}
            className="mr-2"
          />
          Exclude Look-Alikes (e.g., 1, l, I, 0, O)
        </label>
      </div>
      <button
        onClick={generatePassword}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
      >
        Generate Password
      </button>
      {password && (
        <div className="flex items-center p-2 bg-gray-100 border border-gray-300 rounded-md">
          <strong className="mr-2">Generated Password:</strong> {password}
          <span className={`ml-2 ${strength.color}`}>
            {strength.label && `(${strength.label})`}
          </span>
          <button
            onClick={copyToClipboard}
            className="ml-auto bg-green-500 text-white px-2 py-1 rounded-md"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PasswordGenerator;