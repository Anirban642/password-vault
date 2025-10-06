import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CryptoJS from 'crypto-js';
import VaultForm from './VaultForm';

interface VaultItem {
  _id: string;
  encryptedData: string;
  createdAt: string;
}

interface DecryptedItem {
  _id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  createdAt: string;
}

interface VaultListProps {
  refreshVault: number;
}

const VaultList: React.FC<VaultListProps> = ({ refreshVault }) => {
  const { token } = useAuth();
  const [vaultItems, setVaultItems] = useState<DecryptedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DecryptedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('title-asc');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string>('');
  const [editingItem, setEditingItem] = useState<DecryptedItem | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});

  const encryptionKey = 'vault-secret-key-123';

  useEffect(() => {
    if (!token) return;

    const fetchVaultItems = async () => {
      try {
        const response = await fetch('/api/vault/list', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
        const items: VaultItem[] = await response.json();
        const decryptedItems: DecryptedItem[] = [];
        for (const item of items) {
          try {
            const bytes = CryptoJS.AES.decrypt(item.encryptedData, encryptionKey);
            const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            // Ensure createdAt is a valid date string
            const createdAt = item.createdAt && !isNaN(new Date(item.createdAt).getTime())
              ? item.createdAt
              : new Date().toISOString(); // Fallback to current date if invalid
            decryptedItems.push({ ...decryptedData, _id: item._id, createdAt });
          } catch (err) {
            console.error(`Failed to decrypt item ${item._id}:`, err);
          }
        }
        setVaultItems(decryptedItems);
        setFilteredItems(decryptedItems);
        setError(decryptedItems.length === 0 && items.length > 0 ? 'Some items could not be decrypted' : '');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vault items';
        setError(errorMessage);
      }
    };

    fetchVaultItems();
  }, [token, refreshVault]);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = vaultItems.filter(
      item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.username.toLowerCase().includes(lowerQuery) ||
        item.url.toLowerCase().includes(lowerQuery)
    );

    filtered.sort((a, b) => {
      if (sortOption === 'title-asc') {
        return a.title.localeCompare(b.title);
      } else if (sortOption === 'title-desc') {
        return b.title.localeCompare(a.title);
      } else if (sortOption === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOption === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });

    setFilteredItems(filtered);
  }, [searchQuery, vaultItems, sortOption]);

  const copyToClipboard = (password: string, id: string) => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    }).catch(err => console.error('Copy failed:', err));
  };

  const handleDelete = async (id: string, title: string) => {
    if (!token) {
      setError('You must be logged in');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    try {
      const response = await fetch(`/api/vault/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      setVaultItems(vaultItems.filter(item => item._id !== id));
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vault item';
      setError(errorMessage);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Format date safely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
  };

  return (
    <div className="p-4 border border-gray-300 rounded-md">
      <h2 className="text-xl font-bold mb-4">Vault List</h2>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, username, or URL"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="title-asc">Title (A-Z)</option>
          <option value="title-desc">Title (Z-A)</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {filteredItems.length === 0 && !error && <p>No vault items match your search.</p>}
      {editingItem ? (
        <VaultForm
          onAdd={() => setEditingItem(null)}
          generatedPassword=""
          item={editingItem}
          onCancel={() => setEditingItem(null)}
        />
      ) : (
        <div className="space-y-4">
          {filteredItems.map(item => (
            <div key={item._id} className="p-2 border border-gray-200 rounded-md">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.title)}
                    className="bg-red-500 text-white px-2 py-1 rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {item.username && <p><strong>Username:</strong> {item.username}</p>}
              {item.password && (
                <p>
                  <strong>Password:</strong>{' '}
                  {showPasswords[item._id] ? item.password : '••••••••'}
                  <button
                    onClick={() => togglePasswordVisibility(item._id)}
                    className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-md"
                  >
                    {showPasswords[item._id] ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => copyToClipboard(item.password, item._id)}
                    className="ml-2 bg-green-500 text-white px-2 py-1 rounded-md"
                  >
                    {copied === item._id ? 'Copied!' : 'Copy'}
                  </button>
                </p>
              )}
              {item.url && (
                <p>
                  <strong>URL:</strong>{' '}
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    {item.url}
                  </a>
                </p>
              )}
              {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
              <p className="text-sm text-gray-500">
                <strong>Created:</strong> {formatDate(item.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VaultList;