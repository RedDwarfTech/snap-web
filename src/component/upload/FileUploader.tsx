import { useRef, useState } from "react";
import './FileUploader.css';
import { UserService } from "rd-component";
import { message } from "antd";

export type FileUploaderProps = {
    onGetPhotoUrl: (url: File) => void;
    loginRequired: boolean;
};

const FileUploader: React.FC<FileUploaderProps> = (props: FileUploaderProps) => {

    const inputRef = useRef<HTMLInputElement>(null);
    const [_, setPhotoUrl] = useState<File | null>();

    const handleFileChange = (event: any) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        if (file) {
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setPhotoUrl(file);
                props.onGetPhotoUrl(file);
            };
        }
    }

    const handleFileChangeBtnClick = () => {
        if (props.loginRequired) {
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

    return (
        <div className="snap-uploader">
            <button onClick={() => handleFileChangeBtnClick()}>选择文件</button>
            <input type="file" hidden onChange={(e) => handleFileChange(e)} ref={inputRef}></input>
        </div>
    );
}

export default FileUploader;
