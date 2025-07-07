import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Filter, ArrowRight, Settings, Download, LogOut } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

// Firebase configuration - Replace with your own config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth Component
const AuthComponent = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login to Your Financial App' : 'Create Account'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 hover:text-blue-700"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

// Move ItemCard outside of FinancialApp
const ItemCard = React.memo(({ 
  item, 
  isPrimary = true, 
  showSort = false, 
  onSort, 
  onEdit, 
  onDelete,
  onDeleteUnsorted,
  calculateSplitPrice,
  calculateSecondaryPercentage,
  formatCurrency,
  formatDate 
}) => {
  const splitPrice = isPrimary 
    ? calculateSplitPrice(item.fullPrice, item.categoryMatch)
    : calculateSplitPrice(item.fullPrice, calculateSecondaryPercentage(item.categoryMatch));
  
  const percentage = isPrimary 
    ? item.categoryMatch 
    : calculateSecondaryPercentage(item.categoryMatch);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-3 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            {item.name}
            {item.isRecurring && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Recurring</span>
            )}
          </h3>
          <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
        </div>
        <div className="flex gap-2">
          {showSort && (
            <button
              onClick={() => onSort(item)}
              className="text-green-500 hover:text-green-700 flex items-center gap-1"
            >
              <ArrowRight size={16} />
              Sort
            </button>
          )}
          {!showSort && isPrimary && (
            <>
              <button
                onClick={() => onEdit(item)}
                className="text-blue-500 hover:text-blue-700"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          {showSort && (
            <button
              onClick={() => onDeleteUnsorted(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      
      {!showSort ? (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Category Match:</span>
            <div className="font-medium">{percentage}%</div>
          </div>
          
          <div>
            <span className="text-gray-600">Secondary Category:</span>
            <div className="font-medium">
              {isPrimary && item.secondaryCategory 
                ? `${calculateSecondaryPercentage(item.categoryMatch)}% ${item.secondaryCategory}`
                : !isPrimary && item.primaryCategory
                ? `${item.categoryMatch}% ${item.primaryCategory}`
                : 'None'}
            </div>
          </div>
          
          <div>
            <span className="text-gray-600">Split Price:</span>
            <div className="font-medium text-green-600">
              {formatCurrency(splitPrice)}
              <span className="text-xs text-gray-500 ml-1">
                ({formatCurrency(item.fullPrice - splitPrice)} in {isPrimary ? item.secondaryCategory : item.primaryCategory})
              </span>
            </div>
          </div>
          
          <div>
            <span className="text-gray-600">Full Price:</span>
            <div className="font-medium">{formatCurrency(item.fullPrice)}</div>
          </div>
        </div>
      ) : (
        <div className="text-sm">
          <div className="font-medium text-green-600">{formatCurrency(item.fullPrice)}</div>
        </div>
      )}
    </div>
  );
});

// Move Dashboard outside of FinancialApp
const Dashboard = React.memo(({ 
  monthlyBudget, 
  setMonthlyBudget, 
  showBudgetSettings, 
  setShowBudgetSettings,
  getMonthlyTotal,
  getRemainingBudget,
  getRemainingAfterRecurring,
  getRecurringTotal,
  getCategoryTotal,
  categories,
  filterItemsByDate,
  items,
  formatCurrency,
  filterMode,
  selectedPeriod,
  salaryPeriods,
  dateFilter,
  onExport,
  onLogout
}) => {
  const getCurrentPeriodName = () => {
    if (filterMode === 'month' && dateFilter) {
      const date = new Date(dateFilter);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }
    if (filterMode === 'period' && selectedPeriod) {
      const period = salaryPeriods.find(p => p.id === selectedPeriod);
      return period ? period.name : 'All time';
    }
    return 'All time';
  };

  return (
    <div className="space-y-6">
      {/* Budget Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Monthly Budget</h2>
          <div className="flex gap-2">
            <button
              onClick={onExport}
              className="text-green-500 hover:text-green-700"
              title="Export to CSV"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => setShowBudgetSettings(!showBudgetSettings)}
              className="text-blue-500 hover:text-blue-700"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={onLogout}
              className="text-red-500 hover:text-red-700"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">Viewing: {getCurrentPeriodName()}</p>
        
        {showBudgetSettings && (
          <div className="mb-4">
            <input
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Monthly budget in HUF"
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Monthly Budget</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(parseFloat(monthlyBudget) || 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(getMonthlyTotal())}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Remaining</p>
            <p className={`text-2xl font-bold ${getRemainingBudget() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(getRemainingBudget())}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              After recurring: {formatCurrency(getRemainingAfterRecurring())}
            </p>
          </div>
        </div>
      </div>

      {/* Recurring Spending Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recurring Monthly Spending</h2>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Recurring</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(getRecurringTotal())}</p>
        </div>
      </div>

      {/* Category Totals */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Category Spending</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(category => (
            <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">{category}</span>
              <span className="font-bold text-green-600">{formatCurrency(getCategoryTotal(category))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Items</h2>
        <div className="space-y-2">
          {filterItemsByDate(items)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(item => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({item.primaryCategory})</span>
                </div>
                <span className="font-bold">{formatCurrency(item.fullPrice)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
});

// Move ItemBox outside of FinancialApp
const ItemBox = React.memo(({ 
  newUnsortedItem, 
  handleNewUnsortedItemChange, 
  addUnsortedItem,
  filterItemsByDate,
  unsortedItems,
  setSortingItem,
  categories,
  calculateSplitPrice,
  calculateSecondaryPercentage,
  formatCurrency,
  formatDate,
  deleteUnsortedItem
}) => (
  <div className="space-y-6">
    {/* Add Unsorted Item Form */}
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Plus size={20} />
        Add Item to Sort Later
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Name
          </label>
          <input
            type="text"
            value={newUnsortedItem.name}
            onChange={(e) => handleNewUnsortedItemChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter item name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Price (HUF)
          </label>
          <input
            type="number"
            value={newUnsortedItem.fullPrice}
            onChange={(e) => handleNewUnsortedItemChange('fullPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={newUnsortedItem.date}
            onChange={(e) => handleNewUnsortedItemChange('date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={newUnsortedItem.isRecurring}
            onChange={(e) => handleNewUnsortedItemChange('isRecurring', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Recurring Monthly Expense</span>
        </label>
      </div>

      {/* Optional Pre-sort Section */}
      <details className="mb-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
          Optional: Pre-sort details (can be set later)
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Category
            </label>
            <select
              value={newUnsortedItem.primaryCategory}
              onChange={(e) => handleNewUnsortedItemChange('primaryCategory', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose later</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Match (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={newUnsortedItem.categoryMatch}
              onChange={(e) => handleNewUnsortedItemChange('categoryMatch', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Category
            </label>
            <select
              value={newUnsortedItem.secondaryCategory}
              onChange={(e) => handleNewUnsortedItemChange('secondaryCategory', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {categories.filter(cat => cat !== newUnsortedItem.primaryCategory).map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </details>
      
      <button
        onClick={addUnsortedItem}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        {newUnsortedItem.primaryCategory ? `Add to ${newUnsortedItem.primaryCategory}` : 'Add to Item Box'}
      </button>
    </div>

    {/* Unsorted Items List */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Items to Sort ({unsortedItems.length})</h3>
      {filterItemsByDate(unsortedItems).map(item => (
        <ItemCard 
          key={item.id}
          item={item} 
          showSort={true}
          onSort={(item) => setSortingItem(item)}
          onDeleteUnsorted={deleteUnsortedItem}
          calculateSplitPrice={calculateSplitPrice}
          calculateSecondaryPercentage={calculateSecondaryPercentage}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      ))}
    </div>
  </div>
));

const FinancialApp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [items, setItems] = useState([]);
  const [unsortedItems, setUnsortedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [sortingItem, setSortingItem] = useState(null);
  const [monthlyBudget, setMonthlyBudget] = useState('500000');
  const [showBudgetSettings, setShowBudgetSettings] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [filterMode, setFilterMode] = useState('month'); // 'month' or 'period'
  const [salaryPeriods, setSalaryPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [showNewPeriodModal, setShowNewPeriodModal] = useState(false);
  const [newPeriodStart, setNewPeriodStart] = useState(new Date().toISOString().split('T')[0]);
  const [dataLoading, setDataLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    categoryMatch: '100',
    secondaryCategory: '',
    fullPrice: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false
  });
  const [newUnsortedItem, setNewUnsortedItem] = useState({
    name: '',
    fullPrice: '',
    date: new Date().toISOString().split('T')[0],
    categoryMatch: '100',
    secondaryCategory: '',
    primaryCategory: '',
    isRecurring: false
  });

  const categories = useMemo(() => [
    'Essential Maintenance',
    'Growth / Investment', 
    'Planned Social',
    'Impulse/Comfort'
  ], []);

  const tabs = useMemo(() => ['Dashboard', 'Item Box', 'Recurring Spendings', ...categories], [categories]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        loadUserData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user data from Firestore
  const loadUserData = async (userId) => {
    setDataLoading(true);
    try {
      // Load user settings
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setMonthlyBudget(userData.monthlyBudget || '500000');
      }

      // Load items
      const itemsQuery = query(collection(db, 'items'), where('userId', '==', userId));
      const itemsSnapshot = await getDocs(itemsQuery);
      const loadedItems = [];
      itemsSnapshot.forEach((doc) => {
        loadedItems.push({ id: doc.id, ...doc.data() });
      });
      setItems(loadedItems);

      // Load unsorted items
      const unsortedQuery = query(collection(db, 'unsortedItems'), where('userId', '==', userId));
      const unsortedSnapshot = await getDocs(unsortedQuery);
      const loadedUnsorted = [];
      unsortedSnapshot.forEach((doc) => {
        loadedUnsorted.push({ id: doc.id, ...doc.data() });
      });
      setUnsortedItems(loadedUnsorted);

      // Load salary periods
      const periodsQuery = query(collection(db, 'salaryPeriods'), where('userId', '==', userId));
      const periodsSnapshot = await getDocs(periodsQuery);
      const loadedPeriods = [];
      periodsSnapshot.forEach((doc) => {
        loadedPeriods.push({ id: doc.id, ...doc.data() });
      });
      setSalaryPeriods(loadedPeriods);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Save user settings
  useEffect(() => {
    if (user && monthlyBudget) {
      const saveSettings = async () => {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            monthlyBudget,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (error) {
          console.error('Error saving settings:', error);
        }
      };
      saveSettings();
    }
  }, [user, monthlyBudget]);

  // Calculate split price based on category match percentage
  const calculateSplitPrice = useCallback((fullPrice, categoryMatch) => {
    return (parseFloat(fullPrice) * parseFloat(categoryMatch)) / 100;
  }, []);

  // Calculate secondary percentage
  const calculateSecondaryPercentage = useCallback((categoryMatch) => {
    return 100 - parseFloat(categoryMatch);
  }, []);

  // Filter items by date
  const filterItemsByDate = useCallback((itemList) => {
    if (filterMode === 'month' && !dateFilter) return itemList;
    if (filterMode === 'period' && !selectedPeriod) return itemList;
    
    if (filterMode === 'month' && dateFilter) {
      const filterDate = new Date(dateFilter);
      const filterMonth = filterDate.getMonth();
      const filterYear = filterDate.getFullYear();
      
      return itemList.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === filterMonth && itemDate.getFullYear() === filterYear;
      });
    }
    
    if (filterMode === 'period' && selectedPeriod) {
      const period = salaryPeriods.find(p => p.id === selectedPeriod);
      if (!period) return itemList;
      
      return itemList.filter(item => {
        const itemDate = new Date(item.date);
        const periodStart = new Date(period.startDate);
        const periodEnd = period.endDate ? new Date(period.endDate) : new Date();
        return itemDate >= periodStart && itemDate <= periodEnd;
      });
    }
    
    return itemList;
  }, [dateFilter, filterMode, selectedPeriod, salaryPeriods]);

  // Get items for current category (including secondary matches)
  const getCategoryItems = useCallback((category) => {
    const filteredItems = filterItemsByDate(items);
    return filteredItems.filter(item => {
      if (item.primaryCategory === category) return true;
      if (item.secondaryCategory === category) return true;
      return false;
    });
  }, [items, filterItemsByDate]);

  // Calculate total for a category
  const getCategoryTotal = useCallback((category) => {
    const categoryItems = getCategoryItems(category);
    return categoryItems.reduce((total, item) => {
      if (item.primaryCategory === category) {
        return total + calculateSplitPrice(item.fullPrice, item.categoryMatch);
      } else if (item.secondaryCategory === category) {
        return total + calculateSplitPrice(item.fullPrice, calculateSecondaryPercentage(item.categoryMatch));
      }
      return total;
    }, 0);
  }, [getCategoryItems, calculateSplitPrice, calculateSecondaryPercentage]);

  // Calculate total spending this month
  const getMonthlyTotal = useCallback(() => {
    const filteredItems = filterItemsByDate(items);
    return filteredItems.reduce((total, item) => total + parseFloat(item.fullPrice), 0);
  }, [items, filterItemsByDate]);

  // Calculate remaining budget
  const getRemainingBudget = useCallback(() => {
    return parseFloat(monthlyBudget) - getMonthlyTotal();
  }, [monthlyBudget, getMonthlyTotal]);

  // Get recurring items
  const getRecurringItems = useCallback(() => {
    return items.filter(item => item.isRecurring);
  }, [items]);

  // Calculate total recurring spending
  const getRecurringTotal = useCallback(() => {
    const recurringItems = getRecurringItems();
    return recurringItems.reduce((total, item) => total + parseFloat(item.fullPrice), 0);
  }, [getRecurringItems]);

  // Calculate remaining budget after recurring expenses
  const getRemainingAfterRecurring = useCallback(() => {
    return parseFloat(monthlyBudget) - getMonthlyTotal() - getRecurringTotal();
  }, [monthlyBudget, getMonthlyTotal, getRecurringTotal]);

  // Create new salary period
  const createSalaryPeriod = useCallback(async () => {
    if (!newPeriodStart || !user) return;
    
    try {
      // Find the most recent period to set as end date for it
      const sortedPeriods = [...salaryPeriods].sort((a, b) => 
        new Date(b.startDate) - new Date(a.startDate)
      );
      
      const mostRecentPeriod = sortedPeriods[0];
      
      // If there's a most recent period, update its end date
      if (mostRecentPeriod && !mostRecentPeriod.endDate) {
        const dayBefore = new Date(newPeriodStart);
        dayBefore.setDate(dayBefore.getDate() - 1);
        
        await updateDoc(doc(db, 'salaryPeriods', mostRecentPeriod.id), {
          endDate: dayBefore.toISOString().split('T')[0]
        });
        
        setSalaryPeriods(prev => prev.map(period => 
          period.id === mostRecentPeriod.id 
            ? { ...period, endDate: dayBefore.toISOString().split('T')[0] }
            : period
        ));
      }
      
      // Create period name
      const startDate = new Date(newPeriodStart);
      const year = startDate.getFullYear();
      const startMonth = startDate.toLocaleDateString('en-US', { month: 'long' });
      const nextMonth = new Date(startDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const endMonth = nextMonth.toLocaleDateString('en-US', { month: 'long' });
      const periodName = `${year}. ${startMonth} - ${endMonth} period`;
      
      // Create new period in Firestore
      const newPeriodData = {
        userId: user.uid,
        name: periodName,
        startDate: newPeriodStart,
        endDate: null,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'salaryPeriods'), newPeriodData);
      const newPeriod = { id: docRef.id, ...newPeriodData };
      
      setSalaryPeriods(prev => [...prev, newPeriod]);
      setSelectedPeriod(docRef.id);
      setFilterMode('period');
      setShowNewPeriodModal(false);
      setNewPeriodStart(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error creating salary period:', error);
      alert('Failed to create period. Please try again.');
    }
  }, [newPeriodStart, salaryPeriods, user]);

  // Add new item to specific category
  const addItem = useCallback(async () => {
    if (newItem.name.trim() && parseFloat(newItem.fullPrice) > 0 && user) {
      try {
        const itemData = {
          userId: user.uid,
          name: newItem.name.trim(),
          primaryCategory: activeTab,
          categoryMatch: parseFloat(newItem.categoryMatch),
          secondaryCategory: newItem.secondaryCategory,
          fullPrice: parseFloat(newItem.fullPrice),
          date: newItem.date,
          isRecurring: newItem.isRecurring,
          createdAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, 'items'), itemData);
        const item = { id: docRef.id, ...itemData };
        
        setItems(prev => [...prev, item]);
        setNewItem({
          name: '',
          categoryMatch: '100',
          secondaryCategory: '',
          fullPrice: '',
          date: new Date().toISOString().split('T')[0],
          isRecurring: false
        });
      } catch (error) {
        console.error('Error adding item:', error);
        alert('Failed to add item. Please try again.');
      }
    }
  }, [newItem, activeTab, user]);

  // Add new unsorted item to Item Box or directly to category if pre-sorted
  const addUnsortedItem = useCallback(async () => {
    if (newUnsortedItem.name.trim() && parseFloat(newUnsortedItem.fullPrice) > 0 && user) {
      try {
        const itemData = {
          userId: user.uid,
          name: newUnsortedItem.name.trim(),
          fullPrice: parseFloat(newUnsortedItem.fullPrice),
          date: newUnsortedItem.date,
          categoryMatch: parseFloat(newUnsortedItem.categoryMatch),
          secondaryCategory: newUnsortedItem.secondaryCategory,
          primaryCategory: newUnsortedItem.primaryCategory,
          isRecurring: newUnsortedItem.isRecurring,
          createdAt: new Date().toISOString()
        };
        
        // If primary category is specified, add directly to items instead of unsorted
        if (itemData.primaryCategory) {
          const docRef = await addDoc(collection(db, 'items'), itemData);
          const item = { id: docRef.id, ...itemData };
          setItems(prev => [...prev, item]);
        } else {
          const docRef = await addDoc(collection(db, 'unsortedItems'), itemData);
          const item = { id: docRef.id, ...itemData };
          setUnsortedItems(prev => [...prev, item]);
        }
        
        setNewUnsortedItem({
          name: '',
          fullPrice: '',
          date: new Date().toISOString().split('T')[0],
          categoryMatch: '100',
          secondaryCategory: '',
          primaryCategory: '',
          isRecurring: false
        });
      } catch (error) {
        console.error('Error adding unsorted item:', error);
        alert('Failed to add item. Please try again.');
      }
    }
  }, [newUnsortedItem, user]);

  // Sort item from Item Box to categories
  const sortItem = useCallback(async (unsortedItem, sortData) => {
    if (!user) return;
    
    try {
      const sortedItemData = {
        userId: user.uid,
        name: unsortedItem.name,
        fullPrice: unsortedItem.fullPrice,
        date: unsortedItem.date,
        primaryCategory: sortData.primaryCategory,
        categoryMatch: parseFloat(sortData.categoryMatch),
        secondaryCategory: sortData.secondaryCategory,
        isRecurring: unsortedItem.isRecurring || false,
        createdAt: new Date().toISOString()
      };
      
      // Add to items collection
      const docRef = await addDoc(collection(db, 'items'), sortedItemData);
      const sortedItem = { id: docRef.id, ...sortedItemData };
      
      // Delete from unsorted
      await deleteDoc(doc(db, 'unsortedItems', unsortedItem.id));
      
      setItems(prev => [...prev, sortedItem]);
      setUnsortedItems(prev => prev.filter(item => item.id !== unsortedItem.id));
      setSortingItem(null);
    } catch (error) {
      console.error('Error sorting item:', error);
      alert('Failed to sort item. Please try again.');
    }
  }, [user]);

  // Edit item
  const editItem = useCallback((item) => {
    setEditingItem({ 
      ...item,
      fullPrice: item.fullPrice.toString(),
      categoryMatch: item.categoryMatch.toString()
    });
  }, []);

  // Save edited item
  const saveEdit = useCallback(async () => {
    if (!user || !editingItem) return;
    
    try {
      const updatedData = {
        name: editingItem.name,
        fullPrice: parseFloat(editingItem.fullPrice),
        categoryMatch: parseFloat(editingItem.categoryMatch),
        date: editingItem.date,
        primaryCategory: editingItem.primaryCategory,
        secondaryCategory: editingItem.secondaryCategory,
        isRecurring: editingItem.isRecurring || false,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'items', editingItem.id), updatedData);
      
      setItems(prev => prev.map(item => 
        item.id === editingItem.id ? { ...item, ...updatedData } : item
      ));
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    }
  }, [editingItem, user]);

  // Delete item
  const deleteItem = useCallback(async (id) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'items', id));
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  }, [user]);

  // Delete unsorted item
  const deleteUnsortedItem = useCallback(async (id) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, 'unsortedItems', id));
      setUnsortedItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting unsorted item:', error);
      alert('Failed to delete item. Please try again.');
    }
  }, [user]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const filteredItems = filterItemsByDate(items);
    
    // Prepare CSV headers
    const headers = [
      'Date',
      'Name',
      'Primary Category',
      'Category Match %',
      'Secondary Category',
      'Full Price',
      'Primary Split',
      'Secondary Split',
      'Is Recurring'
    ];
    
    // Prepare CSV rows
    const rows = filteredItems.map(item => {
      const primarySplit = calculateSplitPrice(item.fullPrice, item.categoryMatch);
      const secondarySplit = item.secondaryCategory ? 
        calculateSplitPrice(item.fullPrice, calculateSecondaryPercentage(item.categoryMatch)) : 0;
      
      return [
        item.date,
        item.name,
        item.primaryCategory,
        item.categoryMatch,
        item.secondaryCategory || '',
        item.fullPrice,
        primarySplit.toFixed(2),
        secondarySplit.toFixed(2),
        item.isRecurring ? 'Yes' : 'No'
      ];
    });
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const currentDate = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_data_${currentDate}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [items, filterItemsByDate, calculateSplitPrice, calculateSecondaryPercentage]);

  // Logout
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      minimumFractionDigits: 0
    }).format(amount);
  }, []);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('hu-HU');
  }, []);

  // Input change handlers
  const handleNewItemChange = useCallback((field, value) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNewUnsortedItemChange = useCallback((field, value) => {
    setNewUnsortedItem(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditingItemChange = useCallback((field, value) => {
    setEditingItem(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSortingItemChange = useCallback((field, value) => {
    setSortingItem(prev => ({ ...prev, [field]: value }));
  }, []);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <AuthComponent onLogin={() => {}} />;
  }

  // Show loading while fetching data
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Financial Organizing App
      </h1>
      
      {/* Date Filter */}
      <div className="mb-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="month"
              checked={filterMode === 'month'}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">Monthly Filter</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="period"
              checked={filterMode === 'period'}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">Salary Period</span>
          </label>
        </div>
        
        {filterMode === 'month' ? (
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-md">
            <Calendar size={20} className="text-gray-500" />
            <input
              type="month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Filter size={16} className="text-gray-500" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="bg-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2">
              <Calendar size={20} className="text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select period</option>
                {salaryPeriods
                  .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                  .map(period => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
              </select>
              <Filter size={16} className="text-gray-500" />
            </div>
            <button
              onClick={() => setShowNewPeriodModal(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              New Period
            </button>
          </div>
        )}
      </div>
      
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'Dashboard' && (
        <Dashboard 
          monthlyBudget={monthlyBudget}
          setMonthlyBudget={setMonthlyBudget}
          showBudgetSettings={showBudgetSettings}
          setShowBudgetSettings={setShowBudgetSettings}
          getMonthlyTotal={getMonthlyTotal}
          getRemainingBudget={getRemainingBudget}
          getRemainingAfterRecurring={getRemainingAfterRecurring}
          getRecurringTotal={getRecurringTotal}
          getCategoryTotal={getCategoryTotal}
          categories={categories}
          filterItemsByDate={filterItemsByDate}
          items={items}
          formatCurrency={formatCurrency}
          filterMode={filterMode}
          selectedPeriod={selectedPeriod}
          salaryPeriods={salaryPeriods}
          dateFilter={dateFilter}
          onExport={exportToCSV}
          onLogout={handleLogout}
        />
      )}
      
      {activeTab === 'Item Box' && (
        <ItemBox 
          newUnsortedItem={newUnsortedItem}
          handleNewUnsortedItemChange={handleNewUnsortedItemChange}
          addUnsortedItem={addUnsortedItem}
          filterItemsByDate={filterItemsByDate}
          unsortedItems={unsortedItems}
          setSortingItem={setSortingItem}
          categories={categories}
          calculateSplitPrice={calculateSplitPrice}
          calculateSecondaryPercentage={calculateSecondaryPercentage}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          deleteUnsortedItem={deleteUnsortedItem}
        />
      )}
      
      {activeTab === 'Recurring Spendings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recurring Monthly Expenses</h2>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">Total Monthly Recurring</p>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(getRecurringTotal())}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {getRecurringItems().map(item => (
              <ItemCard 
                key={item.id}
                item={item} 
                isPrimary={true}
                onEdit={editItem}
                onDelete={deleteItem}
                calculateSplitPrice={calculateSplitPrice}
                calculateSecondaryPercentage={calculateSecondaryPercentage}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ))}
            {getRecurringItems().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recurring expenses yet
              </div>
            )}
          </div>
        </div>
      )}
      
      {categories.includes(activeTab) && (
        <>
          {/* Add New Item Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus size={20} />
              Add New Item to {activeTab}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => handleNewItemChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter item name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Price (HUF)
                </label>
                <input
                  type="number"
                  value={newItem.fullPrice}
                  onChange={(e) => handleNewItemChange('fullPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newItem.date}
                  onChange={(e) => handleNewItemChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Match (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newItem.categoryMatch}
                  onChange={(e) => handleNewItemChange('categoryMatch', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Category ({calculateSecondaryPercentage(newItem.categoryMatch)}%)
                </label>
                <select
                  value={newItem.secondaryCategory}
                  onChange={(e) => handleNewItemChange('secondaryCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {categories.filter(cat => cat !== activeTab).map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newItem.isRecurring}
                    onChange={(e) => handleNewItemChange('isRecurring', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Recurring Monthly Expense</span>
                </label>
              </div>
            </div>
            
            <button
              onClick={addItem}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Item
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-4">
            {getCategoryItems(activeTab).map(item => (
              <ItemCard 
                key={`${item.id}-${item.primaryCategory === activeTab ? 'primary' : 'secondary'}`}
                item={item} 
                isPrimary={item.primaryCategory === activeTab}
                onEdit={editItem}
                onDelete={deleteItem}
                calculateSplitPrice={calculateSplitPrice}
                calculateSecondaryPercentage={calculateSecondaryPercentage}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            ))}
          </div>

          {/* Category Total */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <div className="text-right">
              <span className="text-lg font-medium text-gray-700">
                Total for {activeTab}: 
              </span>
              <span className="text-2xl font-bold text-green-600 ml-2">
                {formatCurrency(getCategoryTotal(activeTab))}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Sort Modal */}
      {sortingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Sort Item: {sortingItem.name}</h3>
            <p className="text-sm text-gray-600 mb-4">Price: {formatCurrency(sortingItem.fullPrice)}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Category
                </label>
                <select
                  value={sortingItem.primaryCategory || ''}
                  onChange={(e) => handleSortingItemChange('primaryCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Match (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={sortingItem.categoryMatch || '100'}
                  onChange={(e) => handleSortingItemChange('categoryMatch', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Category ({calculateSecondaryPercentage(sortingItem.categoryMatch || '100')}%)
                </label>
                <select
                  value={sortingItem.secondaryCategory || ''}
                  onChange={(e) => handleSortingItemChange('secondaryCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {categories.filter(cat => cat !== sortingItem.primaryCategory).map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => sortItem(sortingItem, {
                  primaryCategory: sortingItem.primaryCategory,
                  categoryMatch: sortingItem.categoryMatch || '100',
                  secondaryCategory: sortingItem.secondaryCategory || ''
                })}
                disabled={!sortingItem.primaryCategory}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                Sort Item
              </button>
              <button
                onClick={() => setSortingItem(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => handleEditingItemChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Price (HUF)
                </label>
                <input
                  type="number"
                  value={editingItem.fullPrice}
                  onChange={(e) => handleEditingItemChange('fullPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={editingItem.date}
                  onChange={(e) => handleEditingItemChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Match (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingItem.categoryMatch}
                  onChange={(e) => handleEditingItemChange('categoryMatch', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Category ({calculateSecondaryPercentage(editingItem.categoryMatch)}%)
                </label>
                <select
                  value={editingItem.secondaryCategory}
                  onChange={(e) => handleEditingItemChange('secondaryCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {categories.filter(cat => cat !== editingItem.primaryCategory).map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingItem.isRecurring || false}
                    onChange={(e) => handleEditingItemChange('isRecurring', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Recurring Monthly Expense</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={saveEdit}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Period Modal */}
      {showNewPeriodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Salary Period</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period Start Date
                </label>
                <input
                  type="date"
                  value={newPeriodStart}
                  onChange={(e) => setNewPeriodStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The end date will be automatically set when you create the next period
                </p>
              </div>
              
              {salaryPeriods.length > 0 && (
                <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
                  <p className="font-medium mb-1">Note:</p>
                  <p>Creating this period will automatically set the end date for the most recent period to the day before this start date.</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={createSalaryPeriod}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Create Period
              </button>
              <button
                onClick={() => {
                  setShowNewPeriodModal(false);
                  setNewPeriodStart(new Date().toISOString().split('T')[0]);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component with Auth
const App = () => {
  return <FinancialApp />;
};
export default App;