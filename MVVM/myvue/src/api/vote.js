import axios from './http'
function voteadd(){
    return axios.post('/insert');
}


export default {
    voteadd
}