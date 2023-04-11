import { AppState } from "@/redux/types/AppState";
import { Action, ActionCreator } from "redux";

const initState: AppState = {
    file: {
        id: 0,
        file_id: '',
        created_time: 0,
        watermark_path: ''
    },
    downloadfile: {},
    rembgfile: {}
};

const FileReducer = (state=initState, action: any) => {
    switch (action.type) {
        case "UPLOAD_FILE":
            return {
                ...state,
                file: action.file 
            };
        case "DOWNLOAD_FILE":
            return {
                ...state,
                downloadfile: action.file 
            };
        case "FILE_CLEAR":
            return {
                ...state,
                file: {},
                rembgfile: {},
                downloadfile: {}
            };
        case "FILE_REMOVE_BG":
            return {
                ...state,
                rembgfile: action.file
            }
        default:
            break;
    }
    return state;
};

export default FileReducer;


