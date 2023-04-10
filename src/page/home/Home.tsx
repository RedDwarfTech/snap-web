import withConnect from "@/component/hoc/withConnect";
import "./Home.css";
import prevPic from "@/resource/image/nohpic.jpg";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { doUpload, getDownloadFileUrl } from "@/service/FileService";
import { IUploadedFile } from "@/models/UploadedFile";
import SnapHeader from "@/component/header/SnapHeader";
import About from "../about/About";
import store from "@/redux/store/store";
import { fileClearAction } from "@/redux/action/file/FileAction";
import { ICropParams } from "@/models/request/photo/CropParams";
import { Select, Space } from "antd";
import { v4 as uuid } from 'uuid';

const { Option } = Select;


const Home: React.FC = (props: any) => {

    const [photoUrl, setPhotoUrl] = useState<File | null>();
    const [uploadedFile, setUploadedFile] = useState<IUploadedFile | null>();
    const inputRef = useRef<HTMLInputElement>(null);
    const [currentMenu, setCurrentMenu] = useState<String>('photo');
    const [photoType, setPhotoType] = useState<String[]>([]);

    useEffect(() => {
        readPhotoType();
    }, []);

    if (props && props.file && Object.keys(props.file.file).length > 0) {
        if (!uploadedFile || uploadedFile.file_id !== props.file.file.file_id) {
            setUploadedFile(props.file.file)
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
        const formData = new FormData();
        if (photoUrl) {
            const cropParams: ICropParams = {
                crop: false
            };
            formData.append('file', photoUrl);
            formData.append('params', JSON.stringify(cropParams));
            // Object.keys(cropParams).forEach((key) => formData.append(key, cropParams[key as keyof ICropParams].toString()));
            doUpload(formData);
        }
    }

    const clearPhotho = () => {
        store.dispatch(fileClearAction(null))
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

    const handleFileChangeBtnClick = () => {
        if (inputRef && inputRef.current) {
            inputRef.current.click();
        }
    }

    const renderPreview = () => {
        if (uploadedFile && uploadedFile.watermark_path) {
            return (
                <div className="snap-preview">
                    <img src={uploadedFile.watermark_path} ></img>
                </div>
            );
        }
        return (
            <div className="snap-preview">
                <img src={photoUrl ? URL.createObjectURL(photoUrl) : prevPic} ></img>
            </div>
        );
    }

    const onHeaderMenuClick = (menu: String) => {
        setCurrentMenu(menu);
    }

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


    const renderPage = () => {
        if (currentMenu === "photo") {
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
                                    placeholder="请选择照片尺寸"
                                    style={{ width: '85%' }}>{renderPhotoTypeImpl()}
                                </Select>
                            </div>
                            <div className="photo-bg">
                                <span>背景色：</span>
                                <div className="photo-bg-choice">
                                    <div className="photo-bg-red"></div>
                                    <div className="photo-bg-blue"></div>
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
        } else if (currentMenu === "about") {
            return (<About></About>);
        } else {
            return (<div>开发中，敬请期待...</div>);
        }
    }


    return (
        <div>
            <SnapHeader onMenuClick={(value: String) => onHeaderMenuClick(value)}></SnapHeader>
            {renderPage()}
        </div>
    );
}

export default withConnect(Home);
