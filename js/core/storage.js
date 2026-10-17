// core/storage.js — localStorage wrapper plus the persistent settings and player PROFILE objects.
const store={get(k,d){try{const v=localStorage.getItem('aaasweep.'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem('aaasweep.'+k,JSON.stringify(v));}catch(e){}}};
const _st=store.get('settings',{});
export const settings=Object.assign({master:.9,music:.5,voice:1,sfx:.8,subs:true,chatter:'normal',grain:true,sway:true,muted:false,blood:true},_st);
if(_st.sv!==2){if(_st.chatter==='constant')settings.chatter='normal';settings.sv=2;}
export const PROFILE=Object.assign({xp:0,lvl:1,coins:250,skill:0,perks:{},owned:{red:true},skin:'red',boostUntil:0,ach:{},gs:0,lore:0,maxField:1},store.get('profile',{}));
export function saveSettings(){store.set('settings',settings);}
export function saveProfile(){store.set('profile',PROFILE);}
export const ownedSkins=()=>['gold','chrome','tune'].filter(k=>PROFILE.owned[k]).length;
