import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import useThemeStore from './store/themeStore';

function App() {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return <RouterProvider router={router} />;
}

export default App;
