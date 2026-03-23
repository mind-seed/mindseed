import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";

function App() {
  const router = createBrowserRouter([]);
  return <RouterProvider router={router} />;
}

export default App;
