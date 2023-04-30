import { WheelGlobal } from 'rdjs-wheel';
import { readConfig } from '@/config/app/config-reader';
import { UserActionType, requestWithActionType } from 'rd-component';
import store from '@/redux/store/store';

export function getCurrentUser() {
    const config = {
        method: 'get',
        url: '/post/user/current-user',
        headers: {'Content-Type': 'application/json'}
    };
    const actionTypeString: string = UserActionType[UserActionType.GET_CURRENT_USER];
    return requestWithActionType(config, actionTypeString,store);
}

export function userLoginImpl(params: any) {
    const config = {
        method: 'get',
        url: '/post/alipay/login/getQRCodeUrl',
        headers: {'Content-Type': 'application/json'},
        params: params
    };
    const actionTypeString: string = UserActionType[UserActionType.USER_LOGIN];
    return requestWithActionType(config, actionTypeString,store);
}

export function userLoginByPhoneImpl(params: any) {
    const config = {
        method: 'post',
        url: '/snap/user/login',
        headers: {'Content-Type': 'application/json'},
        data: JSON.stringify(params)
    };
    const actionTypeString: string = UserActionType[UserActionType.LOGIN_BY_PHONE];
    return requestWithActionType(config, actionTypeString,store);
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