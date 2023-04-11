import withConnect from "@/component/hoc/withConnect";
import { useState } from "react";
import './ChangeBgColor.css';
import FileUploader from "@/component/upload/FileUploader";
import { IUploadedFile } from "@/models/UploadedFile";
import prevPic from "@/resource/image/nohpic.jpg";
import { doUpload } from "@/service/FileService";
import { fileRemBgAction } from "@/redux/action/file/FileAction";

const ChangeBgColor: React.FC = (props: any) => {

    const [bgColor, setBgColor] = useState('#ffffff');
    const [photoUrl, setPhotoUrl] = useState<File | null>();
    const [bgRemovedUrl, setBgRemovedUrl] = useState<string>();
    const [uploadedFile, setUploadedFile] = useState<IUploadedFile | null>();

    const onGetPhotoUrl = (file: File) => {
        const formData = new FormData();
        if (file) {
            formData.append('file', file);
            doUpload(formData, '/snap/rembg', fileRemBgAction);
        }
    }

    const redBgClick = (event: any) => {
        setBgColor('#FF0000');
    }

    const blueBgClick = (event: any) => {
        setBgColor('#0000FF');
    }

    const renderPreview = () => {
        return (
            <div className="snap-crop-preview">
                <img src={bgRemovedUrl ? bgRemovedUrl: prevPic} style ={{backgroundColor:bgColor}} ></img>
            </div>
        );
    }

    if (props && props.file && props.file.rembgfile && Object.keys(props.file.rembgfile).length > 0) {
        if(!bgRemovedUrl||bgRemovedUrl != props.file.rembgfile){
            setBgRemovedUrl(props.file.rembgfile);
        }
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
                        <div className="photo-bg-red" onClick={redBgClick}></div>
                        <div className="photo-bg-blue" onClick={blueBgClick}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default withConnect(ChangeBgColor);