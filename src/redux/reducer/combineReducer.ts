import { combineReducers } from 'redux';
import { rdRootReducer } from 'rd-component';
import photo from "@/redux/reducer/photo/PhotoReducer";

const rootReducer = combineReducers({
    photo,
    rdRootReducer
});

export default rootReducer;
