import { useEffect, useRef, useState } from 'react';
import { questions, scoreAnswers } from './questions';

export default function QuizDemo() {
  const [answers,setAnswers] = useState<Record<string,number>>({});
  const [submitted,setSubmitted] = useState(false);
  const [error,setError] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {heading.current?.focus();}, [submitted]);
  const answered = Object.keys(answers).length;
  function restart() {setAnswers({});setSubmitted(false);setError(false);}
  return <div className="quiz-demo"><h4 ref={heading} tabIndex={-1}>{submitted ? `Your score: ${scoreAnswers(answers)} / ${questions.length}` : 'A little software quiz'}</h4>
    <p className="quiz-note">Three sample questions. This browser demo runs locally; it doesn’t execute the Java CLI or save your answers.</p>
    {submitted ? <div><p role="status">{scoreAnswers(answers) === questions.length ? 'Nicely done. You got them all!' : 'Here’s how each answer works.'}</p><ol className="quiz-review">{questions.map(question => <li key={question.id}><h5>{question.prompt}</h5><span className={answers[question.id] === question.answer ? 'answer-correct' : 'answer-incorrect'}>{answers[question.id] === question.answer ? 'Correct' : 'Keep learning'} · Your answer: {question.options[answers[question.id]]}</span><p><strong>Answer: {question.options[question.answer]}.</strong> {question.explanation}</p></li>)}</ol><button className="btn btn-primary" onClick={restart}>Try again ↻</button></div> :
    <form noValidate onSubmit={event => {event.preventDefault();if(answered !== questions.length){setError(true);return;}setSubmitted(true);setError(false);}}>
      <div className="quiz-progress"><label htmlFor="quiz-progress">{answered} of {questions.length} answered</label><progress id="quiz-progress" value={answered} max={questions.length}/></div>
      {questions.map((question,index) => <fieldset key={question.id} aria-describedby={error && answers[question.id] === undefined ? 'quiz-error' : undefined}><legend><span>{String(index+1).padStart(2,'0')}.</span> {question.prompt}</legend>{question.options.map((option,optionIndex) => <label className="quiz-option" key={option}><input type="radio" name={question.id} value={optionIndex} checked={answers[question.id] === optionIndex} onChange={() => setAnswers(current => ({...current,[question.id]:optionIndex}))}/><span>{option}</span></label>)}</fieldset>)}
      {error && <p id="quiz-error" role="alert">Answer all three questions before checking your score.</p>}
      <button className="btn btn-primary" type="submit">Check my answers ↗</button>
    </form>}
  </div>;
}
