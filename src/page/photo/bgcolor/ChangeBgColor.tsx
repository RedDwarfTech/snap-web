import withConnect from "@/component/hoc/withConnect";
import { useState } from "react";
import './ChangeBgColor.css';
import FileUploader from "@/component/upload/FileUploader";
import prevPic from "@/resource/image/nohpic.jpg";
import { downloadPhoto, uploadBackgroundImage } from "@/service/FileService";
import { Button, message } from "antd";
import { RdFile } from "rdjs-wheel";
import { useSelector } from "react-redux";
import React from "react";
import { doPay } from "rd-component";
import store from "@/redux/store/store";
import Pay from "@/page/pay/Pay";
import { PhotoResponse } from "@/models/photo/PhotoResponse";

const ChangeBgColor: React.FC = (props: any) => {

    const [bgColor, setBgColor] = useState('#ffffff');
    const [isPayed, setIsPayed] = useState<boolean>(false);
    const [bgRemovedUrl, setBgRemovedUrl] = useState<string>();
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

    const prevDownload = () => {
        if(payForm){
            return;
        }
        if (!isPayed) {
            handlePrePay();
        }else{
            downloadPhoto(bgColor,"removed-img");
        }
    }

    const renderDownloadedImage = () => {
        if(!remBgPhoto){
            return <div></div>;
        }
        return (
            <div className="dl">
                <Button type="primary" onClick={() => prevDownload()}>下载</Button>
            </div>
        );
    }

    return (
        <div className="bgchange-container">
            <h2>证件照换底色</h2>
            <div>
                <div className="crop-intro">
                    <FileUploader onGetPhotoUrl={(value) => onGetPhotoUrl(value)} loginRequired={true} ></FileUploader>
                </div>
                {renderPreview()}
                <div className="photo-bg">
                    <span>底色：</span>
                    <div className="photo-bg-choice">
                        <div className="photo-bg-red" onClick={() => bgColorClick('red')}></div>
                        <div className="photo-bg-blue" onClick={() => bgColorClick('blue')}></div>
                    </div>
                </div>
                {renderDownloadedImage()}
            </div>
            <Pay></Pay>         
        </div>
    );
}

export default withConnect(ChangeBgColor);