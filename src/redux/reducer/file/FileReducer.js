
const initState = {
    file: {},
    downloadfile: {},
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
        default:
            break;
    }
    return state;
};

export default FileReducer;


