export const cn=(...a:(string|false|undefined|null)[])=>a.filter(Boolean).join(' ');
export const pretty=(ts:any)=>{try{return new Date(ts).toLocaleString()}catch{return String(ts)}};
