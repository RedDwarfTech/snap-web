
const initState = {
    file: {},
    downloadfile: {},
    rembgfile: {}
};

const FileReducer = (state=initState, action) => {
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
                file: {}
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


