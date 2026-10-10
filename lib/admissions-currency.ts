import type {AdmissionsLocale} from './admissions-dates';
import {formatAdmissionsDate} from './admissions-dates';
import type {ApplicationFee} from './admissions-card-facts';
export interface ExchangeRateConfig {updatedAt:string|null;source:string|null;rates:Record<string,number>}
// No source-backed FX rates were supplied. Native fees remain authoritative.
// Set KZT per one unit (USD, HKD, KRW, AED, QAR, SAR) only with a source and date.
export const EXCHANGE_RATES:ExchangeRateConfig={updatedAt:null,source:null,rates:{}};
export function formatNativeFee(fee:ApplicationFee,locale:AdmissionsLocale) {
 if(fee.amount===null||!fee.currency)return locale==='ru'?'Сбор пока не опубликован · TBA':'Fee not yet published · TBA';
 return `${fee.currency} ${new Intl.NumberFormat(locale==='ru'?'ru-RU':'en-US',{maximumFractionDigits:2}).format(fee.amount)}`;
}
export function approximateKzt(fee:ApplicationFee,locale:AdmissionsLocale,config=EXCHANGE_RATES):string|null {
 if(fee.amount===null||!fee.currency||fee.currency==='KZT'||!config.updatedAt||!config.source||!/^\d{4}-\d{2}-\d{2}$/.test(config.updatedAt))return null;
 const rate=config.rates[fee.currency];if(!Number.isFinite(rate)||rate<=0)return null;
 const amount=new Intl.NumberFormat(locale==='ru'?'ru-RU':'en-US',{maximumFractionDigits:0}).format(fee.amount*rate);
 return `≈ ${amount} ₸ · ${locale==='ru'?'курс обновлён':'rate updated'} ${formatAdmissionsDate(config.updatedAt,locale,true)}`;
}
