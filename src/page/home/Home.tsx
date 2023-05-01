import withConnect from "@/component/hoc/withConnect";
import "./Home.css";
import SnapHeader from "@/component/header/SnapHeader";
import About from "../about/About";
import GenPhoto from "../photo/gen/GenPhoto";
import { useState } from "react";
import ChangeBgColor from "../photo/bgcolor/ChangeBgColor";
import Goods from "../goods/Goods";

const Home: React.FC = (props: any) => {

    const [currentMenu, setCurrentMenu] = useState<String>('photo');

    const onHeaderMenuClick = (menu: String) => {
        setCurrentMenu(menu);
    }

    const renderPage = () => {
        if (currentMenu === "photo") {
            return <GenPhoto></GenPhoto>
        } else if (currentMenu === "about") {
            return (<About></About>);
        } else if (currentMenu === "bgcolor") {
            return (<ChangeBgColor></ChangeBgColor>);
        } else if (currentMenu === "vip") {
            return (<Goods></Goods>);
        }else {
            return (<div>开发中，敬请期待...</div>);
        }
    }

    return (
        <div>
            <SnapHeader onMenuClick={(value: String) => onHeaderMenuClick(value)}></SnapHeader>
            {renderPage()}
        </div>
    );
}

export default withConnect(Home);
