import "./GenPhoto.css";
import prevPic from "@/resource/image/nohpic.jpg";
import { MouseEventHandler, useRef, useState } from "react";
import { clearPhoto, doUpload, downloadPhoto, downloadPhotoLegacy, getDownloadFileUrl } from "@/service/FileService";
import { IUploadedFile } from "@/models/UploadedFile";
import store from "@/redux/store/store";
import { ICropParams } from "@/models/request/photo/CropParams";
import { Select, Space, message } from "antd";
import { v4 as uuid } from 'uuid';
import { useSelector } from "react-redux";
import withConnect from "@/component/hoc/withConnect";
import { REST, RdFile, ResponseHandler } from "js-wheel";
import React from "react";
import { IOrder, OrderService, PayService, doPay } from "rd-component";
import Pay from "@/page/pay/Pay";
import uploadIcon from "@/resource/image/idmaker/upload_icon.png";
import { UserService } from "rd-component";
import { unwatchFile } from "fs";

const { Option } = Select;

const GenPhoto: React.FC = () => {

    const [photoUrl, setPhotoUrl] = useState<String>();
    const [originPhoto, setOriginPhoto] = useState<String>();
    const [generated, setGenerated] = useState<boolean>(false);
    const [photoSize, setPhotoSize] = useState<string>();
    const [uploadedFile, setUploadedFile] = useState<IUploadedFile | null>();
    const inputRef = useRef<HTMLInputElement>(null);
    const [photoType, setPhotoType] = useState<String[]>([]);
    const { file } = useSelector((state: any) => state.rdRootReducer.file)
    const [bgColor, setBgColor] = useState('#438edb');
    const [downloadFileId, setDownloadFileId] = useState<string>('');
    const [isPaying, setIsPaying] = useState<boolean>(false);
    const [createdOrderInfo, setCreatedOrderInfo] = useState<{ formText: string, orderId: string }>();
    const { createdOrder } = useSelector((state: any) => state.rdRootReducer.pay);

    React.useEffect(() => {
        if (file && Object.keys(file).length > 0) {
            setPhotoUrl(file.markedPhoto);
            setGenerated(true);
            setDownloadFileId(file.fileId);
        }
    }, [file]);

    React.useEffect(() => {
        if (createdOrder && Object.keys(createdOrder).length > 0) {
            setCreatedOrderInfo(createdOrder);
        }
    }, [createdOrder]);

    React.useEffect(() => {
        readPhotoType();
    }, []);

    const readPhotoType = () => {
        fetch('./phototype.txt')
            .then(response => response.text())
            .then(contents => {
                let dataArray: string[] = contents.split("\n");
                setPhotoType(dataArray);
            })
            .catch(error => console.error(error));
    }

    const renderPhotoTypeImpl = () => {
        const photoList: JSX.Element[] = [];
        if (photoType && photoType.length > 0) {
            photoType.forEach(item => {
                const pType = item.trim();
                if (pType && pType.length > 0) {
                    const photoTypeContent = pType.split(',');
                    const showText = photoTypeContent[0] + '(' + photoTypeContent[1] + 'cm *' + photoTypeContent[2] + 'cm)';
                    photoList.push(
                        <Option key={uuid()} value={item} label={item}>
                            <Space>
                                {showText}
                            </Space>
                        </Option>);
                }
            });
        }
        return photoList;
    }

    const handlePrePay = () => {
        if (process.env.NODE_ENV === 'production') {
            let payReq = {
                productId: 21
            };
            doPay(payReq, store);
        } else {
            const order: IOrder = {
                id: downloadFileId
            };
            PayService.setPayedInfo(order, store);
        }
    }

    const downloadFile = () => {
        if (!isPaying && !createdOrderInfo) {
            setIsPaying(true);
            handlePrePay();
        }
        if (createdOrderInfo && createdOrderInfo.orderId != null) {
            const orderId = createdOrderInfo.orderId;
            if (orderId) {
                OrderService.getOrderStatus(orderId, store).then((resp: any) => {
                    if (ResponseHandler.responseSuccess(resp)) {
                        if (Number(resp.result.orderStatus) === 1) {
                            setIsPaying(false);
                            downloadImpl();
                        }
                    }
                });
            }
        }
    }

    const downloadImpl = () => {
        if (downloadFileId) {
            getDownloadFileUrl(downloadFileId).then((data) => {
                if (data && data.result) {
                    setPhotoUrl(data.result.idPhoto);
                    downloadPhotoLegacy(bgColor, "gen-preview");
                }
            });
        }
    }

    const reuploadFile: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setPhotoUrl('');
        setOriginPhoto('');
        setIsPaying(false);
        setCreatedOrderInfo(undefined);
        setGenerated(false);
        if (inputRef && inputRef.current) {
            inputRef.current.value = '';
            clearPhotho();
            setUploadedFile(null);
        }
    }

    const onGetPhotoUrl = (file: File) => {
        if (!file) {
            return;
        }
        RdFile.fileToBase64(file).then(async (result: string) => {
            try {
                setOriginPhoto(result);
            } catch (err) {
                console.log(err);
            }
        });
    }

    const handleSubmit = (event: any) => {
        event.preventDefault();
        if (originPhoto === undefined || !originPhoto) {
            message.info("请选择文件");
            return;
        }
        if (!photoSize || photoSize.trim().length === 0) {
            message.info("请选择证件照尺寸");
            return;
        }
        const width = (parseFloat(photoSize.split(",")[1].trim()) * 300) / 2.54;
        const height = (parseFloat(photoSize.split(",")[2].trim()) * 300) / 2.54;
        if (originPhoto) {
            const cropParams: ICropParams = {
                base64Image: originPhoto,
                width: parseInt(width.toString()),
                height: parseInt(height.toString())
            };
            doUpload(cropParams, '/snap/photo/id/gen');
        }
    }

    const clearPhotho = () => {
        clearPhoto();
    }

    const renderPreview = () => {
        return (
            <div className="snap-preview">
                <div className="snap-preview-header">证件照</div>
                {photoUrl ? <img id="gen-preview" src={photoUrl ? photoUrl.toString() : prevPic} style={{ backgroundColor: bgColor }}></img> : <div className="gen-preview-div"></div>}
            </div>
        );
    }

    const renderUploadImage = () => {
        if (generated) {
            return (<button onClick={downloadFile}>下载</button>);
        } else {
            return (
                <form onSubmit={handleSubmit}>
                    <button type="submit">生成</button>
                </form>
            );
        }
    }

    const handleSelectChange = (e: any) => {
        setPhotoSize(e);
    }

    const bgColorClick = (event: any) => {
        switch (event) {
            case 'red':
                setBgColor('#FF0000');
                break;
            case 'blue':
                setBgColor('#438edb');
                break;
            default:
                message.warning("不支持的背景颜色");
                break;
        }
    }

    const handleFileChange = (event: any) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        if (file) {
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setOriginPhoto(file);
                onGetPhotoUrl(file);
            };
        }
    }
    const handleFileChangeBtnClick = () => {
        if (true) {
            const isLoggedIn = UserService.isLoggedIn();
            if (!isLoggedIn) {
                message.info("请先登录");
                return;
            }
        }
        if (inputRef && inputRef.current) {
            inputRef.current.click();
        }
    }

    const renderOriginPhoto = () => {
        if (originPhoto) {
            return (
                <img className="origin-img-preview" src={originPhoto.toString()}></img>
            );
        } else {
            return (
                <div className="upload-area" onClick={() => handleFileChangeBtnClick()}>
                    <img src={uploadIcon}></img>
                    <input type="file" hidden onChange={(e) => handleFileChange(e)} ref={inputRef}></input>
                </div>
            );
        }
    }

    return (
        <div className="snap-container">
            <div className="snap-oper">
                <div className="snap-preview-area">
                    <div className="snap-upload">
                        <div className="snap-upload-header">上传图片</div>
                        <div className={originPhoto ? "snap-upload-impl" : "snap-upload-impl-dash"}>
                            {renderOriginPhoto()}
                        </div>
                    </div>
                    {renderPreview()}
                </div>
                <div className="snap-oper-btn">
                    <div className="snap-params">
                        <div className="photo-size">
                            <span>尺寸：</span>
                            <Select
                                onChange={handleSelectChange}
                                placeholder="请选择照片尺寸"
                                style={{ width: '85%' }}>{renderPhotoTypeImpl()}
                            </Select>
                        </div>
                        <div className="photo-bg">
                            <span>背景色：</span>
                            <div className="photo-bg-choice">
                                <div className="photo-bg-red" onClick={() => bgColorClick('red')}></div>
                                <div className="photo-bg-blue" onClick={() => bgColorClick('blue')}></div>
                            </div>
                        </div>
                    </div>
                    <div className="snap-action-impl">
                        <button onClick={reuploadFile}>重新上传</button>
                        {renderUploadImage()}
                    </div>
                    <Pay></Pay>
                </div>
            </div>
        </div>
    );
}

export default withConnect(GenPhoto);