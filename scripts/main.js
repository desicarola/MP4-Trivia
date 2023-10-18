// Import JSON file
import questions from './questions.json' assert { type: 'json' }
import users from './users.json' assert { type: 'json' }

// Get all DOM elements

const startBtn = $('#start-btn')
const nextBtns = $('.next-question')
const startSection = $('#start')
//const currentUserDisplay = document.getElementById('user-display')
const currentUserDisplay = $('#user-display')
const questionGroups = $('.question')
const endSection = $('#game-end')
const finalScoreSpan = document.querySelector('span[id="score"]')
const answerButtons = document.querySelectorAll('.answer')
const questionsInModal = $('.game-question')
const userStatsItems = $('.user-stat')
// Create array from all the answer buttons
const answers = [...answerButtons]

// Create array from buttons which trigger the displayed <section> element to change
const nextSectionTriggers = $.merge($.makeArray(startBtn), $.makeArray(nextBtns))

// Create an array from all the <section> elements
const sections = $.merge($.merge($.makeArray(startSection), $.makeArray(questionGroups)), endSection)

// Create an array from all question <li> elements in detailed results modal
const resultsQuestions = $.makeArray(questionsInModal)

// Create an array from all stat <li> elements at the end of the game
const resultsStats = $.makeArray(userStatsItems)

// Create array from the questions.json object keys, which will help in selecting random questions
const questionsKeysArray = $.map(questions, function(value,key) {return key})

// Create array from the users.json object values
const usersValuesArray = $.map(users, function(values, key) {return values})

// Create a new set which will store 10 random questions
const randomTen = new Set()

// Create a set to store fake users
const gameUsers = new Set()

// Create a variable to store current user's chosen username
let currentUser

// Create a variable to store the user's running score
let runningScore = 0

// Declare necessary variables for cycling through the <section> elements
const lastSectionIndex = sections.length - 1
let displayedSectionIndex = 0
let sectionOffset

// Declare necessary variables to display a question and store the selected answer
let nextQuestionNumber = displayedSectionIndex + 1
let currentQuestion
let selectedAnswer
let correctAnswer
let userSelection = false

// Create map to store detailed results
const currentUserDetailedResults = new Map()
currentUserDetailedResults.set("results", [])

// Create map to store all users stats 
const usersStats = new Map()
usersStats.set("stats", [])


// Add fake users’ usernames to gameUsers Set and the full fake user objects to userStats Map
for (const user of usersValuesArray) {
  gameUsers.add(user.username)
  usersStats.entries().next().value[1].push(user)
}

// Add 10 random questions from JSON file to the randomTen array
while (randomTen.size < 5) {
  const randomIndex = Math.floor(Math.random() * questionsKeysArray.length)

  const randomObjectKey = questionsKeysArray[randomIndex]
  if (randomTen.has(questions[randomObjectKey])) {
    continue;
  } else {
    randomTen.add(questions[randomObjectKey])
  }
}

// Get access to the set's values
const randomQuestionSet = randomTen.values()

// Check if DOM's readyState is "complete", then move all question sections out of view 
  $(document).on('readystatechange', function(e) {
      $(function(){  
      $.each(sections, function(index) {  
        $(this).css('transform', `translateX(${index * 100}%)`)
      })
    })
  })
  
//}

// Define functions to handle valid and invalid state at game start
const setStartGameInvalidState = () => {
  $('#username').css('border', '2px solid rgb(211, 70, 70)')
  $('#validation-msg').css('display', 'block')
  $('#start-btn').attr('disabled', '')
  
}


const setStartGameValidState = () => {
  $('#username').css('border', '2px solid black')
  $('#validation-msg').css('display', 'none')
  $('#start-btn').removeAttr('disabled')
}


// Create helper function to check if gameUsers Set already contains the username entered
const userExists = (username) => {
  if (gameUsers.has(username)) {
    return true
  } else {
    return false
  }
}


// Create helper function to check validity of usernameInput value using the Validator.js package
const isValid = (usernameInputValue) => {
  if (!validator.isEmpty(usernameInputValue) && validator.isLength(usernameInputValue, { min: 5 })) {
    return {
      valid: true,
      msg: null
    }
  } else {
 
    if (validator.isEmpty(usernameInputValue)) {
      return {
        valid: false,
        msg: "Required"
      }
    } else if (!validator.isLength(usernameInputValue, { min: 5 })) {
      return {
        valid: false,
        msg: "Minimum 5 characters"
      }
    } else {
      return {
        valid: false,
        msg: "Input invalid"
      }
    }
  }
}


// Create an event listener callback function to sanitize and validate the input value from the username field
const checkUsernameValidity = () => {
  const sanitizedInput = DOMPurify.sanitize($('#username').val())
  const trimmedInput = validator.trim(sanitizedInput)
  const escapedInput = validator.escape(trimmedInput)
 
  const validation = isValid(escapedInput)
  const usernameNotTaken = userExists(escapedInput)
 
  if (!validation.valid || usernameNotTaken) {
    setStartGameInvalidState()
 
    if (usernameNotTaken) {
      //validationMsg.innerHTML = "Username already in use"
      $('#validation-msg').html('Username alredy in use')
    } else {
      //validationMsg.innerHTML = validation.msg
      $('#validation-msg').html(validation.msg)
    }
 
  } else {
    currentUser = escapedInput
    setStartGameValidState()
  }
}

// Define a function to toggle the select indicator on any given answer button
const toggleSelectIndicator = (e) => {
  userSelection = true
  if (e.target.id.includes("answer-selection")) {
    const childrenArray = Array.from(e.target.parentElement.children)
    childrenArray.forEach((answerBtn) => {
      answerBtn.children[0].style.border = "2px solid #fff"
      answerBtn.children[0].style.boxShadow = "none"
    })
 
    e.target.children[0].style.border = "none"
    e.target.children[0].style["box-shadow"] = "var(--blue-neon-box)"

    selectedAnswer = e.target.children[1].innerText

    if (userSelection) {
      e.target.parentElement.nextElementSibling.removeAttribute('disabled')
    }

  } else if (e.target.id.includes("-indicator") || e.target.id.includes("__text")) {

    const childrenArray = Array.from(e.target.parentElement.parentElement.children)
    childrenArray.forEach((answerBtn) => {
      answerBtn.children[0].style.border = "2px solid #fff"
      answerBtn.children[0].style.boxShadow = "none"
    })
 
    if (e.target.id.includes("-indicator")) {

      e.target.style.border = "none"
      e.target.style["box-shadow"] = "var(--blue-neon-box)"
     
      selectedAnswer = e.target.nextElementSibling.innerText

    } else {

      e.target.previousElementSibling.style.border = "none"
      e.target.previousElementSibling.style["box-shadow"] = "var(--blue-neon-box)"

      selectedAnswer = e.target.innerText
    }

    if (userSelection) {
      e.target.parentElement.parentElement.nextElementSibling.removeAttribute('disabled')
    }
  }
}

// Define a function to check whether a given answer is correct and update user score
const checkAnswer = (question, userAnswer, correct) => {
  const results = currentUserDetailedResults.entries().next().value

  if (results[1].length < 5) {
    if (userAnswer === correct) {
      results[1].push({
        question,
        selectedAnswer,
        outcome: "Correct"
      })

      runningScore+=20
 
    } else {
      results[1].push({
        question,
        selectedAnswer,
        outcome: "Incorrect"
      })
    }
  }
}

// Define function to handle game end logic
const gameEnd = () => {
  const score = runningScore.toString()
  const results = currentUserDetailedResults.entries().next().value
  const stats = usersStats.entries().next().value

  finalScoreSpan.innerHTML = score

  stats[1].push({ username: currentUser,  score: runningScore})

  const sortedStats = stats[1].sort((a, b) => (a.score < b.score) ? 1 : -1)

  resultsStats.forEach((rs, index) => {
    rs.children[0].innerHTML = sortedStats[index].username
    rs.children[1].innerHTML = sortedStats[index].score.toString()
  })

  resultsQuestions.forEach((rq, index) => {
    rq.children[1].style["font-family"] = "var(--accent-font)"
    rq.children[0].children[0].innerHTML = results[1][index].question
    rq.children[0].children[1].children[0].innerHTML = results[1][index].selectedAnswer

    rq.children[1].innerHTML = results[1][index].outcome

    if (results[1][index].outcome === "Correct") {
      rq.children[1].style.color = "#50D050"
    } else if (results[1][index].outcome === "Incorrect") {
      rq.children[1].style.color = "var(--error-color)"
    }
  })
}

// Define function to display question/answer set from randomTen Set
const loadQuestionAndAnswers = () => {
  if (nextQuestionNumber != lastSectionIndex) {
    currentQuestion = randomQuestionSet.next().value
    correctAnswer = currentQuestion.correctAnswer
    sections[nextQuestionNumber].children[0].innerHTML = currentQuestion["question"]
 
    const answerNodes = Array.from(sections[nextQuestionNumber].children[1].children)
 
    answerNodes.forEach((node, index) => node.children[1].innerHTML = currentQuestion["answers"][index])

    setTimeout(() => {
      $('#container').css('background', 'rgba(23, 105, 44, 0.75)')
    }, 350)
  }
}


// Define function to progress to the next section
const goToNextSection = () => {
  $.each(sections, function(loopIndex) {  
    sectionOffset = loopIndex - displayedSectionIndex
    $(this).css('transform', `translateX(${sectionOffset * 100}%)`)
    $(this).css('opacity', '1')
  })
}


// Create an event listener callback function to move to the next <section> element
const nextSectionClickListener = (e) => {
  if (e.target.id === "start-btn") {
    gameUsers.add(currentUser)
    currentUserDisplay.children().html(currentUser)
    currentUserDisplay.css('display', 'block')
  }

  if (correctAnswer && selectedAnswer) {
    checkAnswer(currentQuestion["question"], selectedAnswer, correctAnswer)
  }
 
  if (displayedSectionIndex === lastSectionIndex - 1) {
    userSelection = false
    displayedSectionIndex++
    gameEnd()
    goToNextSection()
   
  } else {
    loadQuestionAndAnswers()
    userSelection = false
    displayedSectionIndex++
    nextQuestionNumber++
    goToNextSection()
  }
}

// Add listener to all nextSectionTrigger buttons
$.each(nextSectionTriggers, function(){
  $(this).on('click', (e) => nextSectionClickListener(e))
})

// Add listeners to all the answer buttons
$.each(answers, function() {
  $(this).on('click', (e) => toggleSelectIndicator(e))
})

// Add input and blur listeners to username input field
$('#username').on('input', checkUsernameValidity)
$('#username').on('blur', checkUsernameValidity)

// Add a click listener to the Play Again button
$('#play-again').on('click', () => window.location.reload())

