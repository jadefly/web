function sushu(m){
    let flag=[];
    let n = 100000; ////数的规模大一点，确保在范围之内
    for(let i=2;i<n/2;i++) {
        if(flag[i] == true) {//不用管合数的倍数
            continue;
        }
        for(let j=2;j<=n/i;j++) {
            if(i*j<n) {//剔掉素数的倍数们
                flag[i*j] = true;
            }
        }
    }
    
    let count = 0;
    for(let i=2;i<n;i++) {
        console.log('i:',i, flag[i])
        if(!flag[i]) {
            count ++;				
        }
        if(count == m) {
            console.log(i)
            break;
        }
    }
}


sushu(4)

