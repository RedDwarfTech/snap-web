import { useSelector } from "react-redux";
import "./Goods.css"
import { useState } from "react";
import BaseMethods from "rdjs-wheel/dist/src/utils/data/BaseMethods";
import { Divider } from "antd";
import React from "react";
import { v4 as uuid } from 'uuid';
import withConnect from "@/component/hoc/withConnect";
import { IapProduct, doGetIapProduct } from "rd-component";
import store from "@/redux/store/store";

const Goods: React.FC = () => {

  const { iapproducts } = useSelector((state: any) => state.rdRootReducer.iapproduct);
  const { formText } = useSelector((state: any) => state.rdRootReducer.pay);
  const [_, setPayFrame] = useState<string>('');
  const [products, setProducts] = useState<IapProduct[]>([]);

  React.useEffect(() => {
    getGoods();
  }, []);

  React.useEffect(() => {
    if (iapproducts && iapproducts.length > 0) {
      setProducts(iapproducts);
    }
  }, [iapproducts]);

  React.useEffect(() => {
    if (formText && formText.length > 0) {
      setPayFrame(formText);
    }
  }, [formText]);

  const getGoods = () => {
    doGetIapProduct(store);
  }

  const productSubMenu = (serverDataSource: IapProduct[]) => {
    if (BaseMethods.isNull(serverDataSource)) {
      return (<div></div>);
    }
    const productSubList: JSX.Element[] = [];
    serverDataSource.sort((a: IapProduct, b: IapProduct) => b.sort - a.sort)
      .forEach((item: IapProduct) => {
        productSubList.push(
          <div key={uuid()} className="package">
            <h2>{item.productTitle}</h2>
            <p className="price">{item.price}<span>元</span></p>
            <ul>
              {vipItems(item.description)}
            </ul>
          </div>);
      });
    return productSubList;
  }

  const vipItems = (items: string) => {
    const parsedItmes = JSON.parse(items);
    if (parsedItmes) {
      const itemList: JSX.Element[] = [];
      parsedItmes.forEach((item: string) => {
        itemList.push(<li key={uuid()}>{item}</li>);
      });
      return itemList;
    }
  }

  return (
    <div className="product-body">
      <div className="product-container">
        {productSubMenu(products)}
      </div>
      <Divider></Divider>
    </div>
  );
}

export default withConnect(Goods);

