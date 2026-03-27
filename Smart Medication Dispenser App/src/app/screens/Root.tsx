import { Outlet } from 'react-router';
import { AppProvider } from '../context/AppContext';
import { Toaster } from 'sonner';
import { TutorialOverlay } from '../components/TutorialOverlay';

export function Root() {
  return (
    <AppProvider>
      <div className="h-screen w-full overflow-hidden bg-[#F8F9FA]">
        <Outlet />
        <TutorialOverlay />
        <Toaster position="top-center" />
      </div>
    </AppProvider>
  );
}
