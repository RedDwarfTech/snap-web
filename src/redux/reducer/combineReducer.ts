import { combineReducers } from 'redux';
import file from './file/FileReducer';
import { rdRootReducer } from 'rd-component';
import photo from "@/redux/reducer/photo/PhotoReducer";

const rootReducer = combineReducers({
    file,
    photo,
    rdRootReducer
});

export default rootReducer;
