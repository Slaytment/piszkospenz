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
          carts={carts}
          setSortingItem={setSortingItem}
          categories={categories}
          calculateSplitPrice={calculateSplitPrice}
          calculateSecondaryPercentage={calculateSecondaryPercentage}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          deleteUnsortedItem={deleteUnsortedItem}
          newCart={newCart}
          handleCartChange={handleCartChange}
          handleCartItemChange={handleCartItemChange}
          addCartItem={addCartItem}
          removeCartItem={removeCartItem}
          createCart={createCart}
          editingCart={editingCart}
          setEditingCart={setEditingCart}
          sortCartItem={sortCartItem}
          deleteCartItem={deleteCartItem}
          editCartItem={editCartItem}
          onCartClick={handleCartClick}
          onScanReceipt={() => setShowReceiptScanner(true)}
        />
      )}
      
      {activeTab === 'Recurring Spendings' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recurring Monthly Expenses</h2>
            <p className="text-sm text-gray-600 mb-4">
              These items are automatically included in your monthly budget calculations.
            </p>
            <div className="text-center mb-6">
              <p className="text-lg font-medium text-gray-700">Total Monthly Recurring</p>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(getRecurringTotal())}</p>
            </div>
          </div>
          
          {getRecurringItems().map(item => (
            <ItemCard 
              key={item.id}
              item={item} 
              isPrimary={true}
              onEdit={editItem}
              onDelete={deleteItem}
              onCartClick={handleCartClick}
              calculateSplitPrice={calculateSplitPrice}
              calculateSecondaryPercentage={calculateSecondaryPercentage}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          ))}
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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem();
                    }
                  }}
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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem();
                    }
                  }}
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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem();
                    }
                  }}
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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem();
                    }
                  }}
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
                onCartClick={handleCartClick}
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

      {/* New Period Modal */}
      {showNewPeriodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Salary Period</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newPeriodStart}
                  onChange={(e) => setNewPeriodStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {salaryPeriods.length > 0 && (
                <p className="text-sm text-gray-600">
                  The previous period will automatically end on the day before this date.
                </p>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={createSalaryPeriod}
                disabled={!newPeriodStart}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
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
                onClick={() => sortItem(sortingItem, {
                  primaryCategory: sortingItem.primaryCategory,
                  categoryMatch: sortingItem.categoryMatch || '100',
                  secondaryCategory: sortingItem.secondaryCategory || ''
                }, true)}
                disabled={!sortingItem.primaryCategory}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300"
              >
                Sort & Next
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

      {/* Cart Item Sort Modal */}
      {sortingCartItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Sort Cart Item: {sortingCartItem.item.name}</h3>
            <p className="text-sm text-gray-600 mb-4">Price: {formatCurrency(sortingCartItem.item.price)}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Category
                </label>
                <select
                  value={sortingCartItem.primaryCategory || ''}
                  onChange={(e) => setSortingCartItem(prev => ({ ...prev, primaryCategory: e.target.value }))}
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
                  value={sortingCartItem.categoryMatch || '100'}
                  onChange={(e) => setSortingCartItem(prev => ({ ...prev, categoryMatch: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Category ({calculateSecondaryPercentage(sortingCartItem.categoryMatch || '100')}%)
                </label>
                <select
                  value={sortingCartItem.secondaryCategory || ''}
                  onChange={(e) => setSortingCartItem(prev => ({ ...prev, secondaryCategory: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {categories.filter(cat => cat !== sortingCartItem.primaryCategory).map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => saveSortedCartItem(sortingCartItem.cartId, sortingCartItem.item, {
                  primaryCategory: sortingCartItem.primaryCategory,
                  categoryMatch: sortingCartItem.categoryMatch || '100',
                  secondaryCategory: sortingCartItem.secondaryCategory || ''
                })}
                disabled={!sortingCartItem.primaryCategory}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                Sort Item
              </button>
              <button
                onClick={() => setSortingCartItem(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Item Edit Modal */}
      {editingCartItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Cart Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={editingCartItem.item.name}
                  onChange={(e) => setEditingCartItem(prev => ({ 
                    ...prev, 
                    item: { ...prev.item, name: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (HUF)
                </label>
                <input
                  type="number"
                  value={editingCartItem.item.price}
                  onChange={(e) => setEditingCartItem(prev => ({ 
                    ...prev, 
                    item: { ...prev.item, price: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => saveEditedCartItem(editingCartItem.cartId, editingCartItem.item)}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => setEditingCartItem(null)}
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

      {/* Edit Cart Modal */}
      {editingCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Shopping Cart</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cart Name
                </label>
                <input
                  type="text"
                  value={editingCart.name}
                  onChange={(e) => setEditingCart(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Price (HUF)
                </label>
                <input
                  type="number"
                  value={editingCart.totalPrice}
                  onChange={(e) => setEditingCart(prev => ({ ...prev, totalPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={editingCart.date}
                  onChange={(e) => setEditingCart(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, 'carts', editingCart.id), {
                      name: editingCart.name,
                      totalPrice: parseFloat(editingCart.totalPrice),
                      date: editingCart.date,
                      updatedAt: new Date().toISOString()
                    });
                    setCarts(prev => prev.map(c => c.id === editingCart.id ? { ...editingCart, totalPrice: parseFloat(editingCart.totalPrice) } : c));
                    setEditingCart(null);
                  } catch (error) {
                    console.error('Error updating cart:', error);
                    alert('Failed to update cart. Please try again.');
                  }
                }}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => setEditingCart(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Scanner Modal */}
      {showReceiptScanner && (
        <ReceiptScanner
          onClose={() => setShowReceiptScanner(false)}
          onProcessReceipt={handleReceiptProcess}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Cart Details Modal */}
      {showCartDetails && (
        <CartDetailsModal
          cart={showCartDetails}
          onClose={() => setShowCartDetails(null)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

export default FinancialApp