import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Apply theme to HTML element with proper transition handling
  useEffect(() => {
    const applyTheme = () => {
      // First add the transition class
      document.documentElement.classList.add("theme-transition");
      
      // Force a reflow before changing the theme
      document.documentElement.offsetHeight;
      
      // Then update the theme
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
      
      // Remove transition class after transition completes
      const transitionTimeout = setTimeout(() => {
        document.documentElement.classList.remove("theme-transition");
      }, 600); // slightly longer than transition duration
      
      return () => clearTimeout(transitionTimeout);
    };
    
    // Small delay to ensure DOM is ready
    requestAnimationFrame(applyTheme);
  }, [theme]);
  
  // Listen for OS theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e) => {
      // Only change if user hasn't manually set a preference
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    
    // Use the correct event listener method based on browser support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // For older browsers
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        // For older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Toggle between light and dark
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
  
  // Set to a specific theme
  const setSpecificTheme = (newTheme) => {
    if (["light", "dark", "cupcake"].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme: setSpecificTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};