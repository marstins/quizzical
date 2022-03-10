
export default function Question({handleClick, question, scoreboard}) {
  const {answers} = question 

  function optionCheck(isSelected, isRight) {
    if (!scoreboard && isSelected) {
      return "selected"
    } else if (scoreboard && isSelected && !isRight) {
      return "wrongAnswer"
    } else if (scoreboard && isRight) {
      return "rightAnswer"
    }
  }

  return (
    <section className="question-section">
      <h2>{question.questionTitle}</h2>
      <div className="options-container">
        {answers.map(answer => {
          return (
            <button 
              className={`option-button ${optionCheck(answer.isSelected, answer.isRight)}`}
              key={answer.answerId} 
              onClick={() => 
              handleClick(question.questionId, answer.answerId)}
              disabled={scoreboard ? true : false}
            >
              {answer.answerTitle}
            </button>
          )})
        }
      </div>
    </section>
  )
}