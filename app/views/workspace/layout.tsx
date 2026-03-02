import Sidebar from '@/app/components/sideBar'
import Topbar from '@/app/components/topBar'
import React from 'react'
import Dashboard from './dashboard';
import Tags from './tags';
import Projects from './projects';
import TasksPage from './tasks';
import Calendar from './calander';

export default function Layout(): React.JSX.Element {
    const [workspaceView, setWorkspaceView] = React.useState<"dashboard" | "tags" | "projects" | "tasks" | "calendar">("dashboard");

    const handleViewChange = (view: "dashboard" | "tags" | "projects" | "tasks" | "calendar") => {
        setWorkspaceView(view);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar handleViewChange={handleViewChange} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Topbar />
                <div className="flex-1 overflow-y-auto">
                    {
                        (() => {
                            switch (workspaceView) {
                                case "dashboard":
                                    return <Dashboard />;
                                case "tags":
                                    return <Tags />;
                                case "projects":
                                    return <Projects />;
                                case "tasks":
                                    return <TasksPage />;
                                case "calendar":
                                    return <Calendar />;
                                default:
                                    return null;
                            }
                        })()
                    }
                </div>
            </div>
        </div>
    )
}
