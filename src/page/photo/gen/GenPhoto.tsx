import "./GenPhoto.css";
import prevPic from "@/resource/image/nohpic.jpg";
import { MouseEventHandler, useRef, useState } from "react";
import { clearPhoto, doUpload, downloadPhoto, getDownloadFileUrl } from "@/service/FileService";
import { IUploadedFile } from "@/models/UploadedFile";
import store from "@/redux/store/store";
import { ICropParams } from "@/models/request/photo/CropParams";
import { Select, Space, message } from "antd";
import { v4 as uuid } from 'uuid';
import { useSelector } from "react-redux";
import withConnect from "@/component/hoc/withConnect";
import FileUploader from "@/component/upload/FileUploader";
import { RdFile } from "js-wheel";
import React from "react";
import { IOrder, PayService, doPay } from "rd-component";

const { Option } = Select;

const GenPhoto: React.FC = () => {

    const [photoUrl, setPhotoUrl] = useState<String>();
    const [generated, setGenerated] = useState<boolean>(false);
    const [photoSize, setPhotoSize] = useState<string>();
    const [uploadedFile, setUploadedFile] = useState<IUploadedFile | null>();
    const inputRef = useRef<HTMLInputElement>(null);
    const [photoType, setPhotoType] = useState<String[]>([]);
    const { file } = useSelector((state:any) => state.rdRootReducer.file)
    const [bgColor, setBgColor] = useState('#ffffff');
    const [payForm, setPayForm] = useState<String>('');
    const [downloadFileId, setDownloadFileId] = useState<string>('');
    const [isPayed, setIsPayed] = useState<boolean>(false);
    const { order } = useSelector((state: any) => state.rdRootReducer.pay);

    React.useEffect(()=>{
        if(file && Object.keys(file).length>0){
            setPhotoUrl(file.markedPhoto);
            setGenerated(true);
            setDownloadFileId(file.fileId);
        }
    },[file]);

    React.useEffect(() => {
        if (order && order.id) {
            setIsPayed(true);
        }
    }, [order]);

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
            if(pType && pType.length > 0) {
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
        }else{
            const order:IOrder = {
                id: downloadFileId
            };
            PayService.setPayedInfo(order,store);
        }        
    }

    const downloadFile = () => {
        if(payForm){
            return;
        }
        if (!isPayed) {
            handlePrePay();
        }else{
            downloadImpl();
        }
    }

    const downloadImpl = ()=>{
        if (downloadFileId) {
            getDownloadFileUrl(downloadFileId).then((data) => {
                if (data && data.result) {
                    setPhotoUrl(data.result.idPhoto);
                    downloadPhoto(bgColor,"gen-preview");
                }
            });
        }
    }

    const reuploadFile: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setPhotoUrl('');
        setGenerated(false);
        if (inputRef && inputRef.current) {
            inputRef.current.value = '';
            clearPhotho();
            setUploadedFile(null);
        }
    }

    const onGetPhotoUrl = (file: File) => {
        if (file) {
            RdFile.fileToBase64(file).then(async (result: string) => {
                try {
                    const uploadParams = {
                        base64Image: result
                    };
                    setPhotoUrl(result);
                } catch (err) {
                    console.log(err);
                }
            });
        }
    }

    const handleSubmit = (event: any) => {
        event.preventDefault();
        if(photoUrl === undefined || !photoUrl){
            message.info("请选择文件");
            return;
        }
        if(!photoSize || photoSize.trim().length === 0) {
            message.info("请选择证件照尺寸");
            return;
        }
        const width = (parseFloat(photoSize.split(",")[1].trim())*300)/2.54;
        const height = (parseFloat(photoSize.split(",")[2].trim())*300)/2.54;
        if (photoUrl) {
            const cropParams: ICropParams = {
                crop: false,
                width: parseInt(width.toString()),
                height: parseInt(height.toString())
            };
            const idMakerParams = {
                base64Image: photoUrl
            };
            doUpload(idMakerParams,'/snap/photo/id/gen');
        }
    }

    const clearPhotho = () => {
        clearPhoto();
    }

    const renderPreview = () => {
        return (
            <div className="snap-preview">
                <img id="gen-preview"  src={photoUrl ? photoUrl.toString() : prevPic} style={{ backgroundColor: bgColor }}></img>
            </div>
        );
    }

    const renderUploadImage = () => {
        if (generated) {
            return (<button onClick={downloadFile}>下载</button>);
        }else{
            return (
                <form onSubmit={handleSubmit}>
                    <button type="submit">生成</button>
                </form>
            );
        }
    }

    const handleSelectChange = (e:any) => {
        setPhotoSize(e);
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

    return (<div className="snap-container">
                <div className="snap-intro">
                    {/* <h3>一键生成证件照</h3><div>支持png文件</div> */}
                    <FileUploader onGetPhotoUrl={(value) => onGetPhotoUrl(value)} loginRequired={true} ></FileUploader>
                </div>
                <div className="snap-oper">
                    {renderPreview()}
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
                    </div>
                </div>
            </div>);
}

export default withConnect(GenPhoto);