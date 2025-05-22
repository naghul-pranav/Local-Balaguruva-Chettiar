import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { CheckSquare, Zap, Plus, Trash2, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const AdminHome = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [tasks, setTasks] = useState(null);
    const [tasksError, setTasksError] = useState(null);
    const [taskRetryCount, setTaskRetryCount] = useState(0);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');

    useEffect(() => {
        loadTasksData();
        
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
                setTasks([result.task, ...tasks]);
                setNewTaskTitle('');
                setNewTaskPriority('medium');
                setNewTaskDueDate('');
            }
        } catch (error) {
            console.error("Error adding task:", error);
            alert("Failed to add task. Please try again.");
        }
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
                        onChange={() => onToggleComplete(task._id)}
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
                    onClick={() => onDelete(task._id)}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        );
    };

    const SimpleStatCard = ({ title, value }) => {
        return (
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-teal-500">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <div className="text-xl font-bold text-teal-600">
                    {value}
                </div>
            </div>
        );
    };

    const getPendingTasksCount = () => {
        return tasks ? tasks.filter(task => !task.completed).length : 0;
    };

    const getOverdueTasksCount = () => {
        return tasks ? tasks.filter(task => !task.completed && new Date(task.due) < new Date()).length : 0;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <button 
                className="fixed top-4 right-4 p-2 rounded-full bg-white shadow-md z-50 hover:bg-gray-100 transition-colors"
                onClick={toggleDarkMode}
            >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* To-Do List */}
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
                                <span>{tasksError}</span>
                                <button 
                                    onClick={() => { setTaskRetryCount(0); loadTasksData(true); }}
                                    className="ml-2 p-1 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
                                >
                                    Retry
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

                {/* Modified Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <SimpleStatCard 
                        title="Pending Tasks"
                        value={getPendingTasksCount()}
                    />
                    <SimpleStatCard 
                        title="Overdue Tasks"
                        value={getOverdueTasksCount()}
                    />
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
                            <Plus size={18} className="mr-2" /> View Orders
                        </Link>
                        <Link
                            to="/messages"
                            className="flex items-center justify-center p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Plus size={18} className="mr-2" /> Check Messages
                        </Link>
                        <Link
                            to="/manage-products"
                            className="flex items-center justify-center p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Plus size={18} className="mr-2" /> Manage Products
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;