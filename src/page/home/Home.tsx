import withConnect from "@/component/hoc/withConnect";
import "./Home.css";
import prevPic from "@/resource/image/nohpic.jpg";
import { MouseEventHandler, useRef, useState } from "react";
import { doUpload, getDownloadFileUrl } from "@/service/FileService";
import { IUploadedFile } from "@/models/UploadedFile";
import SnapHeader from "@/component/header/SnapHeader";
import About from "../about/About";

const Home: React.FC = (props: any) => {

    const [photoUrl, setPhotoUrl] = useState<File | null>();
    const [uploadedFile, setUploadedFile] = useState<IUploadedFile>();
    const inputRef = useRef<HTMLInputElement>(null);
    const [currentMenu, setCurrentMenu] = useState<String>('photo');

    if (props && props.file && Object.keys(props.file.file).length > 0) {
        if (!uploadedFile || uploadedFile.file_id !== props.file.file.file_id) {
            setUploadedFile(props.file.file)
        }
    }

    const handleFileChange = (event: any) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        if(file){
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
            formData.append('file', photoUrl);
            doUpload(formData);
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
                        <button onClick={reuploadFile}>重新上传</button>
                        <form onSubmit={handleSubmit}>
                            <button type="submit">生成</button>
                        </form>
                        <button onClick={downloadFile}>下载</button>
                    </div>
                </div>
            </div>);
        } else if (currentMenu === "about") {
            return (<About></About>);
        }else{
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