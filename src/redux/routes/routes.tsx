import { createBrowserRouter } from "react-router-dom";
import Home from "@/page/home/Home";
import { PaySuccess } from "rd-component";

const routes = createBrowserRouter([
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/product/pay/success",
        element: <PaySuccess />,
    },
]);

export default routes;

