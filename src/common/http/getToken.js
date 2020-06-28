import { post } from './axios';
function getToken() {
	return new Promise((resolve, reject) => {
    post('/canyin/pos/token/getv2').then((res) => {
      resolve(res.data);
    });
  });
}


export default {
  getToken,
};
