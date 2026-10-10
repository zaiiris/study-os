import type {OfficialUniversity} from './admissions-types';
// Raw attachments are local-only in Git. The retained source section is enough
// to download an original university chapter even from a fresh checkout.
export function downloadUniversitySource(university:OfficialUniversity) {
 const url=URL.createObjectURL(new Blob([university.sourceSection],{type:'text/markdown;charset=utf-8'}));
 const anchor=document.createElement('a');anchor.href=url;anchor.download=`${university.id}-${university.checkedAt}.md`;
 document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
