import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Receipt, Plus, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../utils/storage';
import { Expense, PaymentType } from '../../types';
import { generateId, formatCurrency } from '../../utils/calculations';

interface ExpenseFormData {
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentType: PaymentType;
}

const EXPENSE_CATEGORIES = [
  'Salary',
  'Rent',
  'Electricity',
  'Fuel',
  'Marketing',
  'Equipment',
  'Maintenance',
  'Travel',
  'Food',
  'Office Supplies',
  'Insurance',
  'Other',
];

export const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExpenseFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      paymentType: 'cash',
    }
  });

  const onSubmit = (data: ExpenseFormData) => {
    if (editingExpense) {
      // Update existing expense
      const updatedExpenses = expenses.map(expense =>
        expense.id === editingExpense.id
          ? {
              ...expense,
              ...data,
              date: new Date(data.date),
            }
          : expense
      );
      setExpenses(updatedExpenses);
      setEditingExpense(null);
    } else {
      // Add new expense
      const newExpense: Expense = {
        id: generateId(),
        ...data,
        date: new Date(data.date),
        createdAt: new Date(),
      };
      setExpenses([...expenses, newExpense]);
    }
    
    reset();
    setShowAddModal(false);
  };

  const deleteExpense = (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(expense => expense.id !== expenseId));
    }
  };

  const editExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setValue('category', expense.category);
    setValue('description', expense.description);
    setValue('amount', expense.amount);
    setValue('date', format(expense.date, 'yyyy-MM-dd'));
    setValue('paymentType', expense.paymentType);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingExpense(null);
    reset();
  };

  const categoryOptions = EXPENSE_CATEGORIES.map(category => ({
    value: category,
    label: category,
  }));

  const paymentOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
  ];

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Expenses</h1>
            <p className="text-gray-400">Track business expenses</p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Expenses</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Receipt className="w-4 h-4 text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">This Month</p>
              <p className="text-xl font-bold text-white">
                {formatCurrency(
                  expenses
                    .filter(expense => 
                      new Date(expense.date).getMonth() === new Date().getMonth()
                    )
                    .reduce((sum, expense) => sum + expense.amount, 0)
                )}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Receipt className="w-4 h-4 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Categories</p>
              <p className="text-xl font-bold text-white">{Object.keys(expensesByCategory).length}</p>
            </div>
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Receipt className="w-4 h-4 text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses List */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Expenses</h3>
        </div>
        
        {expenses.length > 0 ? (
          <div className="space-y-3">
            {expenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{expense.description}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>{expense.category}</span>
                          <span>•</span>
                          <span>{format(expense.date, 'MMM dd, yyyy')}</span>
                          <span>•</span>
                          <span className="capitalize">{expense.paymentType.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(expense.amount)}
                    </p>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editExpense(expense)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteExpense(expense.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No expenses recorded</p>
            <p className="text-sm text-gray-500 mb-4">Start tracking your business expenses</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Expense
            </Button>
          </div>
        )}
      </Card>

      {/* Add/Edit Expense Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={closeModal}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Category"
            options={categoryOptions}
            {...register('category', { required: 'Category is required' })}
            error={errors.category?.message}
          />

          <Input
            label="Description"
            placeholder="Enter expense description"
            {...register('description', { required: 'Description is required' })}
            error={errors.description?.message}
          />

          <Input
            label="Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 0.01, message: 'Amount must be greater than 0' }
            })}
            error={errors.amount?.message}
          />

          <Input
            label="Date"
            type="date"
            {...register('date', { required: 'Date is required' })}
            error={errors.date?.message}
          />

          <Select
            label="Payment Type"
            options={paymentOptions}
            {...register('paymentType')}
          />

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </Button>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};