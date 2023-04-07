import { combineReducers } from 'redux';
import file from './file/FileReducer';

const rootReducer = combineReducers({
    file
});

export default rootReducer;
