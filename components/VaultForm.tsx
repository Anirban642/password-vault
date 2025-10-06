import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CryptoJS from 'crypto-js';

interface VaultFormProps {
  onAdd: () => void;
  generatedPassword: string;
  item?: {
    _id: string;
    title: string;
    username: string;
    password: string;
    url: string;
    notes: string;
  };
  onCancel?: () => void;
}

const VaultForm: React.FC<VaultFormProps> = ({ onAdd, generatedPassword, item, onCancel }) => {
  const { token } = useAuth();
  const [title, setTitle] = useState(item?.title || '');
  const [username, setUsername] = useState(item?.username || '');
  const [password, setPassword] = useState(item?.password || '');
  const [url, setUrl] = useState(item?.url || '');
  const [notes, setNotes] = useState(item?.notes || '');
  const [errors, setErrors] = useState<{ title?: string; url?: string; server?: string }>({});

  useEffect(() => {
    setPassword(generatedPassword || item?.password || '');
  }, [generatedPassword, item]);

  const encryptionKey = 'vault-secret-key-123';

  const validateInputs = useCallback(() => {
    const newErrors: { title?: string; url?: string } = {};

    // Title validation: required, max 50 characters
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 50) {
      newErrors.title = 'Title must be 50 characters or less';
    }

    // URL validation: must be a valid URL if provided
    if (url) {
      try {
        new URL(url);
        if (!url.match(/^(https?:\/\/)/)) {
          newErrors.url = 'URL must start with http:// or https://';
        }
      } catch {
        newErrors.url = 'Invalid URL format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrors({ ...errors, server: 'You must be logged in' });
      return;
    }

    if (!validateInputs()) {
      return;
    }

    try {
      const vaultItem = { title, username, password, url, notes };
      const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(vaultItem), encryptionKey).toString();
      const apiUrl = item ? `/api/vault/edit/${item._id}` : '/api/vault/add';
      const method = item ? 'PUT' : 'POST';

      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ encryptedData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      setTitle('');
      setUsername('');
      setPassword('');
      setUrl('');
      setNotes('');
      setErrors({});
      onAdd();
      if (item && onCancel) onCancel();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${item ? 'update' : 'save'} vault item`;
      setErrors({ ...errors, server: errorMessage });
    }
  };

  // Real-time validation on input change
  useEffect(() => {
    validateInputs();
  }, [validateInputs]);

  return (
    <div className="p-4 border border-gray-300 rounded-md">
      <h2 className="text-xl font-bold mb-4">{item ? 'Edit Vault Item' : 'Add Vault Item'}</h2>
      {errors.server && <p className="text-red-500 mb-4">{errors.server}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            required
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>
        <div className="mb-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL"
            className={`w-full p-2 border rounded-md ${errors.url ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
        </div>
        <div className="mb-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="w-full cursor-pointer bg-blue-500 text-white p-2 rounded-md"
            disabled={!!errors.title || !!errors.url}
          >
            {item ? 'Update' : 'Save to Vault'}
          </button>
          {item && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-gray-500 text-white p-2 rounded-md"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default VaultForm;