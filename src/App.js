import {useState, useEffect} from "react"
import {decode} from "html-entities"
import {nanoid} from "nanoid"
import QuestionCard from "./components/QuestionCard"
import Button from "./components/Button"
import LoadingIcon from "./components/LoadingIcon"

function App() {
  // Store API response
  const [quiz, setQuiz] = useState([])
  // Store needed data from API response
  const [questionary, setQuestionary] = useState([])
  // Store user score
  const [score, setScore] = useState(0)
  // Control if game has started
  const [game, setGame] = useState(false)
  // Control if game is on end screen (screen with score)
  const [endScreen, setEndScreen] = useState(false)
  // Control if API request has been completed
  const [loading, setLoading] = useState(false)

  // Check for changes in questionary and set the score value
  useEffect(function() {
    const answers = questionary.map(question => question.answers)
    const allAnswers = answers.reduce((prev, current) => prev.concat(current), [])
    
    setScore(getScore(allAnswers))
  }, [questionary])

  // Check if the user has started the game and if the game is not on the end screen, if so, make request to api and set quiz as the response
  useEffect(function() {
    if (game && !endScreen) {
      getQuiz()
        .then(quiz => setQuiz(quiz))
    } 
  }, [game, endScreen])

  // Check if quiz has been set, and then set populate questionary with data from quiz
  useEffect(function() {
    setQuestionary(() => {
      return (
        quiz.map(entry => createQuestion(entry))
      )
    })
  }, [quiz])

  // Make request to api and set loading to true, meaning the request has been completed
  async function getQuiz() {
    const response = await fetch("https://opentdb.com/api.php?amount=5&type=multiple")
    const data = await response.json()
    setLoading(true)
    return data.results
  }

  // Format data into a question object
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
  
  // Select an answer and alter it's state in the questionary
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

  // Calculate score
  function getScore(answers) {
    const newScore = answers.reduce((acc, answer) => {
      if (answer.isSelected && answer.isRight) {
        return acc + 1
      }
      return acc
    }, 0)
    return newScore
  }

  // Change game to true and start game 
  function startGame() {
    setGame(true)
  }

  // Change the game to the end screen
  function endGame() {
    setEndScreen(true)
  }

  // Reset states
  function resetGame() {
    setQuiz([])
    setQuestionary([])
    setEndScreen(false)
    setLoading(false)
  }

  return (
    <div className="App">
      <main> 
        {/* If the game hasn't started */}
        {!game &&
          <>
            <h1>Quizzical</h1>
            <h2>Test your knowledge!</h2>
            <div className="button-container">
              <Button text={"Start"} handleClick={startGame} />
            </div>
          </>
        }

        {/* If game has started and it isn't on the end screen */}
        {game && !endScreen &&  
          <>
            {/* If the api request has not been completed, render loading icon, else, render questionary */}
            {!loading ? 
              <LoadingIcon /> : 
              <>
                {questionary.map(item => <QuestionCard key={item.questionId} question={item} handleClick={selectOption} scoreboard={endScreen} />)}
                <div className="button-container">
                <Button text={"End Game"} handleClick={endGame} /> 
                </div>
              </>
            }   
          </>
        }

        {/* If the game has started and is on the end screen */}
        {game && endScreen &&
          <>
            {questionary.map(item => <QuestionCard key={item.questionId} question={item} handleClick={selectOption} scoreboard={endScreen} />)}
            <div className="button-container">
              <h2>You scored {score}/5 correct answers!</h2>
              <Button text={"Restart"} handleClick={resetGame} />
            </div>
          </>
        }
      </main>
    </div>
  )
}

export default App;
