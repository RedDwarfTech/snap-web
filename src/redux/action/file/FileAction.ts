import { IUploadedFile } from "@/models/UploadedFile";

export function fileAction(data: IUploadedFile) {
    return {
        type: "UPLOAD_FILE",
        file: data
    };
}

export function fileDownloadAction(data: any) {
    return {
        type: "DOWNLOAD_FILE",
        file: data
    };
}