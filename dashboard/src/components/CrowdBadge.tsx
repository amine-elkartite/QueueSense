export function CrowdBadge({value}:{value?:string}){return <span className={`badge crowd-${(value??'LOW').toLowerCase().replace('_','-')}`}>{(value??'LOW').replace('_',' ')}</span>}
