import store from "@/redux/store/store";
import { requestWithActionType } from "rd-component";
import { PhotoActionType } from "@/redux/action/photo/PhotoAction";
import { AxiosRequestConfig } from "axios";
import { FileActionType } from "rd-component";
import { RdColor } from "rdjs-wheel";
import { message } from "antd";

export function uploadBackgroundImage(params: any) {
    const config: AxiosRequestConfig = {
        method: 'post',
        url: '/snap/photo/rembg',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(params)
    };
    const actionTypeString: string = PhotoActionType[PhotoActionType.REM_BACKGROUND];
    return requestWithActionType(config, actionTypeString, store);
}

export function doUpload(params: any, url: string) {
    const config = {
        method: 'post',
        url: url,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(params)
    };
    const actionTypeString: string = FileActionType[FileActionType.UPLOAD_FILE];
    return requestWithActionType(config, actionTypeString, store);
}

export function getDownloadFileUrl(fid: string,bgColor: string) {
    // https://stackoverflow.com/questions/76190591/how-about-to-use-encodeuricomponent-to-encode-key-and-parameter/76190600
    const params = new URLSearchParams({
        id: fid,
        bgColor
    });
    const config = {
        method: 'get',
        url: '/snap/photo/download?' + params,
    };
    const actionTypeString: string = FileActionType[FileActionType.DOWNLOAD_FILE];
    return requestWithActionType(config, actionTypeString, store);
}

export function clearPhoto() {
    const actionTypeString: string = FileActionType[FileActionType.FILE_CLEAR];
    const action = {
        type: actionTypeString,
        data: null
    };
    store.dispatch(action);
}


export function downloadPhoto(bgColor: string, imgId: string) {
    const element = document.getElementById(imgId) as HTMLImageElement;
    if (!element) {
        return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = element.naturalWidth;
    canvas.height = element.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) {
        return;
    }
    context.imageSmoothingEnabled = true;
    context.drawImage(element as HTMLImageElement, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    if (bgColor !== "origin") {
        const pixelData = imageData.data;
        const rgba = RdColor.colorToRGBA(bgColor);
        if (!rgba) {
            message.warning("不支持的背景色");
            return;
        }
        const r = rgba[0];
        const g = rgba[1];
        const b = rgba[2];
        for (let i = 0; i < pixelData.length; i += 4) {
            const red = pixelData[i];
            const green = pixelData[i + 1];
            const blue = pixelData[i + 2];
            const alpha = pixelData[i + 3];
            if (red === 0 && green === 0 && blue === 0 && alpha === 0) {
                pixelData[i] = r;
                pixelData[i + 1] = g;
                pixelData[i + 2] = b;
                pixelData[i + 3] = 255;
            }else if(red <160 && green < 160 && blue < 160 && alpha === 0){
                pixelData[i] = r;
                pixelData[i + 1] = g;
                pixelData[i + 2] = b;
                pixelData[i + 3] = 0;
            }
        }
    }
    context.putImageData(imageData, 0, 0);
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'image.png';
    link.click();
}

export function downloadPhotoLegacy(bgColor: string, imgId: string) {
    const element = document.getElementById(imgId) as HTMLImageElement;
    if (!element) {
        return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = element.naturalWidth;
    canvas.height = element.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) {
        return;
    }
    context.imageSmoothingEnabled = true;
    context.drawImage(element as HTMLImageElement, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    if (bgColor !== "origin") {
         // 设置背景色
         context.fillStyle = '#ff0000';
        // 设置绘制模式为覆盖
        context.globalCompositeOperation = 'destination-over';
        // 绘制背景色
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.putImageData(imageData, 0, 0);
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'image.png';
    link.click();
}

export function saveBase64AsFile(base64String: string, fileName: string)  {
    const b64toBlob = (b64: string, type: string): Blob => {
      const byteString = atob(b64.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: type });
    }
    const blob = b64toBlob(base64String, 'image/png');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
}