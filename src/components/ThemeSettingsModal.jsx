import { useState } from "react";
import { useTheme } from "../hooks/useTheme";

export default function ThemeSettingsModal() {
  const { theme: currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const themes = [
    { id: "light", name: "Light", icon: "☀️" },
    { id: "dark", name: "Dark", icon: "🌙" },
    { id: "cupcake", name: "Cupcake", icon: "🧁" },
  ];
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn btn-ghost btn-circle"
        aria-label="Open theme settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>
      
      <dialog id="theme_modal" className={`modal ${isOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Choose Theme</h3>
          
          <div className="grid grid-cols-3 gap-4">
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => {
                  setTheme(themeOption.id);
                  setIsOpen(false);
                }}
                className={`btn btn-outline h-full flex flex-col items-center py-6 gap-2 ${
                  currentTheme === themeOption.id ? "btn-primary" : ""
                }`}
              >
                <span className="text-2xl">{themeOption.icon}</span>
                <span>{themeOption.name}</span>
              </button>
            ))}
          </div>
          
          <div className="modal-action">
            <button className="btn" onClick={() => setIsOpen(false)}>Close</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setIsOpen(false)}>Close</button>
        </form>
      </dialog>
    </>
  );
}