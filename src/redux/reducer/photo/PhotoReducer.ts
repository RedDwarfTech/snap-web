const initState = {
    photo: {}
};

const PhotoReducer = (state=initState, action: any) => {
    switch (action.type) {  
        case "REM_BACKGROUND":
            return {
                ...state,
                photo: action.data 
            };
        default:
            break;
    }
    return state;
};

export default PhotoReducer;


