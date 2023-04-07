import { requestWithAction } from "@/net/XHRClient";
import { getCurrentUserAction } from "@/redux/action/user/UserAction";


export function submitFeedback(params: any) {
    const config = {
        method: 'post',
        url: '/post/user/feedback/submit',
        headers: {'Content-Type': 'application/json'},
        data: JSON.stringify(params)
    };
    return requestWithAction(config, getCurrentUserAction);
}
