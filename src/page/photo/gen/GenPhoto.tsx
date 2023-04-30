import "./GenPhoto.css";
import prevPic from "@/resource/image/nohpic.jpg";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { doUpload, getDownloadFileUrl } from "@/service/FileService";
import { IUploadedFile } from "@/models/UploadedFile";
import store from "@/redux/store/store";
import { fileAction, fileClearAction } from "@/redux/action/file/FileAction";
import { ICropParams } from "@/models/request/photo/CropParams";
import { Select, Space, message } from "antd";
import { v4 as uuid } from 'uuid';
import { useSelector } from "react-redux";
import withConnect from "@/component/hoc/withConnect";

const { Option } = Select;


const GenPhoto: React.FC = (props: any) => {

    const [photoUrl, setPhotoUrl] = useState<File | null>();
    const [photoSize, setPhotoSize] = useState<string>();
    const [uploadedFile, setUploadedFile] = useState<IUploadedFile | null>();
    const inputRef = useRef<HTMLInputElement>(null);
    const [photoType, setPhotoType] = useState<String[]>([]);
    const { rembgfile,downloadfile,file } = useSelector((state:any) => state.file)
    const [bgColor, setBgColor] = useState('#ffffff');

    useEffect(()=>{
        if(!file|| Object.keys(file).length===0){
            setPhotoUrl(null);
            setUploadedFile(null);
        }
    },[rembgfile,downloadfile,file]);

    useEffect(() => {
        readPhotoType();
    }, []);

    //if (props && props.file && Object.keys(props.file.file).length > 0) {
    //    if (!uploadedFile || uploadedFile.file_id !== props.file.file.file_id) {
            //setUploadedFile(props.file.file)
    //    }
    //}

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

    const handleFileChangeBtnClick = () => {
        if (inputRef && inputRef.current) {
            inputRef.current.click();
        }
    }

    const downloadFile = () => {
        if (uploadedFile && uploadedFile.file_id) {
            // get the file path
            getDownloadFileUrl(uploadedFile.file_id).then((data) => {
                if (data && data.result) {
                    downloadFileImpl(data.result, "我的证件照")
                }
            });
        }
    }

    const reuploadFile: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setPhotoUrl(null);
        if (inputRef && inputRef.current) {
            inputRef.current.value = '';
            clearPhotho();
            setUploadedFile(null);
        }
    }

    const handleFileChange = (event: any) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        if (file) {
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setPhotoUrl(file);
            };
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
        const formData = new FormData();
        if (photoUrl) {
            const cropParams: ICropParams = {
                crop: false,
                width: parseInt(width.toString()),
                height: parseInt(height.toString())
            };
            formData.append('file', photoUrl);
            formData.append('params', JSON.stringify(cropParams));
            doUpload(formData,'/snap/upload',fileAction);
        }
    }

    const clearPhotho = () => {
        store.dispatch(fileClearAction(null))
    }

    function downloadFileImpl(url: string, filename: string) {
        fetch(url)
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
    }

    const renderPreview = () => {
        if (uploadedFile && uploadedFile.watermark_path) {
            return (
                <div className="snap-preview">
                    <img src={uploadedFile.watermark_path} style={{ backgroundColor: bgColor }}></img>
                </div>
            );
        }
        return (
            <div className="snap-preview">
                <img src={photoUrl ? URL.createObjectURL(photoUrl) : prevPic} ></img>
            </div>
        );
    }

    const renderUploadImage = () => {
        if (uploadedFile && uploadedFile.watermark_path) {
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
                    <button onClick={() => handleFileChangeBtnClick()}>选择文件</button>
                    <input type="file" hidden onChange={(e) => handleFileChange(e)} ref={inputRef}></input>
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