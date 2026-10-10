// Shared appendix in the supplied combined audit: paraphrases, NOT exact quotes.
const prompts=[
 ['Meaningful background/identity/interest/talent; explain why application is incomplete without it.','Важная часть биографии, идентичности, интересов или таланта: почему без неё заявка была бы неполной.'],
 ['Challenge/set back/failure; effect and lesson.','Трудность, неудача или провал: влияние и извлечённый урок.'],
 ['Question/challenge belief; what prompted it and outcome.','Сомнение или вызов убеждению: что побудило и каков результат.'],
 ['Unexpected gratitude for someone’s action; effect/motivation.','Неожиданная благодарность за чей-то поступок: влияние и мотивация.'],
 ['Accomplishment/event/realisation producing growth and new understanding.','Достижение, событие или осознание, вызвавшие рост и новое понимание.'],
 ['Absorbing topic; why captivating and how/who helps learning.','Захватывающая тема: почему увлекает, как и с чьей помощью узнаёте больше.'],
 ['Topic of choice: an existing/new essay or another prompt.','Свободная тема: уже написанное или новое эссе, либо ответ на другой вопрос.']
];
export function addCommonEssayAppendix(u,catalog) {
 if(!['audit-cmuq','audit-nyuad'].includes(u.id))return;
 const fields={
  'Common App 2026–27 — choose ONE (audit paraphrases)':'Common App 2026–27 — выбрать ОДИН вопрос (пересказы audit)',
  'Option':'Вариант','Prompt (audit paraphrase)':'Вопрос (пересказ audit)',
  'These are faithful semantic structures, not verbatim official quotes. Standard 250–650 words is a previous-cycle UI reference; check the current live counter. Optional Additional Information/context fields do not automatically become extra required essays.':'Это точные смысловые структуры, не дословные официальные цитаты. Стандартные 250–650 слов — справка UI прошлого цикла; проверить текущий счётчик. Необязательные Additional Information/context не становятся автоматически дополнительными обязательными эссе.'
 };
 for(const [en,ru]of [...Object.entries(fields),...prompts]){catalog[en]??={en,ru};u.localizedText[en]=catalog[en];}
 u.blocks.push({id:u.id+'-b3-common-essay-appendix',title:Object.keys(fields)[0],tab:'essays',analysis:false,paragraphs:[Object.keys(fields)[3]],lists:[],tables:[{columns:['Option','Prompt (audit paraphrase)'],rows:prompts.map(([en,ru],i)=>({id:u.id+'-b3-common-prompt-'+i,fields:{Option:String(i+1),'Prompt (audit paraphrase)':en},prompt:{officialPrompt:null,promptRu:ru,sourceEnglish:en,sourceField:'Prompt (audit paraphrase)',wording:'paraphrase'}}))}]});
}
