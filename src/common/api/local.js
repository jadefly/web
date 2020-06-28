const path = 'static/api/';

const format = mod => `${path}${mod}.json`;

export const POSMAINDATA = format('pos-main-data');
export const POSORDERCONFIG = format('pos-order-config');
export const POSORDERTABLES = format('pos-order-tables');
export const POSBOOKINGORDERS = format('pos-booking-orders');
export const POSOFFWORK = format('pos-offwork');
export const POSMOREMODULE = format('pos-more-module');
export const LOADBILL = id => format(`pos-order-bill/${id}`);
export const POSORDERBILLMORE = format('pos-order-bill/more-bill');
export const POSORDERITEMS = format('pos-order-menu');
export const TABLE = format('table');
export const POSORDERITEMSIZE = format('pos-order-item-size');
export const POSORDERPKGNORMAL = format('pos-order-pkg-normal');
export const POSORDERPKGPart = format('pos-order-pkg-part');
