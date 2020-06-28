export const url = '/canyin/pos/bill/moremethodandservewayv2'
export function trans(data) {
    return data.code === '1' ? {
        success: true,
        data: {data}
    } : {
        success: false,
        errCode: data.errCode,
        msg: data.msg
    }
}
