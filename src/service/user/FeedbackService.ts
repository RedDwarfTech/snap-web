import { UserActionType, requestWithActionType } from "rd-component";
import store from '@/redux/store/store';

export function submitFeedback(params: any) {
    const config = {
        method: 'post',
        url: '/post/user/feedback/submit',
        headers: {'Content-Type': 'application/json'},
        data: JSON.stringify(params)
    };
    const actionTypeString: string = UserActionType[UserActionType.GET_CURRENT_USER];
    return requestWithActionType(config, actionTypeString,store);
}
