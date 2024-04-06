import GraphContainer from "./components/Graph";
import "./App.css";
import {
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";


const fetchURL = (currentLayoutName: string): string => {
  return `./exporter/out/${currentLayoutName}_layout.json`
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <GraphContainer fetchURL={fetchURL} />
      </>
    ),
  },
  // {
  //   path: "/exporter",
  //   element: (
  //     <>
  //       <LayoutEditor />
  //     </>
  //   ),
  // },
  // {
  //   path: "/exporter/preview",
  //   element: (
  //     <>
  //       <GraphContainer />
  //     </>
  //   ),
  // },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
