const apiUrl = 'https://opentdb.com/api.php?amount=8&category=18&type=multiple';
const money = [
	  { level: '15', amount: '1,000,000' },
	  { level: '14', amount: '500,000' },
	  { level: '13', amount: '250,000' },
	  { level: '12', amount: '100,000' },
	  { level: '11', amount: '50,000' },
	  { level: '10', amount: '25,000' },
	  { level: '9', amount: '16,000' },
	  { level: '8', amount: '8,000' },
	  { level: '7', amount: '4,000' },
	  { level: '6', amount: '2,000' },
	  { level: '5', amount: '1,000' },
	  { level: '4', amount: '500' },
	  { level: '3', amount: '300' },
	  { level: '2', amount: '200' },
	  { level: '1', amount: '100' },
	];
const app = new Vue({
  el: '#app',
  data: {
    questions: [],
    index: 0,
    shuffledArr: [],
    items: money,
    incorrect: false,
    soundsPath: 'sounds/',
    showModal: true,
    roundNumber: 1,
    roundFinish: false,
    speak: true,
    speechRec: "Voice recognition activated. Try speaking into the microphone. Answer the question by saying answer is 'A' 'B' 'C' 'D'",
  },
  methods: {
    checkAns(ans) {
      // on button click stop speaking
      this.stopSpeaking();

      ans = this.ans(ans);
      if(ans == this.questionCurrent().correct_answer) {

        this.incorrect = false;
        this.index++;
        this.playSound('RightAnswerShort');

        //Check if its last question
        if(!this.questions[this.index]){
          this.index = 0;
          //When round ends change round number by displaying buttons
          this.roundNumber++;
          if (this.roundNumber == 4) this.roundNumber = 1;
          this.playSound('finalAnswer');
          this.roundFinish = true;
          this.showModal = true;
          this.stopSpeaking();
          return;
        }

        this.shuffle();

      }else{
        this.incorrect = true;
        this.playSound('WrongAnswer');
      }
    },
    questionCurrent() {
      return this.questions[this.index];
    },
    ans(index) {
      return this.shuffledArr[index];
    },
    shuffle() {

      const tempArr = [
        this.questionCurrent().correct_answer,
        ...this.questionCurrent().incorrect_answers
      ];


      this.shuffledArr = _.shuffle(tempArr);
    
      this.speakQuestionAns('The question is '+this.questionCurrent().question);
      this.speakQuestionAns('Answers are A:'+this.shuffledArr[0]);
      this.speakQuestionAns(' B: ' + this.shuffledArr[1]);
      this.speakQuestionAns(' C: ' + this.shuffledArr[2]);
      this.speakQuestionAns(' D: ' + this.shuffledArr[3]);
      this.speechRecognition();
    },
    async getQs() {
      const response = await fetch(apiUrl);
      const data = await response.json();
      this.questions = data.results;
      // console.clear();
      this.shuffle();
    },
    playSound(sound) {
      var audio = new Audio(this.soundsPath+sound+'.ogg');
      audio.play();

    },
    startRound() {
      this.getQs();
      this.showModal = false;
      this.playSound('Round'+this.roundNumber);
    },
    speakQuestionAns(text) {
      var msg = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(msg);

    },
    stopSpeaking() {
      var synth = window.speechSynthesis;
      synth.cancel();
    },
    stopSpeaking() {
      var synth = window.speechSynthesis;
      synth.cancel();
    },
    speechRecognition() {
      window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      var recognition = new window.SpeechRecognition();
      recognition.continuous = true;
      recognition.onresult = (event) => {
        const speechToText = event.results[event.results.length-1][0].transcript;

        if(speechToText.includes("answer is A") || speechToText.includes("answer is a")) {
          this.checkAns(0);
        }
        if(speechToText.includes("answer is B") || speechToText.includes("answer is a")) {
          this.checkAns(1);
        }
        if(speechToText.includes("answer is C") || speechToText.includes("answer is c")) {
          this.checkAns(2);
        }
        if(speechToText.includes("answer is D") || speechToText.includes("answer is d")) {
          this.checkAns(3);
        }

        this.speechRec = 'You just said: '+speechToText;
      }

      recognition.start();
    }
  },
  mounted() {
    var self = this;
    window.addEventListener('keyup', function(event) {
      if (event.keyCode === 65) {
        self.checkAns(0);
      } else if (event.keyCode === 66) {
        self.checkAns(1);
      } else if (event.keyCode === 67) {
        self.checkAns(2);
      } else if (event.keyCode === 68) {
        self.checkAns(3);
      }
    });
  },
});
