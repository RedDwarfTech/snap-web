import { WheelGlobal } from 'js-wheel';
import { readConfig } from '../../config/app/config-reader';
import { requestWithAction } from '@/net/XHRClient';
import { getCurrentUserAction, userLogin } from '@/redux/action/user/UserAction';

export function getCurrentUser() {
    const config = {
        method: 'get',
        url: '/post/user/current-user',
        headers: {'Content-Type': 'application/json'}
    };
    return requestWithAction(config, getCurrentUserAction);
}

export function userLoginImpl(params: any) {
    const config = {
        method: 'get',
        url: '/post/alipay/login/getQRCodeUrl',
        headers: {'Content-Type': 'application/json'},
        params: params
    };
    return requestWithAction(config, userLogin);
}

export function isLoggedIn(){
    const accessToken = localStorage.getItem(WheelGlobal.ACCESS_TOKEN_NAME);
    if(accessToken == null){
        return false;
    }else{
        return true;
    }
}

export function doLoginOut() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem(WheelGlobal.ACCESS_TOKEN_NAME);
    localStorage.removeItem(WheelGlobal.REFRESH_TOKEN_NAME);
    localStorage.removeItem('avatarUrl');
    localStorage.removeItem('userInfo');

    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'avatarUrl=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href=  readConfig("logoutUrl");;
}