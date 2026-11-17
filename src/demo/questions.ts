export interface Question { id:string; prompt:string; options:string[]; answer:number; explanation:string; }
export const questions: Question[] = [
  {id:'state',prompt:'Which React feature remembers a value between renders?',options:['A CSS class','The useState hook','A local variable inside render'],answer:1,explanation:'useState retains a value between renders and provides a setter that requests an update.'},
  {id:'json',prompt:'What does JSON help an application do?',options:['Store and exchange structured data','Encrypt passwords automatically','Style a web page'],answer:0,explanation:'JSON is a text format for structured data. It does not provide encryption or visual styling.'},
  {id:'keys',prompt:'What makes a good key for a list of project cards?',options:['A new random number every render','The current time','A stable, unique project ID'],answer:2,explanation:'A stable ID helps React identify each item when the list changes or gets filtered.'},
];
export function scoreAnswers(answers:Record<string,number>) { return questions.filter(question => answers[question.id] === question.answer).length; }
