import Home from "@/page/home/Home";
import PaySuccess from "@/page/pay/success/PaySuccess";
import { createBrowserRouter } from "react-router-dom";


const routes = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/product/pay/success",
        element: <PaySuccess />
    },
]);

export default routes;