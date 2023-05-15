import "./GenPhoto.css";
import prevPic from "@/resource/image/nohpic.jpg";
import { MouseEventHandler, useRef, useState } from "react";
import { clearPhoto, doUpload, getDownloadFileUrl, saveBase64AsFile } from "@/service/FileService";
import store from "@/redux/store/store";
import { Alert, Checkbox, Col, Modal, Row, Select, Space, Spin, message } from "antd";
import { v4 as uuid } from 'uuid';
import { useSelector } from "react-redux";
import withConnect from "@/component/hoc/withConnect";
import { RdFile, ResponseHandler } from "rdjs-wheel";
import React from "react";
import { OrderService, doPay } from "rd-component";
import { Pay } from "rd-component";
import uploadIcon from "@/resource/image/idmaker/upload_icon.png";
import { UserService } from "rd-component";
import 'rd-component/dist/style.css';
import { ICropParams } from "@/models/request/photo/CropParams";
import { bgColors } from "@/config/app/app-config";
import ColorUtil from "@/utils/ColorUtil";
import { FileService } from "rd-component";

const { Option } = Select;

const GenPhoto: React.FC = () => {

    const [photoUrl, setPhotoUrl] = useState<String>();
    const [originPhoto, setOriginPhoto] = useState<String>();
    const [generated, setGenerated] = useState<boolean>(false);
    const [photoSize, setPhotoSize] = useState<string>();
    const [printPhotoSize, setPrintPhotoSize] = useState<string>();
    const inputRef = useRef<HTMLInputElement>(null);
    const [photoType, setPhotoType] = useState<String[]>([]);
    const [printPhotoType, setPrintPhotoType] = useState<String[]>([]);
    const { file } = useSelector((state: any) => state.rdRootReducer.file)
    const [bgColor, setBgColor] = useState('#438edb');
    const [downloadFileId, setDownloadFileId] = useState<string>('');
    const [formText, setFormText] = useState<string>('');
    const [isPaying, setIsPaying] = useState<boolean>(false);
    const [createdOrderInfo, setCreatedOrderInfo] = useState<{ formText: string, orderId: string }>();
    const { createdOrder } = useSelector((state: any) => state.rdRootReducer.pay);
    const [loading, setLoading] = useState(false);
    const [downloadType, setDownloadType] = useState(0);

    React.useEffect(() => {
        if (file && Object.keys(file).length > 0) {
            setPhotoUrl(file.markedPhoto);
            setGenerated(true);
            setDownloadFileId(file.fileId);
            setLoading(false);
        }
    }, [file]);

    React.useEffect(() => {
        if (createdOrder && Object.keys(createdOrder).length > 0 && createdOrder.formText) {
            setCreatedOrderInfo(createdOrder);
            setFormText(createdOrder.formText);
        }
    }, [createdOrder]);

    React.useEffect(() => {
        readPhotoType("./phototype.txt").then((photoType) => {
            setPhotoType(photoType);
        });
        readPhotoType("./printphototype.txt").then((printPhotoType) => {
            setPrintPhotoType(printPhotoType);
        });
    }, []);

    const readPhotoType = async (photoTypeName: string): Promise<string[]> => {
        try {
            const response = await fetch(photoTypeName);
            const contents = await response.text();
            const dataArray: string[] = contents.split("\n");
            return dataArray;
        } catch (error) {
            console.error(error); return [];
        }
    }

    const renderPhotoTypeImpl = (photoTypeInput: String[]) => {
        const photoList: JSX.Element[] = [];
        if (photoTypeInput && photoTypeInput.length > 0) {
            photoTypeInput.forEach(item => {
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
        let payReq = {
            productId: 21
        };
        doPay(payReq, store);
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
        if (downloadFileId && bgColor) {
            if (downloadType === 0) {
                getDownloadFileUrl(downloadFileId, bgColor).then((data) => {
                    if (data && data.result) {
                        saveBase64AsFile(data.result.idPhoto, "证件照-" + Date.now().toString());
                    }
                });
            }
            if (downloadType === 1) {
                if(!printPhotoSize) {
                    message.warning("");
                    return;
                }
                const printWidth = (parseFloat(printPhotoSize.split(",")[1].trim()) * 300) / 2.54 ;
                const printHeight =  (parseFloat(printPhotoSize.split(",")[2].trim()) * 300) / 2.54;
                const params = new URLSearchParams({
                    bgColor: bgColor,
                    fileId: downloadFileId,
                    printWidth: parseInt(printWidth.toString()).toString(),
                    printHeight: parseInt(printHeight.toString()).toString()
                });
                FileService.downloadZipFile(params).then((response: any) => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', '证件照+排版照.zip');
                    document.body.appendChild(link);
                    link.click();
                });
            }
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
            setLoading(true);
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

    const handlePrintPhotoSelectChange = (e: any) => {
        setPrintPhotoSize(e);
    }

    const bgColorClick = (color: string) => {
        setBgColor(color);
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

    const payComplete = () => {
        if (!createdOrderInfo || !createdOrderInfo.orderId) {
            message.error("未找到订单信息");
            return;
        }
        const orderId = createdOrderInfo.orderId;
        OrderService.getOrderStatus(orderId, store).then((resp: any) => {
            if (ResponseHandler.responseSuccess(resp)) {
                if (Number(resp.result.orderStatus) === 1) {
                    setFormText('');
                } else {
                    message.warning("检测到订单当前未支付，请稍后再次确认");
                }
            } else {
                message.warning("订单检测失败");
            }
        });
    }

    const renderBgElement = () => {
        const bgColorList: JSX.Element[] = [];
        bgColors.forEach((item) => {
            let selected = ColorUtil.compareColor(item, bgColor);
            bgColorList.push(
                <div key={uuid()} className={selected ? "photo-bg-marker-selected" : "photo-bg-marker"}>
                    <div className="photo-bg-element" style={{ backgroundColor: item }} onClick={() => bgColorClick(item)}></div>
                </div>);
        });
        return bgColorList;
    }

    const renderDownloadType = () => {
        if (generated) {
            return (
                <Row style={{ marginBottom: '0px' }} justify="space-around" align="middle">
                    <Col style={{ textAlign: 'right' }} span={8}><span>下载类型：</span></Col>
                    <Col span={16}>
                        <Checkbox onClick={() => setDownloadType(0)} checked={downloadType === 0 ? true : false} >证件照</Checkbox>
                        <Checkbox onClick={() => setDownloadType(1)} checked={downloadType === 1 ? true : false}>证件照 + 排版照</Checkbox>
                    </Col>
                </Row>
            );
        }
    }

    const renderPrintPhotoCbx = () => {
        if (downloadType === 1) {
            return (
                <Row style={{ marginBottom: '0px' }} justify="space-around" align="middle">
                    <Col style={{ textAlign: 'right' }} span={8}><span>相纸尺寸：</span></Col>
                    <Col span={16}>
                        <Select
                            onChange={handlePrintPhotoSelectChange}
                            placeholder="请选择相纸尺寸"
                            style={{ width: '85%' }}>{renderPhotoTypeImpl(printPhotoType)}
                        </Select>
                    </Col>
                </Row>
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
                        <Row style={{ marginBottom: '20px' }} justify="space-around" align="middle">
                            <Col style={{ textAlign: 'right' }} span={8}><span>证件照尺寸：</span></Col>
                            <Col span={16}>
                                <Select
                                    onChange={handleSelectChange}
                                    placeholder="请选择照片尺寸"
                                    style={{ width: '85%' }}>{renderPhotoTypeImpl(photoType)}
                                </Select>
                            </Col>
                        </Row>
                        <Row style={{ marginBottom: '25px' }} justify="space-around" align="middle">
                            <Col style={{ textAlign: 'right' }} span={8}><span>背景色：</span></Col>
                            <Col span={16}>
                                <div className="photo-bg-choice">
                                    {renderBgElement()}
                                </div>
                            </Col>
                        </Row>
                        {renderDownloadType()}
                        {renderPrintPhotoCbx()}
                    </div>
                    <div className="snap-action-impl">
                        <button onClick={reuploadFile}>重新上传</button>
                        {renderUploadImage()}
                    </div>
                    <Modal open={loading} footer={null} closable={false}>
                        <Spin tip="生成中..." size="large">
                            <Alert
                                message="生成证件照需要3-10s左右，请稍等..."
                                description="生成证件照过程中遇到问题？可联系客服QQ：479175365"
                                type="info"
                            />
                        </Spin>
                    </Modal>
                    <Pay payFormText={formText}
                        price="2.00"
                        onPayComplete={payComplete}
                        payProvider="支付宝"></Pay>
                </div>
            </div>
        </div>
    );
}

export default withConnect(GenPhoto);