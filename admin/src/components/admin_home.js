import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Box, ShoppingCart, Users, MessageSquare, TrendingUp, AlertTriangle, RefreshCw, Moon, Sun, Calendar, Bell, HelpCircle, CheckSquare, Zap, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const AdminHome = () => {
    const [products, setProducts] = useState(null);
    const [contacts, setContacts] = useState(null);
    const [users, setUsers] = useState(null);
    const [orders, setOrders] = useState(null);
    const [error, setError] = useState(null);
    const [contactsError, setContactsError] = useState(null);
    const [usersError, setUsersError] = useState(null);
    const [ordersError, setOrdersError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [userRetryCount, setUserRetryCount] = useState(0);
    const [orderRetryCount, setOrderRetryCount] = useState(0);
    const [darkMode, setDarkMode] = useState(false);
    const [tasks, setTasks] = useState(null);
    const [tasksError, setTasksError] = useState(null);
    const [taskRetryCount, setTaskRetryCount] = useState(0);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    
    // State for Pending Tasks (dynamic to-do list)
    const [pendingTasks, setPendingTasks] = useState([
        { id: 1, title: 'Review new orders', priority: 'high', due: '2025-05-15', completed: false },
        { id: 2, title: 'Update product descriptions', priority: 'medium', due: '2025-05-20', completed: false },
        { id: 3, title: 'Respond to customer inquiries', priority: 'high', due: '2025-05-14', completed: false },
        { id: 4, title: 'Schedule inventory restocking', priority: 'medium', due: '2025-05-25', completed: false },
    ]);
   

    // Get current time to display greeting
    const currentHour = new Date().getHours();
    let greeting = "Good morning";
    if (currentHour >= 12 && currentHour < 17) {
        greeting = "Good afternoon";
    } else if (currentHour >= 17) {
        greeting = "Good evening";
    }

    const loadTasksData = async (retry = true) => {
  try {
    const response = await fetch('https://balaguruva-final-hosting.onrender.com/api/tasks');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setTasks(data);
    setTasksError(null);
    setTaskRetryCount(0);
  } catch (error) {
    console.error('Tasks error:', error);
    const errorMessage = 'Failed to load tasks. Please try again.';
    
    if (retry && taskRetryCount < MAX_RETRIES) {
      setTaskRetryCount(prev => prev + 1);
      setTimeout(() => loadTasksData(true), RETRY_DELAY);
    } else {
      setTasksError(errorMessage);
    }
  }
};

// Update useEffect to include loadTasksData
useEffect(() => {
  loadDashboardData();
  loadContactsData();
  loadUsersData();
  loadOrdersData();
  loadTasksData(); // Add this line
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('adminDarkMode');
  if (savedTheme === 'true') {
    setDarkMode(true);
    document.body.classList.add('dark-mode');
  }
}, []);

    useEffect(() => {
        loadDashboardData();
        loadContactsData();
        loadUsersData();
        loadOrdersData();
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('adminDarkMode');
        if (savedTheme === 'true') {
            setDarkMode(true);
            document.body.classList.add('dark-mode');
        }
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            const newState = !prev;
            localStorage.setItem('adminDarkMode', newState);
            
            if (newState) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            
            return newState;
        });
    };

    const loadDashboardData = async (retry = true) => {
        try {
            const response = await fetch('https://balaguruva-final-hosting.onrender.com/api/products');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProducts(data);
            setError(null);
            setRetryCount(0);
        } catch (error) {
            console.error('Dashboard error:', error);
            const errorMessage = 'Failed to load product count. Please try again.';
            
            if (retry && retryCount < MAX_RETRIES) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => loadDashboardData(true), RETRY_DELAY);
            } else {
                setError(errorMessage);
            }
        }
    };

    const loadContactsData = async (retry = true) => {
        try {
            const response = await fetch('https://balaguruva-final-hosting.onrender.com/api/contacts');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setContacts(data);
            setContactsError(null);
            setRetryCount(0);
        } catch (error) {
            console.error('Contacts error:', error);
            const errorMessage = 'Failed to load contacts count. Please try again.';
            
            if (retry && retryCount < MAX_RETRIES) {
                setRetryCount(prev => prev + 1);
                setTimeout(() => loadContactsData(true), RETRY_DELAY);
            } else {
                setContactsError(errorMessage);
            }
        }
    };

    const loadUsersData = async (retry = true) => {
        try {
            const response = await fetch('https://balaguruva-final-hosting.onrender.com/api/users');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data);
            setUsersError(null);
            setUserRetryCount(0);
        } catch (error) {
            console.error('Users error:', error);
            const errorMessage = 'Failed to load users count. Please try again.';
            
            if (retry && userRetryCount < MAX_RETRIES) {
                setUserRetryCount(prev => prev + 1);
                setTimeout(() => loadUsersData(true), RETRY_DELAY);
            } else {
                setUsersError(errorMessage);
            }
        }
    };

    const loadOrdersData = async (retry = true) => {
        try {
            const response = await fetch('https://balaguruva-final-hosting.onrender.com/api/orders/admin/all');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.success && Array.isArray(data.orders)) {
                setOrders(data.orders);
            } else {
                setOrders(Array.isArray(data) ? data : []);
            }
            setOrdersError(null);
            setOrderRetryCount(0);
        } catch (error) {
            console.error('Orders error:', error);
            const errorMessage = 'Failed to load orders count. Please try again.';
            
            if (retry && orderRetryCount < MAX_RETRIES) {
                setOrderRetryCount(prev => prev + 1);
                setTimeout(() => loadOrdersData(true), RETRY_DELAY);
            } else {
                setOrdersError(errorMessage);
            }
        }
    };

    // Calculate total revenue from orders
    const calculateTotalRevenue = () => {
        if (!orders) return 0;
        try {
            return orders.reduce((total, order) => {
                return total + (Number(order.totalPrice) || 0);
            }, 0);
        } catch (error) {
            console.error("Error calculating revenue:", error);
            return 0;
        }
    };

    const StatCard = ({ icon: Icon, title, value, loading, error, onRetry, iconClass, cardClass }) => {
        const [isHovered, setIsHovered] = useState(false);
        
        return (
            <div 
                className={`bg-white rounded-xl shadow-md p-4 relative transition-all duration-300 ${
                    isHovered ? 'shadow-lg transform -translate-y-1' : ''
                } ${
                    cardClass === 'stat-card-primary' ? 'border-l-4 border-purple-500' : 
                    cardClass === 'stat-card-success' ? 'border-l-4 border-green-500' : 
                    cardClass === 'stat-card-warning' ? 'border-l-4 border-orange-500' : 
                    cardClass === 'stat-card-info' ? 'border-l-4 border-blue-500' : ''
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-full mr-3 transition-transform duration-300 ${
                        iconClass === 'icon-gradient-primary' ? 'bg-purple-100 text-purple-600' : 
                        iconClass === 'icon-gradient-success' ? 'bg-green-100 text-green-600' :
                        iconClass === 'icon-gradient-warning' ? 'bg-orange-100 text-orange-600' :
                        iconClass === 'icon-gradient-info' ? 'bg-blue-100 text-blue-600' : ''
                    } ${isHovered ? 'transform scale-110 rotate-3' : ''}`}>
                        <Icon 
                            size={24}
                            strokeWidth={1.5}
                        />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                        {loading ? (
                            <div className="h-6 w-20 bg-gray-200 animate-pulse rounded mt-1"></div>
                        ) : error ? (
                            <div className="flex items-center text-red-500 text-sm mt-1">
                                <AlertTriangle size={14} className="mr-1" />
                                <span className="truncate">{error.split('.')[0]}</span>
                                {onRetry && (
                                    <button 
                                        onClick={onRetry}
                                        className="ml-2 p-1 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
                                    >
                                        <RefreshCw size={12} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center group relative">
                                <div className={`text-xl font-bold ${
                                    title.toLowerCase().includes('revenue') ? 'gradient-text-primary' :
                                    title.toLowerCase().includes('product') ? 'gradient-text-purple' :
                                    title.toLowerCase().includes('user') ? 'gradient-text-blue' :
                                    title.toLowerCase().includes('order') ? 'gradient-text-teal' :
                                    'gradient-text-gold'
                                }`}>
                                    {title.toLowerCase().includes('price') || title.toLowerCase().includes('revenue') 
                                        ? new Intl.NumberFormat('en-IN', {
                                            style: 'currency',
                                            currency: 'INR',
                                            maximumFractionDigits: 0
                                        }).format(value)
                                        : value}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const TaskItem = ({ task, onToggleComplete, onDelete }) => {
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };
  
  const isOverdue = new Date(task.due) < new Date();
  
  return (
    <div className="flex items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="mr-3">
        <input 
          type="checkbox" 
          className="w-4 h-4 accent-indigo-600 cursor-pointer"
          checked={task.completed}
          onChange={() => onToggleComplete(task._id)} // Use _id
        />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
          {task.title}
        </p>
        <div className="flex items-center mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`text-xs ml-2 ${isOverdue && !task.completed ? 'text-red-600' : 'text-gray-500'}`}>
            {isOverdue && !task.completed ? 'Overdue: ' : 'Due: '} 
            {new Date(task.due).toLocaleDateString()}
          </span>
        </div>
      </div>
      <button 
        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
        onClick={() => onDelete(task._id)} // Use _id
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

    const toggleTaskComplete = async (taskId) => {
  try {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const response = await fetch(`https://balaguruva-final-hosting.onrender.com/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedTask = await response.json();
    if (updatedTask.success) {
      setTasks(tasks.map(t => (t._id === taskId ? updatedTask.task : t)));
    }
  } catch (error) {
    console.error("Error toggling task completion:", error);
    alert("Failed to update task. Please try again.");
  }
};

const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`https://balaguruva-final-hosting.onrender.com/api/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      setTasks(tasks.filter(t => t._id !== taskId));
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    alert("Failed to delete task. Please try again.");
  }
};

const addTask = async (e) => {
  e.preventDefault();
  if (!newTaskTitle || !newTaskDueDate) {
    alert('Please provide a task title and due date.');
    return;
  }

  try {
    const response = await fetch('https://balaguruva-final-hosting.onrender.com/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTaskTitle,
        priority: newTaskPriority,
        due: newTaskDueDate,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      setTasks([result.task, ...tasks]); // Add new task to the top
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
    }
  } catch (error) {
    console.error("Error adding task:", error);
    alert("Failed to add task. Please try again.");
  }
};

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="hidden">
                <svg>
                    <defs>
                        <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF0080" />
                            <stop offset="100%" stopColor="#7928CA" />
                        </linearGradient>
                        <linearGradient id="gradient-success" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00FF87" />
                            <stop offset="100%" stopColor="#60EFFF" />
                        </linearGradient>
                        <linearGradient id="gradient-warning" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF8F71" />
                            <stop offset="100%" stopColor="#EF4444" />
                        </linearGradient>
                        <linearGradient id="gradient-info" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0EA5E9" />
                            <stop offset="100%" stopColor="#6366F1" />
                        </linearGradient>
                        <linearGradient id="text-gradient-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                        <linearGradient id="text-gradient-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#6D28D9" />
                        </linearGradient>
                        <linearGradient id="text-gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#1D4ED8" />
                        </linearGradient>
                        <linearGradient id="text-gradient-teal" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#14B8A6" />
                            <stop offset="100%" stopColor="#0F766E" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            
            <style jsx>{`
                .gradient-text-gold {
                    background: -webkit-linear-gradient(#F59E0B, #D97706);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .gradient-text-purple {
                    background: -webkit-linear-gradient(#8B5CF6, #6D28D9);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .gradient-text-blue {
                    background: -webkit-linear-gradient(#3B82F6, #1D4ED8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .gradient-text-teal {
                    background: -webkit-linear-gradient(#14B8A6, #0F766E);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .gradient-text-primary {
                    background: -webkit-linear-gradient(#FF0080, #7928CA);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
            
            <button 
                className="fixed top-4 right-4 p-2 rounded-full bg-white shadow-md z-50 hover:bg-gray-100 transition-colors"
                onClick={toggleDarkMode}
            >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                    <div>
                        <p className="text-gray-500">{greeting}, <span className="gradient-text-gold font-medium">Admin</span></p>
                        <h2 className="text-2xl font-bold gradient-text-primary">Admin Dashboard</h2>
                    </div>
                    <div className="flex gap-3">
                        <button className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors relative group">
                            <Bell size={20} />
                            <span className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">Notifications</span>
                        </button>
                        <button className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors relative group">
                            <Calendar size={20} />
                            <span className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">Calendar</span>
                        </button>
                        <button className="p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors relative group">
                            <HelpCircle size={20} />
                            <span className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">Help Center</span>
                        </button>
                    </div>
                </div>

                {/* StatCards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <StatCard 
                        icon={Box}
                        title="Total Products"
                        value={products ? products.length : '-'}
                        loading={!products && !error}
                        error={error}
                        onRetry={loadDashboardData}
                        iconClass="icon-gradient-primary"
                        cardClass="stat-card-primary"
                    />
                    <StatCard 
                        icon={Users}
                        title="Total Users"
                        value={users ? users.length : '-'}
                        loading={!users && !usersError}
                        error={usersError}
                        onRetry={() => {
                            setUserRetryCount(0);
                            loadUsersData(true);
                        }}
                        iconClass="icon-gradient-success"
                        cardClass="stat-card-success"
                    />
                    <StatCard 
                        icon={MessageSquare}
                        title="Messages"
                        value={contacts ? contacts.length : '-'}
                        loading={!contacts && !contactsError}
                        error={contactsError}
                        onRetry={() => {
                            setRetryCount(0);
                            loadContactsData(true);
                        }}
                        iconClass="icon-gradient-warning"
                        cardClass="stat-card-warning"
                    />
                    <StatCard 
                        icon={ShoppingCart}
                        title="Orders"
                        value={orders ? orders.length : '-'}
                        loading={!orders && !ordersError}
                        error={ordersError}
                        onRetry={() => {
                            setOrderRetryCount(0);
                            loadOrdersData(true);
                        }}
                        iconClass="icon-gradient-info"
                        cardClass="stat-card-info"
                    />
                    <StatCard 
                        icon={TrendingUp}
                        title="Revenue"
                        value={calculateTotalRevenue()}
                        loading={!orders && !ordersError}
                        error={ordersError}
                        iconClass="icon-gradient-info"
                        cardClass="stat-card-info"
                    />
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
  <h3 className="text-lg font-semibold mb-4 flex items-center">
    <CheckSquare className="mr-2 text-indigo-600" size={20} /> To-Do List
  </h3>
  {/* Add Task Form */}
  <div className="mb-6">
    <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
        placeholder="Enter task title"
        className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <select
        value={newTaskPriority}
        onChange={(e) => setNewTaskPriority(e.target.value)}
        className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <input
        type="date"
        value={newTaskDueDate}
        onChange={(e) => setNewTaskDueDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
        className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Add Task
      </button>
    </form>
  </div>
  {/* Task List */}
  <div className="max-h-96 overflow-y-auto">
    {!tasks && !tasksError ? (
      <p className="text-gray-500">Loading tasks...</p>
    ) : tasksError ? (
      <div className="flex items-center text-red-500">
        <AlertTriangle size={14} className="mr-1" />
        <span>{tasksError}</span>
        <button 
          onClick={() => { setTaskRetryCount(0); loadTasksData(true); }}
          className="ml-2 p-1 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
        >
          <RefreshCw size={12} />
        </button>
      </div>
    ) : tasks.length > 0 ? (
      tasks.map(task => (
        <TaskItem 
          key={task._id} 
          task={task} 
          onToggleComplete={toggleTaskComplete} 
          onDelete={deleteTask}
        />
      ))
    ) : (
      <p className="text-gray-500">No tasks to display. Add a task to get started!</p>
    )}
  </div>
</div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Zap className="mr-2 text-indigo-600" size={20} /> Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            to="/add-product"
                            className="flex items-center justify-center p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Plus size={18} className="mr-2" /> Add Product
                        </Link>
                        <Link
                            to="/orders"
                            className="flex items-center justify-center p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <ShoppingCart size={18} className="mr-2" /> View Orders
                        </Link>
                        <Link
                            to="/messages"
                            className="flex items-center justify-center p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <MessageSquare size={18} className="mr-2" /> Check Messages
                        </Link>
                        <Link
                            to="/manage-products"
                            className="flex items-center justify-center p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Box size={18} className="mr-2" /> Manage Products
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;