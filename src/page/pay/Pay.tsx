import React, { useState } from "react";
import "./Pay.css"
import withConnect from "@/component/hoc/withConnect";
import { useSelector } from "react-redux";

const Pay: React.FC = () => {

  const { formText } = useSelector((state: any) => state.rdRootReducer.pay);
  const [payFrame, setPayFrame] = useState('');

  React.useEffect(() => {
    if (formText) {
      setPayFrame(formText);
    }
  }, [formText]);

  if (formText && formText.length > 0) {
    return (
      <div>
        <iframe srcDoc={payFrame}
          width="600"
          height="600"
          frameBorder="no"
          scrolling="no"
        ></iframe>
      </div>
    );
  }
  else {
    return (<div></div>);
  }
}

export default withConnect(Pay);
