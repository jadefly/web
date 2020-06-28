export const url = '/canyin/sys/syshabit/updatehabit';
export function trans(data) {
  return data.success ? {
    success: true,
    data,
  } : {
    success: false,
    data: null,
  };
}
