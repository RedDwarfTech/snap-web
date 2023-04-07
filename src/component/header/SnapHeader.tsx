import { Avatar, Button, Dropdown } from "antd";
import React, { useState } from "react";
import { connect } from "react-redux";
import type { MenuProps } from 'antd';
import "./SnapHeader.css"
import { doLoginOut, getCurrentUser, userLoginImpl } from "@/service/user/UserService";
import { IUserModel, WheelGlobal } from "js-wheel";
import { readConfig } from "@/config/app/config-reader";

export type HeaderFormProps = {
  onMenuClick: (menu: String) => void;
};

const SnapHeader: React.FC<HeaderFormProps> = (props) => {

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') || false);
  const [isGetUserLoading, setIsGetUserLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<IUserModel>();

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

  const showUserProfile = () => {
    handleMenuClick('profile');
  }

  const items: MenuProps['items'] = [
    {
      key: '2',
      onClick: doLoginOut,
      label: (
        <a>
          登出
        </a>
      )
    }, {
      key: '3',
      onClick: showUserProfile,
      label: (
        <a>
          控制台
        </a>
      )
    }]


  const renderLogin = () => {
    if (isLoggedIn) {
      var avatarUrl = localStorage.getItem('avatarUrl');
      if (avatarUrl) {
        return (<a>
          <Dropdown menu={{ items }} trigger={['click']}>
            <Avatar size={40} src={avatarUrl} />
          </Dropdown>
        </a>);
      } else {
        return (<a>
          <Dropdown menu={{ items }} trigger={['click']}>
            <Avatar size={40} >Me</Avatar>
          </Dropdown>
        </a>);
      }
    }
    const accessTokenOrigin = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
    if (accessTokenOrigin) {
      const accessTokenCookie = accessTokenOrigin.split("=")[1];
      const refreshTokenCookie = document.cookie.split('; ').find(row => row.startsWith('refreshToken='))?.split("=")[1];
      const avatarUrlCookie = document.cookie.split('; ').find(row => row.startsWith('avatarUrl='))?.split("=")[1];
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem(WheelGlobal.ACCESS_TOKEN_NAME, accessTokenCookie);
      localStorage.setItem(WheelGlobal.REFRESH_TOKEN_NAME, refreshTokenCookie ? refreshTokenCookie : "");
      localStorage.setItem('avatarUrl', avatarUrlCookie ? avatarUrlCookie : "");
      localStorage.setItem(WheelGlobal.BASE_AUTH_URL, readConfig("baseAuthUrl"));
      localStorage.setItem(WheelGlobal.ACCESS_TOKEN_URL_PATH, readConfig("accessTokenUrlPath"));
      loadCurrentUser();
      setIsLoggedIn(true);
    }
    return (<Button name='aiLoginBtn' onClick={userLogin}>登录</Button>);
  }

  const loadCurrentUser = () => {
    if(!localStorage.getItem("userInfo") && isGetUserLoading === false){
      setIsGetUserLoading(true);
      getCurrentUser().then((data:any)=>{
        setUserInfo(data.result);
        localStorage.setItem("userInfo",JSON.stringify(data.result));
        setIsGetUserLoading(false);
      });
    }
  }

  return (
  <header>
    <div>
      <nav>
        <a onClick={() => handleMenuClick('photo')}>证件照制作</a>
        {/* <a onClick={() => handleMenuClick('account')}>证件照换底色</a> */}
        <a onClick={() => handleMenuClick('about')}>关于</a>
        {renderLogin()}
      </nav>
    </div>
  </header>);
}

const mapStateToProps = (state: any) => ({
  robot: state.robot
});

const mapDispatchToProps = (dispatch: any) => {
  return {

  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SnapHeader);

