import {useState, useEffect} from "react"
import {decode} from "html-entities"
import { nanoid } from "nanoid"
import QuestionCard from "./components/QuestionCard"
import Button from "./components/Button"
import LoadingIcon from "./components/LoadingIcon"

function App() {
  const [quiz, setQuiz] = useState([])
  const [questionary, setQuestionary] = useState([])
  const [game, setGame] = useState(false)
  const [endScreen, setEndScreen] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(function() {
    const answers = questionary.map(question => question.answers)
    const allAnswers = answers.reduce((prev, current) => prev.concat(current), [])
    
    setScore(getScore(allAnswers))
  }, [questionary])

  useEffect(function() {
    if (game && !endScreen) {
      getQuiz()
        .then(quiz => setQuiz(quiz))
    } 
  }, [game, endScreen])

  useEffect(function() {
    setQuestionary(() => {
      return (
        quiz.map(entry => createQuestion(entry))
      )
    })
  }, [quiz])

  async function getQuiz() {
    const response = await fetch("https://opentdb.com/api.php?amount=5&type=multiple")
    const data = await response.json()
    setLoading(true)
    return data.results
  }

  function createQuestion(entry) {
    const otherAnswers = entry.incorrect_answers.map(answer => ({answerTitle: decode(answer), answerId: nanoid(), isRight: false, isSelected: false}))

    const question = {
      questionTitle: decode(entry.question),
      questionId: nanoid(),
      answers: [
        {
          answerTitle: decode(entry.correct_answer),
          answerId: nanoid(),
          isRight: true,
          isSelected: false
        },
        ...otherAnswers
      ]}
    
    question.answers = question.answers.sort(() => Math.random() - 0.5)
    return question
  }
  
  function selectOption(questionId, answerId) {
    setQuestionary(oldState => oldState.map(question => {
      if (question.questionId === questionId) {
        return {
          ...question,
          answers: question.answers.map(answer => {
            if (answer.answerId === answerId) {
              return {...answer, isSelected: true}
            } else if (answer.isSelected && answer.answerId !== answerId) {
              return {...answer, isSelected: false}
            } else {
              return answer
            }  
          })
        }
      } else {
        return question
      }
    }))
  }

  function getScore(answers) {
    const newScore = answers.reduce((acc, answer) => {
      if (answer.isSelected && answer.isRight) {
        return acc + 1
      }
      return acc
    }, 0)
    return newScore
  }

  function startGame() {
    setGame(true)
  }

  function endGame() {
    setEndScreen(true)
  }

  function resetGame() {
    setQuiz([])
    setQuestionary([])
    setEndScreen(false)
    setLoading(false)
  }

  return (
    <div className="App">
      <main>
        {!game &&
          <>
            <h1>Quizzical</h1>
            <h2>Test your knowledge!</h2>
            <div className="button-container">
              <Button text={"Start"} handleClick={startGame} />
            </div>
          </>
        }
        {game && !endScreen &&  
          <>
            {!loading ? 
              <LoadingIcon /> : 
              <>
                {questionary.map(item => <QuestionCard key={item.questionId} question={item} handleClick={selectOption} scoreboard={endScreen}/>)}
                <div className="button-container">
                <Button text={"End Game"} handleClick={endGame}/> 
                </div>
              </>
            }   
          </>
        }
        {game && endScreen &&
          <>
            {questionary.map(item => <QuestionCard key={item.questionId} question={item} handleClick={selectOption} scoreboard={endScreen}/>)}
            <div className="button-container">
              <h2>You scored {score}/5 correct answers!</h2>
              <Button text={"Restart"} handleClick={resetGame}/>
            </div>
          </>
        }
      </main>
    </div>
  )
}

export default App;
