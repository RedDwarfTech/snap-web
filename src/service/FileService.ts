import { requestWithAction } from "@/net/XHRClient";
import { fileAction, fileDownloadAction } from "@/redux/action/file/FileAction";

export function doUpload(formData: FormData) {
    const config = {
        method: 'post',
        url: '/snap/upload',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formData
    };
    return requestWithAction(config, fileAction);
}


export function getDownloadFileUrl(fid: string) {
    const config = {
        method: 'get',
        url: '/snap/download?fid=' + fid,
    };
    return requestWithAction(config, fileDownloadAction);
}