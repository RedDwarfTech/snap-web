import React from "react";
import { connect } from "react-redux";
import "./PaySuccess.css"
import queryString from 'query-string';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';
import { RequestHandler, ResponseHandler } from "js-wheel";
import { getCurrentUser } from "@/service/user/UserService";

const PaySuccess: React.FC = (props) => {

    const location = useLocation();

    const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

    if(location.search ==null){
        return (<div className="pay-success-container">
            <h1>支付失败！</h1>
        </div>);
    }
    // 回调的链接可能是这样的格式https://read.poemhub.top/product/pay/success?orderId=619464963527516160&amp;payAmount=0.01&amp;sign_type=RSA2&amp;timestamp=2023-03-09%2002:21:56&amp;version=1.0
    // &amp;是为了兼容老旧的浏览器
    // 现代浏览器已经不再需要将 & 编码为 &amp;，但一些较旧版本的浏览器和遗留系统可能仍然需要这样做。
    const parsed = queryString.parse(location.search.replace(/&amp;/g, '&'));
    if(parsed != null && parsed.orderId && parsed.payAmount){
        RequestHandler.handleAccessTokenExpire();
        getCurrentUser().then((data: any) => {
            if(ResponseHandler.responseSuccess(data)){
                localStorage.setItem("userInfo", JSON.stringify(data.result));
            }
        });
      return (<div className="pay-success-container">
      <h1>支付成功！</h1>
      <p>您的订单已经成功支付。</p>
      <p>订单号：{parsed.orderId}</p>
      <p>支付金额：${parsed.payAmount}</p>
      <p>支付时间：{currentTime}</p>
  </div>);
    }else{
        return (<div className="pay-success-container">
            <h1>支付失败！</h1>
        </div>);
    }
}

const mapStateToProps = (state: { pay: any; }) => ({
pay: state.pay
});

const mapDispatchToProps = (dispatch: (arg0: any) => void) => {
return {
    createOrder: () => {
    
    }
};
};
  
export default connect(mapStateToProps, mapDispatchToProps)(PaySuccess);
  
