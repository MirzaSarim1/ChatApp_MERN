import { createContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { connect, io } from "socket.io-client";
import { useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem('token'));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);


    // check if user is authenticated

    const checkAuth = async () => {
        try {
            const { data } = await axios.get('/auth/check');
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }


    // Login Function to handle user authentication and socket connection

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common['token'] = data.token;
                setToken(data.token);
                localStorage.setItem('token', data.token);
                toast.success(data.message);
            }
            else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // connect socket function to handle socket events
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);
        newSocket.on('getOnlineUsers', (userIds) => {
            setOnlineUsers(userIds);
        })
    }

    useEffect(() => {
        if(token){
            axios.defaults.headers.common['token'] = token;
        }
    },[])

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
