import { requestWithAction } from "@/net/XHRClient";
import { fileDownloadAction } from "@/redux/action/file/FileAction";
import { Action, ActionCreator } from "redux";

export function doUpload(formData: FormData, url: string, action: ActionCreator<Action>) {
    const config = {
        method: 'post',
        url: url,
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formData
    };
    return requestWithAction(config, action);
}


export function getDownloadFileUrl(fid: string) {
    const config = {
        method: 'get',
        url: '/snap/download?fid=' + fid,
    };
    return requestWithAction(config, fileDownloadAction);
}