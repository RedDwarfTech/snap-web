import { useRef, useState } from "react";
import './FileUploader.css';

export type FileUploaderProps = {
    onGetPhotoUrl: (url: File) => void;
};

const FileUploader: React.FC<FileUploaderProps> = (props: any) => {

    const inputRef = useRef<HTMLInputElement>(null);
    const [photoUrl, setPhotoUrl] = useState<File | null>();

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
