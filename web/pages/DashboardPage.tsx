import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink, useSidebar } from "../components/ui/sidebar";
import { Link, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import Button from "../components/Button";
import { Logo } from "../components/Logo";
import CreateQuizPage from "./CreateQuizPage";
import CalendarPage from "./CalendarPage";
import { useAuth } from "../contexts/AuthContext";
import {
    HomeIcon,
    UserIcon,
    CogIcon,
    LogoutIcon,
    DocumentTextIcon,
    ChartPieIcon,
    PlusIcon,
    TableCellsIcon,
    CheckIcon,
    TrophyIcon,
    Bars3Icon,
    MagnifyingGlassIcon,
    EllipsisHorizontalIcon,
    TrashIcon,
    PencilIcon,
    ArrowRightIcon,
    FilterIcon,
    CalendarIcon,
    ArrowsRightLeftIcon,
    CreditCardIcon
} from "../components/Icons";

export const DashboardPage = () => {
    const { logout } = useAuth();
    const links = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: <HomeIcon className="h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Calendar",
            href: "/dashboard/calendar",
            icon: <CalendarIcon className="h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "My Quizzes",
            href: "/dashboard/quizzes",
            icon: <DocumentTextIcon className="h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Reports",
            href: "/dashboard/reports",
            icon: <ChartPieIcon className="h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Profile",
            href: "/dashboard/profile",
            icon: <UserIcon className="h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Settings",
            href: "/dashboard/settings",
            icon: <CogIcon className="h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Logout",
            href: "/",
            icon: <LogoutIcon className="h-5 w-5 flex-shrink-0" />,
            onClick: logout
        },
    ];
    const [open, setOpen] = useState(false);

    return (

        <div className="flex flex-col md:flex-row h-screen w-full bg-[#f4f5f7] dark:bg-black overflow-hidden transition-colors duration-300">

            {/* Sidebar Container: Square, flush left */}
            <div className={cn(
                "hidden md:flex flex-col flex-shrink-0 h-full",
                "bg-[#f4f5f7] dark:bg-black rounded-none",
                "overflow-hidden relative z-20",
                "transition-all duration-300 ease-in-out"
            )}>
                <Sidebar open={open} setOpen={setOpen}>
                    <SidebarBody className="justify-between gap-10 py-6 h-full px-4">
                        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
                            <div className="mb-8 px-2">
                                {open ? <LogoHeader /> : <LogoIcon />}
                            </div>
                            <div className="flex flex-col gap-2">
                                {links.map((link, idx) => (
                                    <SidebarLink key={idx} link={link} onClick={link.onClick} />
                                ))}
                            </div>
                        </div>
                        <div>
                            <UsageCard />
                            <UserAccount />
                        </div>
                    </SidebarBody>
                </Sidebar>
            </div>

            {/* Mobile Sidebar Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-2 bg-white dark:bg-[#0A0A0A] border-b border-gray-100 dark:border-white/5">
                <LogoIcon />
                <button onClick={() => setOpen(!open)}>
                    <Bars3Icon className="w-6 h-6 text-foreground" />
                </button>
            </div>

            {/* Mobile Sidebar Modal */}
            {open && (
                <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
                    <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#0A0A0A] p-4 flex flex-col" onClick={e => e.stopPropagation()}>
                        <Sidebar open={true} setOpen={setOpen}>
                            <SidebarBody className="justify-between gap-10 h-full">
                                <div className="flex flex-col flex-1">
                                    <div className="mb-8 px-2 flex justify-between items-center">
                                        <LogoHeader />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {links.map((link, idx) => (
                                            <SidebarLink key={idx} link={link} onClick={link.onClick} />
                                        ))}
                                    </div>
                                </div>
                            </SidebarBody>
                        </Sidebar>
                    </div>
                </div>
            )}

            {/* Main Content: Rounded Top Left only, White background */}
            <div className={cn(
                "flex flex-1 flex-col overflow-y-auto h-full relative z-10",
                "bg-white dark:bg-[#0A0A0A] md:rounded-tl-[40px] rounded-none",
                "border-l border-t border-gray-200/50 dark:border-white/5",
                "shadow-2xl shadow-black/5 dark:shadow-black/50"
            )}>
                <div className="relative z-10 h-full overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="/create" element={<CreateQuizPage />} />
                        <Route path="/calendar" element={<CalendarPage />} />
                        <Route path="/quizzes" element={<MyQuizzes />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

const LogoHeader = () => {
    return (
        <Link to="/dashboard" className="flex space-x-3 items-center relative z-20">
            <Logo className="h-8 w-8 flex-shrink-0" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-xl text-foreground font-heading tracking-tight"
            >
                Dexter
            </motion.span>
        </Link>
    );
};

const LogoIcon = () => {
    return (
        <Link to="/dashboard" className="flex space-x-2 items-center relative z-20 justify-center">
            <Logo className="h-8 w-8 flex-shrink-0" />
        </Link>
    );
};

// --- Sub-Pages ---

const DashboardHome = () => {
    const navigate = useNavigate();
    return (
        <div className="p-6 md:p-10 flex flex-col gap-8 w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-foreground font-heading">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your activity and performance.</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="gap-2 hidden sm:flex"
                        onClick={() => navigate('/join')}
                    >
                        Join a Quiz
                    </Button>
                    <Button
                        variant="secondary"
                        className="gap-2 hidden sm:flex"
                        onClick={() => navigate('/dashboard/host')}
                    >
                        Host a Quiz
                    </Button>
                    <Button
                        variant="primary"
                        className="gap-2 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95"
                        onClick={() => navigate('/dashboard/create')}
                    >
                        <PlusIcon className="w-4 h-4" />
                        Create New Quiz
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard title="Active Quizzes" value="12" icon={<DocumentTextIcon className="w-5 h-5" />} trend="+2 this week" />
                <StatCard title="Total Students" value="1,234" icon={<UserIcon className="w-5 h-5" />} trend="+15% vs last month" />
                <StatCard title="Completion Rate" value="89%" icon={<CheckIcon className="w-5 h-5" />} trend="+2% increase" />
                <StatCard title="Avg. Score" value="76%" icon={<TrophyIcon className="w-5 h-5" />} trend="Steady" />
            </div>

            {/* Recent Activity */}
            <div className="flex flex-col gap-5 flex-1">
                <div className="flex justify-between items-end">
                    <h2 className="text-xl font-bold text-foreground font-heading">Recent Quizzes</h2>
                    <Link to="/dashboard/quizzes" className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group">
                        View all <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="flex flex-col gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-100 dark:hover:bg-white/10 transition-all cursor-pointer group shadow-sm hover:shadow-md dark:shadow-none hover:border-gray-200 dark:hover:border-white/10"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors group-hover:scale-110 duration-300">
                                    <DocumentTextIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">Introduction to Physics {i}</h3>
                                    <p className="text-sm text-muted-foreground mt-0.5">Updated 2 hours ago • Science Dept</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-bold text-foreground">24 Students</div>
                                    <div className="text-xs text-muted-foreground">Participated</div>
                                </div>
                                <Button variant="outline" size="sm" className="rounded-full h-9 bg-white dark:bg-transparent border-gray-200 dark:border-white/10 text-foreground hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">View Report</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MyQuizzes = () => {
    const [activeTab, setActiveTab] = useState("All");
    const navigate = useNavigate();

    return (
        <div className="p-6 md:p-10 flex flex-col gap-8 w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground font-heading">My Quizzes</h1>
                    <p className="text-muted-foreground mt-1">Manage and edit your library.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search quizzes..."
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground transition-all focus:bg-white dark:focus:bg-black"
                        />
                    </div>
                    <Button variant="outline" className="px-3 rounded-full border-gray-200 dark:border-white/10">
                        <FilterIcon className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="primary"
                        className="rounded-full gap-2 px-4"
                        onClick={() => navigate('/dashboard/create')}
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">New Quiz</span>
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-white/5">
                {["All", "Published", "Drafts", "Archived"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "pb-3 text-sm font-medium transition-all relative",
                            activeTab === tab ? "text-primary dark:text-white" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-white rounded-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="group relative bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-2xl p-6 hover:shadow-xl transition-all hover:border-primary/20 dark:hover:border-primary/20 dark:shadow-none hover:bg-gray-50 dark:hover:bg-white/10 hover:-translate-y-1 duration-300">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-colors">
                                <EllipsisHorizontalIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-500/20 group-hover:scale-110 transition-transform">
                            <DocumentTextIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">Calculus 101: Limits</h3>
                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                            A comprehensive review of limits, continuity, and derivatives for the upcoming midterm exam.
                        </p>
                        <div className="flex items-center justify-between mt-auto mb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 dark:bg-white/10 text-muted-foreground">
                                    15 Qs
                                </span>
                                <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                                    Published
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground">Edited 1d ago</span>
                        </div>
                        <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex gap-2">
                            <Button variant="outline" size="sm" fullWidth className="rounded-lg text-xs h-9 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 group-hover:border-gray-300 dark:group-hover:border-white/20">
                                <PencilIcon className="w-3 h-3 mr-2" /> Edit
                            </Button>
                            <Button variant="primary" size="sm" fullWidth className="rounded-lg text-xs h-9 shadow-md">
                                Host Live
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const Reports = () => {
    return (
        <div className="p-6 md:p-10 flex flex-col gap-8 w-full max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-foreground font-heading">Performance Reports</h1>
                <p className="text-muted-foreground mt-1">Analyze student engagement and results.</p>
            </div>

            <div className="bg-gray-900 dark:bg-neutral-900 text-white rounded-[24px] p-8 shadow-2xl relative overflow-hidden border border-gray-800 dark:border-white/10 group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-primary/30 transition-colors duration-1000"></div>
                <div className="relative z-10">
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Total Participation</h3>
                    <p className="text-4xl font-bold mb-8">24,592 <span className="text-sm font-normal text-green-400 bg-green-400/10 px-2 py-1 rounded-md ml-2 border border-green-400/20">+12% vs last month</span></p>

                    <div className="h-64 flex items-end gap-2 sm:gap-4">
                        {[40, 65, 45, 80, 55, 90, 75, 60, 85, 95, 70, 80].map((h, i) => (
                            <div key={i} className="flex-1 bg-gray-800 dark:bg-white/5 rounded-t-lg relative group/bar h-full flex items-end overflow-visible">
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl mb-2">
                                    {h * 10} Students
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
                                </div>

                                <div
                                    className="w-full bg-primary/80 rounded-t-lg transition-all duration-500 group-hover/bar:bg-primary group-hover/bar:h-[105%]"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="w-full h-full bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-white/5 shadow-sm dark:shadow-none hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-foreground">Top Performing Students</h3>
                        <button className="text-xs font-medium text-primary hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-foreground border border-gray-200 dark:border-white/10 group-hover:border-primary/50 transition-colors">
                                        {i}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Student Name</p>
                                        <p className="text-xs text-muted-foreground">Class {String.fromCharCode(65 + i)}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md border border-green-100 dark:border-green-500/20">98%</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-6 bg-white dark:bg-white/5 shadow-sm dark:shadow-none hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-foreground mb-6">Recent Quiz Averages</h3>
                    <div className="space-y-5">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                <span className="text-sm font-medium text-foreground min-w-[120px]">Physics Unit {i}</span>
                                <div className="flex items-center gap-3 flex-1 ml-4">
                                    <div className="h-2.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full relative overflow-hidden group-hover:bg-indigo-500 transition-colors"
                                            style={{ width: `${70 + i * 4}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-foreground w-8 text-right">{70 + i * 4}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

const Profile = () => {
    const { user } = useAuth();

    if (!user) return <div>Loading...</div>;

    const initials = user.username ? user.username.substring(0, 2).toUpperCase() : 'U';

    return (
        <div className="p-6 md:p-10 flex flex-col gap-8 w-full max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-foreground font-heading">Profile Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account information.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col items-center gap-4 p-6 border border-gray-200 dark:border-white/5 rounded-2xl w-full md:w-72 bg-white dark:bg-white/5 shadow-sm dark:shadow-none">
                    <div className="relative group cursor-pointer">
                        <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-4xl text-muted-foreground border-2 border-dashed border-gray-200 dark:border-white/10 overflow-hidden">
                            {initials}
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PencilIcon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-foreground">{user.username}</h3>
                        <p className="text-xs text-muted-foreground">Premium Member</p>
                    </div>
                    <Button variant="outline" size="sm" fullWidth className="mt-2">Change Avatar</Button>
                </div>

                <div className="flex-1 w-full space-y-6 bg-white dark:bg-white/5 p-8 rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Username</label>
                            <input type="text" defaultValue={user.username} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all focus:bg-white dark:focus:bg-black focus:border-primary/50" />
                        </div>
                        {/* 
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Last Name</label>
                            <input type="text" defaultValue="Rao" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all focus:bg-white dark:focus:bg-black focus:border-primary/50" />
                        </div>
                         */}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Email Address</label>
                        <div className="relative">
                            <input type="email" defaultValue={user.email} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all focus:bg-white dark:focus:bg-black focus:border-primary/50" readOnly />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-500 font-medium flex items-center gap-1">
                                <CheckIcon className="w-3 h-3" /> Verified
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Bio</label>
                        <textarea rows={4} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all focus:bg-white dark:focus:bg-black focus:border-primary/50" defaultValue="Science educator passionate about interactive learning." />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="ghost">Cancel</Button>
                        <Button variant="primary">Save Changes</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Settings = () => {
    const [emailNotif, setEmailNotif] = useState(true);
    const [marketing, setMarketing] = useState(false);

    return (
        <div className="p-6 md:p-10 flex flex-col gap-8 w-full max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-foreground font-heading">Application Settings</h1>
                <p className="text-muted-foreground mt-1">Customize your Dexter experience.</p>
            </div>

            <div className="space-y-6">
                <Section title="Notifications">
                    <Toggle label="Email Notifications" description="Receive updates about your quizzes and student performance." checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
                    <div className="h-px bg-gray-100 dark:bg-white/5 my-2"></div>
                    <Toggle label="Marketing Emails" description="Receive news and special offers from Dexter." checked={marketing} onChange={() => setMarketing(!marketing)} />
                </Section>

                <Section title="Billing & Plans">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-medium text-foreground">Current Plan</p>
                            <p className="text-sm text-muted-foreground">You are currently on the <span className="font-bold text-foreground">Free Plan</span>.</p>
                        </div>
                        <Button variant="primary" className="gap-2">
                            <CreditCardIcon className="w-4 h-4" /> Upgrade to Pro
                        </Button>
                    </div>
                </Section>

                <Section title="Appearance">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-medium text-foreground">Theme</p>
                            <p className="text-sm text-muted-foreground">Select your preferred interface theme.</p>
                        </div>
                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5">
                            <button className="px-4 py-2 rounded-md bg-white dark:bg-white/10 text-sm font-medium text-foreground shadow-sm">System</button>
                            <button className="px-4 py-2 rounded-md hover:bg-white/50 dark:hover:bg-white/5 text-sm font-medium text-muted-foreground transition-colors">Light</button>
                            <button className="px-4 py-2 rounded-md hover:bg-white/50 dark:hover:bg-white/5 text-sm font-medium text-muted-foreground transition-colors">Dark</button>
                        </div>
                    </div>
                </Section>

                <Section title="Danger Zone" className="border-red-200 dark:border-red-900/20">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
                            <p className="text-sm text-muted-foreground">Permanently remove your account and all data.</p>
                        </div>
                        <Button variant="danger" className="gap-2">
                            <TrashIcon className="w-4 h-4" /> Delete Account
                        </Button>
                    </div>
                </Section>
            </div>
        </div>
    )
}

const Section: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={cn("border border-gray-200 dark:border-white/5 rounded-2xl bg-white dark:bg-white/5 overflow-hidden shadow-sm dark:shadow-none transition-all hover:shadow-md", className)}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
            <h3 className="font-bold text-foreground">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
)

const Toggle = ({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: () => void }) => (
    <div className="flex items-center justify-between py-2 cursor-pointer group" onClick={onChange}>
        <div>
            <p className="font-medium text-foreground group-hover:text-primary transition-colors">{label}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <button
            className={cn(
                "w-12 h-7 rounded-full transition-colors relative border-2 focus:outline-none focus:ring-2 focus:ring-primary/20",
                checked ? "bg-primary border-primary" : "bg-gray-200 dark:bg-white/10 border-transparent"
            )}
        >
            <div className={cn(
                "w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all transform",
                checked ? "translate-x-5" : "translate-x-0.5"
            )} />
        </button>
    </div>
)

const StatCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) => (
    <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 flex flex-col gap-4 shadow-sm hover:shadow-lg transition-all dark:shadow-none hover:-translate-y-1 duration-300">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <div className="text-muted-foreground opacity-50 p-2 bg-gray-100 dark:bg-white/5 rounded-lg">{icon}</div>
        </div>
        <div className="flex flex-col gap-1">
            <span className="text-3xl font-bold text-foreground font-heading">{value}</span>
            {trend && <span className="text-xs font-medium text-green-500 flex items-center gap-1">
                {trend}
            </span>}
        </div>
    </div>
);

export default DashboardPage;

const UsageCard = () => {
    const { open, animate } = useSidebar();

    // Only show if open
    if (!open) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-2"
        >
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-white dark:bg-white/10 text-primary shadow-sm border border-gray-100 dark:border-white/5">
                    <CreditCardIcon className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-sm font-bold text-foreground font-heading">Monthly Usage</h4>
            </div>

            <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Quizzes</span>
                    <span>12 / 20</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[60%] rounded-full"></div>
                </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-foreground font-bold">8 quizzes</span> remaining in your Basic Plan.
            </p>

            <Link to="/dashboard/settings" className="mt-3 w-full text-xs font-bold text-primary hover:text-primary/80 transition-colors text-left flex items-center gap-1">
                Upgrade Plan <ArrowRightIcon className="w-3 h-3" />
            </Link>
        </motion.div>
    )
}

const UserAccount = () => {
    const { open, animate } = useSidebar();
    const { user } = useAuth();

    if (!user) return null;

    const initials = user.username ? user.username.substring(0, 2).toUpperCase() : 'U';

    return (
        <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group cursor-pointer",
            open ? "hover:bg-white dark:hover:bg-white/5 hover:shadow-sm hover:border-gray-100 dark:hover:border-white/5 border border-transparent" : "justify-center"
        )}>
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 dark:bg-white/10 border border-black/5 dark:border-white/10 flex items-center justify-center text-foreground font-bold text-xs">
                {initials}
            </div>

            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex items-center justify-between overflow-hidden"
                >
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground truncate">{user.username}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>

                    <button className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors" title="Switch Account">
                        <ArrowsRightLeftIcon className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </div>
    )
}