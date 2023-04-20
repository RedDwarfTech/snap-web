import axios from 'axios';
import { v4 as uuid } from 'uuid';
import { ResponseHandler, WheelGlobal } from 'js-wheel';
import store from '@/redux/store/store';
import { message } from 'antd';

const instance = axios.create({
  timeout: 60000
})

instance.defaults.headers.post['Content-Type'] = 'application/json'

instance.interceptors.request.use((request) => {
  const accessToken = localStorage.getItem(WheelGlobal.ACCESS_TOKEN_NAME);
  accessToken && (request.headers['x-access-token'] = accessToken);
  request.headers['x-request-id'] = uuid();
  return request
},
  (error: any) => {
    return Promise.reject(error)
  }
)

let isRefreshing = false
instance.interceptors.response.use((response) => {
  if (!isRefreshing) {
    ResponseHandler.handleWebCommonFailure(response.data);
  }
  if (!ResponseHandler.responseSuccess(response.data)) {
    message.info(response.data.msg);
  }
  return response;
},
  (error: any) => { return Promise.reject(error) }
)

export function requestWithAction(config: any, action: (arg0: any) => any) {
  return instance(config).then(
    (response: {
      data: {
        url: string; result: any;
      };
    }) => {
      const data = response.data.result;
      if (ResponseHandler.responseSuccess(response.data)) {
        store.dispatch(action(data));
      }
      return response.data;
    }
  ).catch(
    (error: any) => {
      console.error(error);
    }
  );
}