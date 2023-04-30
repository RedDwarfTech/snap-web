import { requestWithAction } from "@/net/XHRClient";
import { FileActionType, fileDownloadAction } from "@/redux/action/file/FileAction";
import { Action, ActionCreator } from "redux";
import store  from "@/redux/store/store";
import { requestWithActionType } from "rd-component";
import { PhotoActionType } from "@/redux/action/photo/PhotoAction";

export function uploadBackgroundImage(params: any){
    const config = {
        method: 'post',
        url: '/snap/photo/rembg',
        headers: {'Content-Type': 'application/json'},
        data: JSON.stringify(params)
    };
    const actionTypeString: string = PhotoActionType[PhotoActionType.REM_BACKGROUND];
    return requestWithActionType(config, actionTypeString, store);
}

export function doUpload(formData: FormData, url: string, action: ActionCreator<Action>) {
    const config = {
        method: 'post',
        url: url,
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formData
    };
    const actionTypeString: string = FileActionType[FileActionType.UPLOAD_FILE];
    return requestWithActionType(config, actionTypeString, store);
}


export function getDownloadFileUrl(fid: string) {
    const config = {
        method: 'get',
        url: '/snap/download?fid=' + fid,
    };
    return requestWithAction(config, fileDownloadAction);
}