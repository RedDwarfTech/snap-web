import { Avatar, Button } from "antd";
import React, { useState } from "react";
import "./SnapHeader.css"
import { doLoginOut, getCurrentUser, userLoginImpl } from "@/service/user/UserService";
import { AuthHandler, IUserModel } from "rdjs-wheel";
import { readConfig } from "@/config/app/config-reader";
import { LogoutOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import withConnect from "../hoc/withConnect";

export type HeaderFormProps = {
  onMenuClick: (menu: String) => void;
};

const SnapHeader: React.FC<HeaderFormProps> = (props) => {

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') || false);
  const [isGetUserLoading, setIsGetUserLoading] = useState(false);
  const [_, setUserInfo] = useState<IUserModel>();
  const { loginUser } = useSelector((state: any) => state.rdRootReducer.user)

  React.useEffect(() => {
    if (loginUser && Object.keys(loginUser).length > 0) {
      AuthHandler.storeLoginAuthInfo(loginUser,readConfig("baseAuthUrl"),readConfig("accessTokenUrlPath"));
      loadCurrentUser();
      setIsLoggedIn(true);
    }
  }, [loginUser]);

  const handleMenuClick = (menu: string) => {
    props.onMenuClick(menu);
  };

  const userLogin = () => {
    let param = {
      appId: readConfig("appId")
    };
    userLoginImpl(param).then((data: any) => {
      window.location.href = data.result;
    });
  }

  const avatarClick = () => {
    const dropdown = document.getElementById("dropdown");
    if (dropdown) {
      if (dropdown.style.display == "none" || dropdown.style.display == "") {
        dropdown.style.display = "block";
      } else {
        dropdown.style.display = "none";
      }
    }
  }

  const renderLogin = () => {
    if (isLoggedIn) {
      var avatarUrl = localStorage.getItem('avatarUrl');
      return (
        <a id="user-menu">
          {avatarUrl ? <Avatar size={40} src={avatarUrl} onClick={avatarClick} /> : <Avatar onClick={avatarClick} size={40} >Me</Avatar>}
          <div id="dropdown" className="dropdown-content">
            {/**<div onClick={showUserProfile}><ControlOutlined /><span>控制台</span></div>**/}
            <div onClick={doLoginOut}><LogoutOutlined /><span>登出</span></div>
          </div>
        </a>);
    }
    const accessTokenOrigin = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
    if (accessTokenOrigin) {
      AuthHandler.storeCookieAuthInfo(accessTokenOrigin, readConfig("baseAuthUrl"), readConfig("accessTokenUrlPath"));
      loadCurrentUser();
      setIsLoggedIn(true);
    }
    return (<Button name='aiLoginBtn' onClick={userLogin}>登录</Button>);
  }

  const loadCurrentUser = () => {
    if (!localStorage.getItem("userInfo") && isGetUserLoading === false) {
      setIsGetUserLoading(true);
      getCurrentUser().then((data: any) => {
        setUserInfo(data.result);
        localStorage.setItem("userInfo", JSON.stringify(data.result));
        setIsGetUserLoading(false);
      });
    }
  }

  return (
    <header>
      <div>
        <nav>
          <a onClick={() => handleMenuClick('photo')}>证件照制作</a>
          <a onClick={() => handleMenuClick('bgcolor')}>证件照换底色</a>
          <a onClick={() => handleMenuClick('about')}>关于</a>
          {renderLogin()}
        </nav>
      </div>
    </header>);
}

export default withConnect(SnapHeader);

