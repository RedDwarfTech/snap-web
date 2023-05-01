import withConnect from "@/component/hoc/withConnect";
import { useState } from "react";
import './ChangeBgColor.css';
import FileUploader from "@/component/upload/FileUploader";
import { IUploadedFile } from "@/models/UploadedFile";
import prevPic from "@/resource/image/nohpic.jpg";
import { doUpload, uploadBackgroundImage } from "@/service/FileService";
import { Button, message } from "antd";
import { RdColor, RdFile } from "rdjs-wheel";
import { useSelector } from "react-redux";
import React from "react";
import { PhotoResponse } from "@/models/photo/PhotoResponse";
import { PayService, doPay } from "rd-component";
import store from "@/redux/store/store";
import Pay from "@/page/pay/Pay";

const ChangeBgColor: React.FC = (props: any) => {

    const [bgColor, setBgColor] = useState('#ffffff');
    const [isPayed, setIsPayed] = useState<boolean>(false);
    const [photoUrl, setPhotoUrl] = useState<File | null>();
    const [bgRemovedUrl, setBgRemovedUrl] = useState<string>();
    const [uploadedFile, setUploadedFile] = useState<IUploadedFile | null>();
    const { photo } = useSelector((state: any) => state.photo)
    const [remBgPhoto, setRemBgPhoto] = useState<PhotoResponse>();
    const { formText } = useSelector((state: any) => state.rdRootReducer.pay);
    const [payForm, setPayForm] = useState<String>('');
    const { order } = useSelector((state: any) => state.rdRootReducer.pay);

    React.useEffect(() => {
        if (photo && Object.keys(photo).length > 0) {
            setRemBgPhoto(photo);
        }
    }, [photo]);

    React.useEffect(() => {
        if (order && order.id) {
            setIsPayed(true);
        }
    }, [order]);

    React.useEffect(() => {
        if (formText && formText.length > 0) {
            setPayForm(formText);
        }
    }, [formText]);

    const onGetPhotoUrl = (file: File) => {
        if (file) {
            RdFile.fileToBase64(file).then(async (result: string) => {
                try {
                    const uploadParams = {
                        base64Image: result
                    };
                    uploadBackgroundImage(uploadParams);
                } catch (err) {
                    console.log(err);
                }
            });
        }
    }

    const bgColorClick = (event: any) => {
        switch (event) {
            case 'red':
                setBgColor('#FF0000');
                break;
            case 'blue':
                setBgColor('#0000FF');
                break;
            default:
                message.warning("不支持的背景颜色");
                break;
        }
    }

    const renderPreview = () => {
        const baseUrl = 'data:image/png;base64,' + remBgPhoto?.foreground;
        return (
            <div className="snap-crop-preview">
                <img id="removed-img" src={remBgPhoto?.foreground ? baseUrl : prevPic} style={{ backgroundColor: bgColor }} ></img>
            </div>
        );
    }

    if (props && props.file && props.file.rembgfile && Object.keys(props.file.rembgfile).length > 0) {
        if (!bgRemovedUrl || bgRemovedUrl != props.file.rembgfile) {
            setBgRemovedUrl(props.file.rembgfile);
        }
    }

    const handlePrePay = () => {
        let payReq = {
            productId: 20
        };
        doPay(payReq, store);
    }

    const downloadImpl = () => {
        if (!isPayed) {
            handlePrePay();
            return;
        }
        const element = document.getElementById('removed-img') as HTMLImageElement;
        if (!element) {
            return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = element.naturalWidth;
        canvas.height = element.naturalHeight;
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }
        context.drawImage(element as HTMLImageElement, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        if (bgColor !== "origin") {
            const pixelData = imageData.data;
            const rgba = RdColor.colorToRGBA(bgColor);
            if (!rgba) {
                message.warning("不支持的背景色");
                return;
            }
            const r = rgba[0];
            const g = rgba[1];
            const b = rgba[2];
            for (let i = 0; i < pixelData.length; i += 4) {
                const red = pixelData[i];
                const green = pixelData[i + 1];
                const blue = pixelData[i + 2];
                const alpha = pixelData[i + 3];

                // 判断当前像素是否为背景颜色
                if (red === 0 && green === 0 && blue === 0 && alpha === 0) {
                    pixelData[i] = r;
                    pixelData[i + 1] = g;
                    pixelData[i + 2] = b;
                    pixelData[i + 3] = 255;
                }
            }
        }
        context.putImageData(imageData, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'image.png';
        link.click();
    }

    return (
        <div className="bgchange-container">
            <h2>证件照换底色</h2>
            <div>
                <div className="crop-intro">
                    <FileUploader onGetPhotoUrl={(value) => onGetPhotoUrl(value)} ></FileUploader>
                </div>
                {renderPreview()}
                <div className="photo-bg">
                    <span>底色：</span>
                    <div className="photo-bg-choice">
                        <div className="photo-bg-red" onClick={() => bgColorClick('red')}></div>
                        <div className="photo-bg-blue" onClick={() => bgColorClick('blue')}></div>
                    </div>
                </div>
                <Button type="primary" onClick={() => downloadImpl()}>下载</Button>
            </div>
            <Pay></Pay>
            <div id="pay-mask" className="pay-mask"></div>
            <div id="pay-popup" className="popup">
                <div className="pay-container" id="main">
                    <div className="pay-money">支付金额&nbsp;&nbsp;<span id="pay_price">2.00元</span></div>
                    <div>
                        <div className="pay-img">
                            <img id="pay_qrcode" src="https://a9h.cn/addons/zzzy_idcard_pc/core/web/uploads/20230501/644f748c133cd.png" alt="" />
                        </div>
                    </div>
                    <p className="pay-paragraph">
                        <img className="pay-scan" src="/addons/zzzy_idcard_pc/core/web/statics/images/site/icon-wechat.png" alt="" />微信扫码支付
                    </p>
                </div>
            </div>
        </div>
    );
}

export default withConnect(ChangeBgColor);