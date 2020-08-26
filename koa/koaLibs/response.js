let response = {
    _body: '',
    get body(){
        return this._body;
    },
    set body(newVal){
        // console.log('newVal:',newVal)
        this._body = newVal;
    }
}

module.exports = response;