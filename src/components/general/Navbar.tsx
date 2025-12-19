import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

import Icon from "../../assets/images/icon.png";
import { AlignRight, Bell, User, Star, Info, UserPlus, UserMinus } from "lucide-react";

export default function Navbar() {
    const [mobileMenu, toggleMobileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    
    // 1. Initial State with Read status and IDs
    const [notifications, setNotifications] = useState([
        {
            id: '1',
            type: 'update',
            title: 'New feature released!',
            changelogId: 'v2.4.0', // ID for the redirect
            timestamp: new Date('2025-12-01T10:00:00Z'),
            read: false,
        },
        {
            id: '2',
            type: 'follower',
            title: 'New Follower',
            timestamp: new Date('2025-12-02T14:30:00Z'),
            read: false,
            metadata: {
                isFollowingBack: false, // State for the follow button
                user: { username: 'music_lover_92', iconURL: 'https://placehold.co/32x32' }
            }
        }
    ]);

    const notificationRef = useRef(null);
    const { user, logout } = useAuth();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !(notificationRef.current as any).contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notificationRef]);

    // --- ACTIONS ---

    const markAsRead = (id: string, e?: React.MouseEvent) => {
        if(e) e.stopPropagation(); // Prevent triggering parent clicks
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleRemoveNotification = (id: string, e?: any) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleFollowUser = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        // Mock API call simulation
        setNotifications(prev => prev.map((n: any) => {
            if (n.id === id) {
                return { 
                    ...n, 
                    metadata: { ...n.metadata, isFollowingBack: !n.metadata.isFollowingBack } 
                };
            }
            return n;
        }));
    };

    // --- RENDER HELPERS ---

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'follower': return <User className="h-4 w-4 text-blue-400" />;
            case 'update': return <Star className="h-4 w-4 text-yellow-400" />;
            default: return <Info className="h-4 w-4 text-gray-400" />;
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <>
            <nav className="bg-secondary px-4 py-2 m-4 rounded-lg ring-2 ring-white/25 relative z-50">
                <div className="hidden md:flex container mx-auto justify-between items-center">
                    {/* ... (Logo and Main Links - Unchanged) ... */}
                    <div className="flex space-x-4 items-center">
                        <Link to="/" className="text-lg font-semibold flex justify-center items-center space-x-2">
                            <img src={Icon} alt="Flown Records" className="h-6" draggable="false" />{" "}
                            <span>Flown Records</span>
                        </Link>
                        <ul className="flex space-x-6 mx-10">
                            <li><Link to={user ? "/me" : "/getstarted"} className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">Get started</Link></li>
                            <li><Link to="/guides" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">Guides</Link></li>
                            <li><Link to="/about" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">About Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <ul className="flex space-x-6 items-center">
                            {/* Notification Bell Wrapper */}
                            <div className="relative" ref={notificationRef}>
                                <button 
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className={`rounded-lg p-2 ring-2 ring-white/25 hover:bg-primary/25 transition-colors duration-150 cursor-pointer ${showNotifications ? 'bg-primary/25' : ''}`}
                                >
                                    <Bell className="h-4 w-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full ring-2 ring-secondary transform translate-x-1/4 -translate-y-1/4"></span>
                                    )}
                                </button>

                                {/* Dropdown Menu */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-6 w-96 bg-secondary rounded-lg ring-2 ring-white/25 overflow-hidden z-800 origin-top-right">
                                        <div className="p-4 border-b border-white/25 flex justify-between items-center bg-black/20">
                                            <h3 className="text-sm font-semibold text-white">Notifications</h3>
                                            <span className="text-xs text-gray-400">{unreadCount} unread</span>
                                        </div>
                                        
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                notifications.map((notif) => (
                                                    <div 
                                                        key={notif.id} 
                                                        className={`p-4 border-b border-white/25 last:border-0 flex gap-3 transition-colors ${notif.read ? 'bg-transparent hover:bg-white/5' : 'bg-white/5 hover:bg-white/10'}`}
                                                    >
                                                        {/* Icon Column */}
                                                        <div className="mt-1 bg-white/10 p-2 rounded-full h-fit flex-shrink-0">
                                                            {getNotificationIcon(notif.type)}
                                                        </div>

                                                        {/* Content Column */}
                                                        <div className="flex-1 min-w-0">
                                                            {/* UPDATE TYPE LOGIC */}
                                                            {notif.type === 'update' ? (
                                                                <Link 
                                                                    to={`/changelog/${notif.changelogId}`}
                                                                    onClick={() => markAsRead(notif.id)}
                                                                    className="block group"
                                                                >
                                                                    <p className="text-sm text-gray-200 font-medium group-hover:text-accent transition-colors">
                                                                        {notif.title}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        Click to view changelog • {formatDate(notif.timestamp)}
                                                                    </p>
                                                                </Link>
                                                            ) : notif.type === 'follower' ? (
                                                                // FOLLOWER TYPE LOGIC
                                                                <div className="flex flex-col">
                                                                     <div className="flex items-center gap-2 mb-2">
                                                                        {notif.metadata?.user?.iconURL && (
                                                                            <img src={notif.metadata.user.iconURL} alt="user" className="h-5 w-5 rounded-full" />
                                                                        )}
                                                                        <span className="text-sm text-gray-200">
                                                                            <span className="font-bold text-white">{notif.metadata?.user.username}</span> has followed you.
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <div className="flex gap-2">
                                                                        <button 
                                                                            onClick={(e) => handleFollowUser(notif.id, e)}
                                                                            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                                                                                notif.metadata?.isFollowingBack 
                                                                                ? 'bg-transparent ring-1 ring-white/25 text-gray-300' 
                                                                                : 'bg-accent text-white hover:bg-accent/80'
                                                                            }`}
                                                                        >
                                                                            {notif.metadata?.isFollowingBack ? (
                                                                                 <>Following</>
                                                                            ) : (
                                                                                 <><UserPlus className="w-3 h-3" /> Follow Back</>
                                                                            )}
                                                                        </button>
                                                                        <button 
                                                                            onClick={(e) => handleRemoveNotification(notif.id, e)}
                                                                            className="px-3 py-1 rounded text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center gap-1 transition-colors"
                                                                        >
                                                                            <UserMinus className="w-3 h-3" /> Remove
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 mt-2">{formatDate(notif.timestamp)}</p>
                                                                </div>
                                                            ) : (
                                                                // DEFAULT LOGIC
                                                                <div>
                                                                    <p className="text-sm text-gray-200">{notif.title}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">{formatDate(notif.timestamp)}</p>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Actions Column (Mark Read) */}
                                                        <div className="flex flex-col items-end gap-2">
                                                            {!notif.read && (
                                                                <button 
                                                                    onClick={(e) => markAsRead(notif.id, e)}
                                                                    className="text-gray-500 hover:text-accent p-1 rounded-full hover:bg-white/10"
                                                                    title="Mark as read"
                                                                >
                                                                    <div className="h-2 w-2 bg-accent rounded-full"></div>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center flex flex-col items-center text-gray-500">
                                                    <Bell className="h-8 w-8 mb-2 opacity-20" />
                                                    <span className="text-sm">All caught up!</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 border-t border-white/10 bg-primary text-center">
                                            <Link to="/notifications" className="text-xs text-accent hover:text-white transition-colors font-semibold">
                                                View all activity
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Profile & Auth (Unchanged) */}
                            {user ? (
                                <>
                                    <li className="flex items-center">
                                        <Link to="/me" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150 capitalize flex items-center">
                                            <img src={user?.profilePictureUrl ?? "https://placehold.co/512x512"} draggable="false" className="rounded-full h-5 w-5 mx-2 object-cover" alt="User profile icon" />
                                            {user?.firstName ?? `@${user.username}`}
                                        </Link>
                                    </li>
                                    <li className="flex items-center">
                                        <button onClick={logout} className="decoration-second-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150 cursor-pointer">Logout</button>
                                    </li>
                                </>
                            ) : (
                                <li className="flex items-center">
                                    <Link to="/login" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-15">Login</Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Mobile Menu (Kept as is) */}
                <div className="flex md:hidden container mx-auto justify-between items-center">
                    <Link to="/" className="text-lg font-semibold">
                        <img src={Icon} alt="Flown Records Logo" className="h-6 w-6 inline-block" />
                    </Link>
                    <button className="cursor-pointer text-white focus:outline-none hover:opacity-75 transition duration-150" onClick={() => toggleMobileMenu(!mobileMenu)}>
                        <AlignRight className={`h-6 w-6 ${mobileMenu ? "ring-2 ring-white/25 rounded-lg p-1" : ""} transition-all duration-300`} />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Content (Unchanged) */}
            {mobileMenu && (
                <div className="block md:hidden p-4 m-4 bg-secondary rounded-lg ring-2 ring-white/25">
                     <ul className="container mx-auto flex flex-col space-y-4">
                        <li><Link to="/getstarted" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">Get started</Link></li>
                        <li><Link to="/guides" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">Guides</Link></li>
                        <li><Link to="/about" className="decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">About Us</Link></li>
                        <li>
                             <Link to="/notifications" className="flex items-center decoration-accent decoration-2 hover:underline hover:text-white/75 transition-all duration-150">
                                <Bell className="h-4 w-4 mr-2" />
                                Notifications ({unreadCount})
                            </Link>
                        </li>
                     </ul>
                </div>
            )}
        </>
    );
}