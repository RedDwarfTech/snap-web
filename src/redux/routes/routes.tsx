import Home from "@/page/home/Home";
import { createBrowserRouter } from "react-router-dom";


const routes = createBrowserRouter([
    {
        path: "/",
        element: <Home/>
    }
]);

export default routes;