import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Coffee, TrendingUp, Package, Users, Lock, FolderOpen, CreditCard, Settings, Database } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';
import { addOnCategories } from '../data/menuData';
import { useMenu } from '../hooks/useMenu';
import { useCategories, Category } from '../hooks/useCategories';
import ImageUpload from './ImageUpload';
import CategoryManager from './CategoryManager';
import PaymentMethodManager from './PaymentMethodManager';
import SiteSettingsManager from './SiteSettingsManager';
import { initializeDatabase } from '../utils/initializeDatabase';

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('teamax_admin_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { menuItems, loading, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const { categories } = useCategories();
  const [currentView, setCurrentView] = useState<'dashboard' | 'items' | 'add' | 'edit' | 'categories' | 'payments' | 'settings'>('dashboard');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    basePrice: 0,
    category: 'hot-coffee',
    popular: false,
    available: true,
    variations: [],
    addOns: []
  });

  const handleAddItem = () => {
    setCurrentView('add');
    const defaultCategory = categories.length > 0 ? categories[0].id : 'milk-tea';
    setFormData({
      name: '',
      description: '',
      basePrice: 0,
      category: defaultCategory,
      popular: false,
      available: true,
      variations: [],
      addOns: []
    });
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setCurrentView('edit');
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        setIsProcessing(true);
        await deleteMenuItem(id);
      } catch (error) {
        alert('Failed to delete item. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.description || !formData.basePrice) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
      } else {
        await addMenuItem(formData as Omit<MenuItem, 'id'>);
      }
      setCurrentView('items');
      setEditingItem(null);
    } catch (error) {
      alert('Failed to save item');
    }
  };

  const handleCancel = () => {
    setCurrentView(currentView === 'add' || currentView === 'edit' ? 'items' : 'dashboard');
    setEditingItem(null);
    setSelectedItems([]);
  };

  const handleBulkRemove = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to delete');
      return;
    }

    const itemNames = selectedItems.map(id => {
      const item = menuItems.find(i => i.id === id);
      return item ? item.name : 'Unknown Item';
    }).slice(0, 5); // Show first 5 items

    const displayNames = itemNames.join(', ');
    const moreItems = selectedItems.length > 5 ? ` and ${selectedItems.length - 5} more items` : '';

    if (confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?\n\nItems to delete: ${displayNames}${moreItems}\n\nThis action cannot be undone.`)) {
      try {
        setIsProcessing(true);
        // Delete items one by one
        for (const itemId of selectedItems) {
          await deleteMenuItem(itemId);
        }
        setSelectedItems([]);
        setShowBulkActions(false);
        alert(`Successfully deleted ${selectedItems.length} item(s).`);
      } catch (error) {
        alert('Failed to delete some items. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };
  const handleBulkCategoryChange = async (newCategoryId: string) => {
    if (selectedItems.length === 0) {
      alert('Please select items to update');
      return;
    }

    const categoryName = categories.find(cat => cat.id === newCategoryId)?.name;
    if (confirm(`Are you sure you want to change the category of ${selectedItems.length} item(s) to "${categoryName}"?`)) {
      try {
        setIsProcessing(true);
        // Update category for each selected item
        for (const itemId of selectedItems) {
          const item = menuItems.find(i => i.id === itemId);
          if (item) {
            await updateMenuItem(itemId, { ...item, category: newCategoryId });
          }
        }
        setSelectedItems([]);
        setShowBulkActions(false);
        alert(`Successfully updated category for ${selectedItems.length} item(s)`);
      } catch (error) {
        alert('Failed to update some items');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === menuItems.length) {
      setSelectedItems([]);
      setShowBulkActions(false);
    } else {
      setSelectedItems(menuItems.map(item => item.id));
      setShowBulkActions(true);
    }
  };

  // Update bulk actions visibility when selection changes
  React.useEffect(() => {
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems]);

  const addVariation = () => {
    const newVariation: Variation = {
      id: `var-${Date.now()}`,
      name: '',
      price: 0
    };
    setFormData({
      ...formData,
      variations: [...(formData.variations || []), newVariation]
    });
  };

  const updateVariation = (index: number, field: keyof Variation, value: string | number) => {
    const updatedVariations = [...(formData.variations || [])];
    updatedVariations[index] = { ...updatedVariations[index], [field]: value };
    setFormData({ ...formData, variations: updatedVariations });
  };

  const removeVariation = (index: number) => {
    const updatedVariations = formData.variations?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, variations: updatedVariations });
  };

  const addAddOn = () => {
    const newAddOn: AddOn = {
      id: `addon-${Date.now()}`,
      name: '',
      price: 0,
      category: 'extras'
    };
    setFormData({
      ...formData,
      addOns: [...(formData.addOns || []), newAddOn]
    });
  };

  const updateAddOn = (index: number, field: keyof AddOn, value: string | number) => {
    const updatedAddOns = [...(formData.addOns || [])];
    updatedAddOns[index] = { ...updatedAddOns[index], [field]: value };
    setFormData({ ...formData, addOns: updatedAddOns });
  };

  const removeAddOn = (index: number) => {
    const updatedAddOns = formData.addOns?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, addOns: updatedAddOns });
  };

  // Dashboard Stats
  const totalItems = menuItems.length;
  const popularItems = menuItems.filter(item => item.popular).length;
  const availableItems = menuItems.filter(item => item.available).length;
  const categoryCounts = categories.map(cat => ({
    ...cat,
    count: menuItems.filter(item => item.category === cat.id).length
  }));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'TeaMax@Admin!2025') {
      setIsAuthenticated(true);
      localStorage.setItem('teamax_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('teamax_admin_auth');
    setPassword('');
    setCurrentView('dashboard');
  };

  const handleInitializeDatabase = async () => {
    if (confirm('This will add sample menu items to your database. Continue?')) {
      setIsProcessing(true);
      try {
        const result = await initializeDatabase();
        if (result.success) {
          alert('✅ ' + result.message + '\n\nPlease refresh the page to see the new items.');
          window.location.reload();
        } else {
          alert('❌ Failed to initialize database: ' + result.message);
        }
      } catch (error) {
        alert('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-teamax-dark flex items-center justify-center">
        <div className="bg-teamax-surface rounded-3xl shadow-2xl p-8 w-full max-w-md border border-teamax-border">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-white border border-black rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-black">Admin Access</h1>
            <p className="text-black mt-2">Enter password to access the admin dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-xs font-bold text-black uppercase tracking-widest mb-2 px-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-teamax-border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                placeholder="Enter admin password"
                required
              />
              {loginError && (
                <p className="text-red-500 text-sm mt-2">{loginError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black border border-black py-4 rounded-xl hover:brightness-110 transition-all font-bold uppercase tracking-widest text-xs shadow-lg shadow-black/20"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-teamax-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-serif">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Form View (Add/Edit)
  if (currentView === 'add' || currentView === 'edit') {
    return (
      <div className="min-h-screen bg-teamax-dark">
        <div className="bg-white shadow-sm border-b border-teamax-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 text-black hover:text-black transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Back</span>
                </button>
                <h1 className="text-xl font-serif font-bold text-black">
                  {currentView === 'add' ? 'Add New Item' : 'Edit Item'}
                </h1>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2 border border-teamax-border rounded-xl hover:bg-teamax-surface transition-colors duration-200 flex items-center space-x-2 font-bold uppercase tracking-widest text-[10px] text-black"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveItem}
                  className="px-5 py-2 bg-white text-black border border-black rounded-xl hover:brightness-110 transition-colors duration-200 flex items-center space-x-2 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-black/20"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Item</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Item Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Base Price *</label>
                <input
                  type="number"
                  value={formData.basePrice || ''}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Category *</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.popular || false}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-black">Mark as Popular</span>
                </label>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.available ?? true}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-black">Available for Order</span>
                </label>
              </div>
            </div>

            {/* Discount Pricing Section */}
            <div className="mb-8">
              <h3 className="text-lg font-playfair font-medium text-black mb-4">Discount Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Discount Price</label>
                  <input
                    type="number"
                    value={formData.discountPrice || ''}
                    onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) || undefined })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Enter discount price"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.discountActive || false}
                      onChange={(e) => setFormData({ ...formData, discountActive: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-black">Enable Discount</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Discount Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.discountStartDate || ''}
                    onChange={(e) => setFormData({ ...formData, discountStartDate: e.target.value || undefined })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Discount End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.discountEndDate || ''}
                    onChange={(e) => setFormData({ ...formData, discountEndDate: e.target.value || undefined })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
              <p className="text-sm text-black mt-2">
                Leave dates empty for indefinite discount period. Discount will only be active if "Enable Discount" is checked and current time is within the date range.
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-black mb-2">Description *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter item description"
                rows={3}
              />
            </div>

            <div className="mb-8">
              <ImageUpload
                currentImage={formData.image}
                onImageChange={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
              />
            </div>

            {/* Variations Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-playfair font-medium text-black">Size Variations</h3>
                <button
                  onClick={addVariation}
                  className="flex items-center space-x-2 px-3 py-2 bg-cream-100 text-black rounded-lg hover:bg-cream-200 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Variation</span>
                </button>
              </div>

              {formData.variations?.map((variation, index) => (
                <div key={variation.id} className="flex items-center space-x-3 mb-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={variation.name}
                    onChange={(e) => updateVariation(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Variation name (e.g., Small, Medium, Large)"
                  />
                  <input
                    type="number"
                    value={variation.price}
                    onChange={(e) => updateVariation(index, 'price', Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Price"
                  />
                  <button
                    onClick={() => removeVariation(index)}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add-ons Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-playfair font-medium text-black">Add-ons</h3>
                <button
                  onClick={addAddOn}
                  className="flex items-center space-x-2 px-3 py-2 bg-cream-100 text-black rounded-lg hover:bg-cream-200 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Add-on</span>
                </button>
              </div>

              {formData.addOns?.map((addOn, index) => (
                <div key={addOn.id} className="flex items-center space-x-3 mb-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={addOn.name}
                    onChange={(e) => updateAddOn(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Add-on name"
                  />
                  <select
                    value={addOn.category}
                    onChange={(e) => updateAddOn(index, 'category', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {addOnCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={addOn.price}
                    onChange={(e) => updateAddOn(index, 'price', Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Price"
                  />
                  <button
                    onClick={() => removeAddOn(index)}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Items List View
  if (currentView === 'items') {
    return (
      <div className="min-h-screen bg-teamax-dark">
        <div className="bg-white shadow-sm border-b border-teamax-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center space-x-2 text-black hover:text-black transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Dashboard</span>
                </button>
                <h1 className="text-xl font-serif font-bold text-black">Menu Items</h1>
              </div>
              <div className="flex items-center space-x-3">
                {showBulkActions && (
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black">
                      {selectedItems.length} selected
                    </span>
                    <button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="px-4 py-2 bg-black/5 text-black rounded-xl hover:bg-black hover:text-black transition-all duration-200 font-bold uppercase tracking-widest text-[10px]"
                    >
                      Bulk Actions
                    </button>
                  </div>
                )}
                <button
                  onClick={handleAddItem}
                  className="flex items-center space-x-2 bg-white text-black border border-black px-5 py-2 rounded-xl hover:brightness-110 transition-all font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-black/20"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Item</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Bulk Actions Panel */}
          {showBulkActions && selectedItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-blue-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-black mb-1">Bulk Actions</h3>
                  <p className="text-sm text-black">{selectedItems.length} item(s) selected</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Change Category */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-black">Change Category:</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkCategoryChange(e.target.value);
                          e.target.value = ''; // Reset selection
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      disabled={isProcessing}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Remove Items */}
                  <button
                    onClick={handleBulkRemove}
                    disabled={isProcessing}
                    className="flex items-center space-x-2 bg-red-600 text-black px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{isProcessing ? 'Removing...' : 'Remove Selected'}</span>
                  </button>

                  {/* Clear Selection */}
                  <button
                    onClick={() => {
                      setSelectedItems([]);
                      setShowBulkActions(false);
                    }}
                    className="flex items-center space-x-2 bg-gray-500 text-black px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear Selection</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Bulk Actions Bar */}
            {menuItems.length > 0 && (
              <div className="bg-gray-50 border-b border-gray-300 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === menuItems.length && menuItems.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-black">
                        Select All ({menuItems.length} items)
                      </span>
                    </label>
                  </div>
                  {selectedItems.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-black">
                        {selectedItems.length} item(s) selected
                      </span>
                      <button
                        onClick={() => setSelectedItems([])}
                        className="text-sm text-black hover:text-black transition-colors duration-200"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black">
                      Select
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black">Variations</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black">Add-ons</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-black">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-black">{item.name}</div>
                          <div className="text-sm text-black truncate max-w-xs">{item.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-black">
                        {categories.find(cat => cat.id === item.category)?.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-black">
                        <div className="flex flex-col">
                          {item.isOnDiscount && item.discountPrice ? (
                            <>
                              <span className="text-red-600 font-semibold">₱{item.discountPrice}</span>
                              <span className="text-black line-through text-xs">₱{item.basePrice}</span>
                            </>
                          ) : (
                            <span>₱{item.basePrice}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-black">
                        {item.variations?.length || 0} variations
                      </td>
                      <td className="px-6 py-4 text-sm text-black">
                        {item.addOns?.length || 0} add-ons
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {item.popular && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-black">
                              Popular
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.available
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {item.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            disabled={isProcessing}
                            className="p-2 text-black hover:text-black hover:bg-gray-100 rounded transition-colors duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={isProcessing}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {menuItems.map((item) => (
                <div key={item.id} className={`p-4 border-b border-gray-300 last:border-b-0 ${selectedItems.includes(item.id) ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-black">Select</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        disabled={isProcessing}
                        className="p-2 text-black hover:text-black hover:bg-gray-100 rounded transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={isProcessing}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-black truncate">{item.name}</h3>
                      <p className="text-sm text-black mt-1 line-clamp-2">{item.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-black">Category:</span>
                      <span className="ml-1 text-black">
                        {categories.find(cat => cat.id === item.category)?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-black">Price:</span>
                      <span className="ml-1 font-medium text-black">
                        {item.isOnDiscount && item.discountPrice ? (
                          <span className="text-red-600">₱{item.discountPrice}</span>
                        ) : (
                          `₱${item.basePrice}`
                        )}
                        {item.isOnDiscount && item.discountPrice && (
                          <span className="text-black line-through text-xs ml-1">₱{item.basePrice}</span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-black">Variations:</span>
                      <span className="ml-1 text-black">{item.variations?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-black">Add-ons:</span>
                      <span className="ml-1 text-black">{item.addOns?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      {item.popular && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-black">
                          Popular
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Categories View
  if (currentView === 'categories') {
    return <CategoryManager onBack={() => setCurrentView('dashboard')} />;
  }

  // Payment Methods View
  if (currentView === 'payments') {
    return <PaymentMethodManager onBack={() => setCurrentView('dashboard')} />;
  }

  // Site Settings View
  if (currentView === 'settings') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center space-x-2 text-black hover:text-black transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>
                <h1 className="text-2xl font-playfair font-semibold text-black">Site Settings</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <SiteSettingsManager />
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-teamax-dark">
      <div className="bg-white shadow-sm border-b border-teamax-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-white border border-black rounded-xl">
                <Coffee className="h-6 w-6 text-black" />
              </div>
              <h1 className="text-xl font-serif font-bold text-black">WebNegosyo Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="/"
                className="text-[10px] font-bold uppercase tracking-widest text-black hover:text-black transition-colors duration-200"
              >
                View Website
              </a>
              <button
                onClick={handleLogout}
                className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-teamax-border">
            <div className="flex items-center">
              <div className="p-3 bg-black/5 rounded-xl">
                <Package className="h-6 w-6 text-black" />
              </div>
              <div className="ml-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black">Total Items</p>
                <p className="text-2xl font-bold text-black">{totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-teamax-border">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black">Available</p>
                <p className="text-2xl font-bold text-black">{availableItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-teamax-border">
            <div className="flex items-center">
              <div className="p-3 bg-orange-50 rounded-xl">
                <Coffee className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black">Popular</p>
                <p className="text-2xl font-bold text-black">{popularItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-teamax-border">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black">Status</p>
                <p className="text-2xl font-bold text-black">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white rounded-3xl shadow-sm p-8 border border-teamax-border">
            <h3 className="text-lg font-serif font-bold text-black mb-8 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-black rounded-full"></div>
              Quick Management
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleAddItem}
                className="group flex items-center gap-4 p-5 text-left border border-teamax-border rounded-2xl hover:border-black hover:bg-black/5 transition-all duration-300"
              >
                <div className="p-3 bg-black/5 rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <span className="block font-bold text-black text-sm group-hover:text-black transition-colors">Add New Item</span>
                  <span className="text-[10px] text-black uppercase tracking-widest opacity-60">Create Menu Entry</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('items')}
                className="group flex items-center gap-4 p-5 text-left border border-teamax-border rounded-2xl hover:border-black hover:bg-black/5 transition-all duration-300"
              >
                <div className="p-3 bg-black/5 rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <span className="block font-bold text-black text-sm group-hover:text-black transition-colors">Manage Menu</span>
                  <span className="text-[10px] text-black uppercase tracking-widest opacity-60">Edit & Update All</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('categories')}
                className="group flex items-center gap-4 p-5 text-left border border-teamax-border rounded-2xl hover:border-black hover:bg-black/5 transition-all duration-300"
              >
                <div className="p-3 bg-black/5 rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div>
                  <span className="block font-bold text-black text-sm group-hover:text-black transition-colors">Categories</span>
                  <span className="text-[10px] text-black uppercase tracking-widest opacity-60">Organize Menu</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('payments')}
                className="group flex items-center gap-4 p-5 text-left border border-teamax-border rounded-2xl hover:border-black hover:bg-black/5 transition-all duration-300"
              >
                <div className="p-3 bg-black/5 rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <span className="block font-bold text-black text-sm group-hover:text-black transition-colors">Payments</span>
                  <span className="text-[10px] text-black uppercase tracking-widest opacity-60">Payout Methods</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('settings')}
                className="group flex items-center gap-4 p-5 text-left border border-teamax-border rounded-2xl hover:border-black hover:bg-black/5 transition-all duration-300 sm:col-span-2"
              >
                <div className="p-3 bg-black/5 rounded-xl group-hover:bg-black group-hover:text-white transition-all">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <span className="block font-bold text-black text-sm group-hover:text-black transition-colors">System Settings</span>
                  <span className="text-[10px] text-black uppercase tracking-widest opacity-60">Store & UI Configuration</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm p-8 border border-teamax-border">
            <h3 className="text-lg font-serif font-bold text-black mb-8 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-black rounded-full"></div>
              Categories
            </h3>
            <div className="space-y-4">
              {categoryCounts.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 bg-teamax-surface rounded-2xl border border-teamax-border/50">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl bg-white p-2 rounded-xl shadow-sm border border-teamax-border/30">{category.icon}</span>
                    <span className="font-bold text-black text-sm">{category.name}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black bg-white px-2 py-1 rounded-lg border border-teamax-border/30">
                    {category.count} items
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
