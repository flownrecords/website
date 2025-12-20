import { Bell, Info, Star, User, UserMinus, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Notifications() {
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const navigate = useNavigate();

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
        },
        {
            id: '3',
            type: 'follower',
            title: 'New Follower',
            timestamp: new Date('2025-12-02T14:30:00Z'),
            read: false,
            metadata: {
                isFollowingBack: false, // State for the follow button
                user: { username: 'mbr', iconURL: 'https://placehold.co/32x32' }
            }
        },
    ]);

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

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'follower': return <User className="h-4 w-4 text-indigo-600" />;
            case 'update': return <Star className="h-4 w-4 text-yellow-400" />;
            default: return <Info className="h-4 w-4 text-gray-400" />;
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    return (
    <>
        <div className="relative" ref={notificationRef}>
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`rounded-lg p-1 ring-2 ring-white/25 hover:bg-primary/25 transition-colors duration-150 cursor-pointer ${showNotifications ? 'bg-primary/25' : ''}`}
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full ring-2 ring-secondary transform translate-x-1/4 -translate-y-1/4"></span>
                )}
            </button>

            {/* Dropdown Menu */}
            {showNotifications && (
                <div className="absolute right-0 mt-6 w-96 bg-secondary rounded-lg ring-2 ring-white/25 overflow-hidden z-800 origin-top-right">
                    <div className="p-4 border-b border-white/25 flex justify-between items-center bg-primary/25">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        <span className="text-xs text-gray-400">{unreadCount} unread</span>
                    </div>
                    
                    <div className="max-h-84 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications
                            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                            .slice(0, 3)
                            .map((notif) => (
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
                                                to={`/changelog#${notif.changelogId}`}
                                                onClick={() => markAsRead(notif.id)}
                                                className="block group"
                                            >
                                                <p className="text-sm text-white/75 font-medium group-hover:text-accent transition-colors">
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-white/50 mt-1">
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
                                                    <span className="text-sm text-white/75">
                                                        <span className="font-medium text-white cursor-pointer hover:text-white/75 transition-colors" onClick={() => navigate(`/u/${notif.metadata?.user.username}`)}>
                                                            {notif.metadata?.user.username}
                                                        </span> has followed you.
                                                    </span>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={(e) => handleFollowUser(notif.id, e)}
                                                        className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                                                            notif.metadata?.isFollowingBack 
                                                            ? 'bg-transparent ring-1 ring-white/25 text-white/25' 
                                                            : 'bg-accent text-white hover:bg-accent/75'
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
                                                        className="px-3 py-1 rounded-lg text-xs font-medium bg-second-accent/25 text-second-accent hover:bg-second-accent/15 flex items-center gap-1 transition-colors cursor-pointer"
                                                    >
                                                        <UserMinus className="w-3 h-3" /> Remove
                                                    </button>
                                                </div>
                                                <p className="text-xs text-white/25 mt-2">{formatDate(notif.timestamp)}</p>
                                            </div>
                                        ) : (
                                            // DEFAULT LOGIC
                                            <div>
                                                <p className="text-sm text-white/75">{notif.title}</p>
                                                <p className="text-xs text-white/25 mt-1">{formatDate(notif.timestamp)}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions Column (Mark Read) */}
                                    <div className="flex flex-col items-end gap-2">
                                        {!notif.read && (
                                            <button 
                                                onClick={(e) => markAsRead(notif.id, e)}
                                                className="text-white/25 hover:text-accent p-1 rounded-full hover:bg-white/10 cursor-pointer transition-colors"
                                                title="Mark as read"
                                            >
                                                <div className="h-2 w-2 bg-accent rounded-full"></div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center text-white/50">
                                <Bell className="h-8 w-8 mb-2 opacity-20" />
                                <span className="text-sm">All caught up!</span>
                            </div>
                        )}
                    </div>
                    <div className="p-2 border-t border-white/25 bg-secondary text-center">
                        <Link to="/notifications" className="text-xs text-accent hover:text-accent/75 transition-colors font-semibold">
                            View all activity
                        </Link>
                    </div>
                </div>
            )}
        </div>
    </>
    );
}