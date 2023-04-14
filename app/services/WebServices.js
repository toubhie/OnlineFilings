import { makeGetRequest, makePostRequest, getHeaderConfig } from "./AxiosMethods";
import constants from "../helpers/constants";

import {
    errorMessage, status,
} from '../helpers/status';

export async function makeLoginRequest(res, username, password) {
    let config = {
        headers: {
            user_id: username,
            password: password
        }
      }

    try {
        let loginResult = await makePostRequest((await constants()).frontend_login_url, null, config);

        if (loginResult != null && typeof loginResult !== 'undefined') {
            console.log(loginResult.data);

            return loginResult.data;
        } else {
            errorMessage.error = 'Cannot reach authentication service';
            errorMessage.code = 'ENSVC-9018';

            return res.status(status.notfound).send(errorMessage);
        }
    } catch (error) {
        console.log(error);
    }
}
