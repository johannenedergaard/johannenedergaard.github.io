
var jsPsych = initJsPsych({
  show_progress_bar: true,
  message_progress_bar: ' ',
  on_finish: function() {
      jsPsych.data.get().localSave('csv',participant_id + '_changeblindness.csv');
      window.location = 'https://app.prolific.com/submissions/complete?cc=C19OJ7GF'
    }
  })

var timeline = [];

jsPsych.data.addProperties({start_time: (new Date()).toISOString()});
var participant_id = jsPsych.randomization.randomID(8);
jsPsych.data.addProperties({participant: participant_id});

// welcome and full screen
var enter_fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: true,
  message: "<p>Misilittaanermut tikilluarit.</p><p>Qujanaq peqataarusukkavit!</p>",
  button_label: "Ingerlaqqinniarlutit una tooruk"
};
timeline.push(enter_fullscreen)

/* //demographics
var age = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    { prompt: "Qassinik ukioqarpit?",
      options: ["18 - 30", "31 - 50", "51 - 70", "71 - 90", "91 - "], 
      required: true
    }
  ],
  button_label: "Ingerlaqqigit",
  on_finish: function(data) {
    data.age = data.response.Q0
  }
}
timeline.push(age)

var language = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    { prompt: "Oqaatsit sorliit ilitsoqqussatut atorpigit?",
      options: ["Kalaallisut", "Qallunaatut", "Kalaallisut qallunaatullu", "Allat"], 
      required: true
    }
  ],
  button_label: "Ingerlaqqigit",
  on_finish: function(data) {
    data.language = data.response.Q0
  }
}
timeline.push(language)

var education = {
  type: jsPsychSurveyMultiChoice,
  questions: [
    { prompt: "Ilinniakkanni sivisunerpaaq sorleq naammassinikuuiuk?",
      options: ["Meeqqat atuarfiat naammassinikuunngilara", "Meeqqat atuarfiat", "Gymnasia", "Naatsumik nangitsilluni ilinniarneq", "Takivallaanngitsumik nangitsilluni ilinniarneq", "Sivisuumik nangitsilluni ilinniarneq"], 
      required: true
    }
  ],
  button_label: "Ingerlaqqigit",
  on_finish: function(data) {
    data.education = data.response.Q0
  }
}
timeline.push(education) */

// instructions
var instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: 
      "<p>Misilittaanermi uani kalaallisut oqaaseqatigiinnik atuarnissannik piumaffigineqassaatit.</p>"+ // I dette eksperiment vil du blive bedt om at læse nogle sætninger på grønlandsk.
      "<p>Oqaaseqatigiit ilaat assigiittorujussuupput, illit paasiniassallugu suliassaraat oqaaseqatigiit assigiinnersut imaluunniit assigiinnginnersut.</p>"+ // Nogle af sætningerne ligner hinanden meget, og din opgave er at finde ud af, om sætningerne er helt ens eller ej.
      "<p>Oqaaseqatigiinni oqaatsit ataasiakkaarlugit atuassavatit. Oqaatsimiit oqaatsip tullianut nuutsinniaraangakku computerip naqitassaani akunnilersuut tuussavat.</p>"+ // Du kommer til at læse sætningerne et ord ad gangen. Tryk på mellemrumstasten for at gå videre fra et ord til det næste.
      "<p>Siullermik misiligutitut suliassat sisamaapput.</p>", // Først er der fire øveopgaver.
    choices: ["Aallartinniarlutit una tooruk"], // Klik her for at begynde.
    post_trial_gap: 1000
  };
timeline.push(instructions)

// total score
let totalScore = 0;

// function for making self-paced reading trials
function make_spr_trial(sentence, repeated_sentence, change_type, affix_type, affix, filler_condition, target_word, reverse_target_position, sentence_words, target_syllables, target_morphemes, affix_position, correct_response) {
  var sentence_as_word_list = sentence.split(" ") //split the sentence at spaces
  // console.log(reverse_target_position,sentence_words)
  var sentence_as_stimulus_sequence = [] //empty stimulus sequence to start
  for (var word of sentence_as_word_list) { //for each word in sentence_as_word_list
    sentence_as_stimulus_sequence.push({'stimulus': "<p style='font-size:48px'>" + word +" </p>",
    data: {current_word:word}
    }) //add that word in the required format
  }
  var trial = {type: jsPsychHtmlKeyboardResponse, //plug into our template
               timeline:[
                // first fixation
                {stimulus: "<p style='font-size:48px'>+</p>",
               choices: "NO_KEYS",
               trial_duration: jsPsych.randomization.sampleWithReplacement([200, 500, 750, 300, 800, 250],1)},
               // then SPR
                {choices: [" "],
                timeline: sentence_as_stimulus_sequence},
                // then masking
                {stimulus: "<p style='font-size:48px'>############<br>############<br>############</p>",
               choices: "NO_KEYS",
               trial_duration: 500},
              // then change detection
                {type: jsPsychHtmlButtonResponse,
                  stimulus:'<div style="font-size:40px">' + repeated_sentence +"</div>",
                choices:["Aap","Naamik"], // Ja, Nej
                prompt:"<p><em>Oqaaseqatigiit allanngorsimappat?</em></p>", // Er der noget i sætningen der har forandret sig?
                on_finish: function(data) {
                  if (data.response == 0) {
                    data.Ychange_Nchange_response = "yes"
                  } else if (data.response == 1) {
                    data.Ychange_Nchange_response = "no"
                  }
                  if (data.response == 1 && change_type == "no_change")  {
                    totalScore += 1
                  }
                  console.log(totalScore)
                }
                },
                // change detection word click
                {type: jsPsychHtmlButtonResponse,
                  stimulus: " ",
                  choices: function() {
                    // if yes, choose which word has changed
                    // if no, press continue
                    if (jsPsych.data.get().last(1).values()[0].Ychange_Nchange_response === "yes") {
                      var splitted = repeated_sentence.split(" ")
                      var words = []
                      // removing <p> and </p> from the choices
                      for (var i=0; i<splitted.length; i++) {
                        if (splitted[i].startsWith('<')) {
                          continue
                        } else {
                          words.push(splitted[i])
                        }
                      }
                      return words
                    } else {
                      return ["Ingerlaqqigit"]; // Fortsæt
                    }
                  },
                  prompt: function() {
                    if (jsPsych.data.get().last(1).values()[0].Ychange_Nchange_response === "yes") {
                      return "<p>Oqaaseq sorleq allanngorsimava?</p>"; // Hvilket ord har forandret sig?
                    } else {
                      return " ";
                    }
                  },
                  margin_horizontal: '2px',
                  button_html: '<button class="jspsych-btn" style="font-size: 25px";>%choice%</button>',
                  on_finish: function (data) {
                    data.original_sentence = sentence
                    data.repeated_sentence = repeated_sentence
                    data.correct_change_answer = change_type
                    data.affix_type = affix_type
                    data.target_affix = affix
                    data.filler_condition = filler_condition
                    data.target_word = target_word
                    data.reverse_target_position = reverse_target_position
                    data.sentence_words = sentence_words
                    data.target_syllables = target_syllables
                    data.target_morphemes = target_morphemes
                    data.affix_position = affix_position
                    data.correct_response = correct_response
                    if (data.response == data.correct_response) {
                      totalScore += 1
                    }
                    console.log(totalScore)
                    // console.log(data.response)
                  }
                }
              ]}
  return trial //return the trial you have built
}

/*
Now it is very easy to build multiple trials using this function.
*/

// stimulus
var sentences = [ 
{ s1: "Dette er en test.", s2: "<p> Dette ej </p><p> en test. </p>", change_type: 'change', affix_type: 'lexical', affix: 'er', filler_condition: 'no', target_word: 'en', reverse_target_position: 'NA', sentence_words: '4', target_syllables: '1', target_morphemes: '1', affix_position: '1', correct_response: '1'},
{ s1: "Og dette er en test.", s2: "<p> Og dette er </p><p> en test. </p>", change_type: 'no_change', affix_type: 'lexical', affix: 'er', filler_condition: 'no', target_word: 'en', reverse_target_position: 'NA', sentence_words: '5', target_syllables: '1', target_morphemes: '1', affix_position: '1', correct_response: 'NA'},
]

// randomise!
sentences = jsPsych.randomization.repeat(sentences, 1);

// four practice trials
var spr_trial_1 = make_spr_trial("Piitaq kommunemut maalaarpoq kisianni sanaartorneq unitsinneqanngilaq.","<p> Piitaq borgmesterimut maalaarpoq kisianni </p><p> sanaartorneq unitsinneqanngilaq. </p>", // Peter klager til kommunen/borgmesteren men byggeriet bliver ikke stoppet.
'change_practice','root', 'kommunemut', 'no', 'kommunemut', '5', '6', '4', '2', '1', 'NA')
var spr_trial_2 = make_spr_trial("Johanne igavoq unnugu amerlasuunik pulaartoqarniarami.","<p> Johanne igavoq unnugu </p><p> amerlasuunik pulaartoqarniarami. </p>", // Johanne laver mad fordi hun får mange gæster i aften.
'no_change_practice','NA', 'NA', 'no', 'NA', 'NA', '5', 'NA', 'NA', 'NA', 'NA')
var spr_trial_3 = make_spr_trial("Nuka sapaatip akunnera kingulleq ilaquttani pulaarlugit Sisimiuniippoq.","<p> Nuka sapaatip akunnera kingulleq </p><p> ilaquttani pulaarlugit Ilulissaniippoq. </p>", // Nuka har været i Sismiut/Ilulissat i sidste uge for at besøge sin familie.
'change_practice','root', 'Sisimiuniippoq', 'no', 'Sisimiuniippoq', '1', '7', '6', 'NA', 'NA', 'NA')
var spr_trial_4 = make_spr_trial("Nina umiatsiamik pisisimavoq taava angalaarsinnaavoq.","<p> Nina umiatsiamik pisisimavoq </p><p> taava angalaarsinnaavoq. </p>", // Nina har købt en båd så hun kan sejle ud på tur.
'no_change_practice','NA', 'NA', 'no', 'NA', 'NA', '5', 'NA', 'NA', 'NA', 'NA')

timeline.push(spr_trial_1)

// feedback practice trial 1
var feedback_trial_1 = {
  type: jsPsychHtmlButtonResponse,
  stimulus: function() {
    var previousResponse = jsPsych.data.getLastTrialData().values()[0].response;
    console.log('Previous Response:', previousResponse);
    // display different stimuli based on the previous response
    if (previousResponse === 1) {
      return '<p><span style="color: green">Eqqorpoq!</span></p><p>Oqaaseq <i>kommunemut</i>-mit <i>borgmesterimut</i>-mut allanngortinneqarsimavoq.</p>'; // Rigtigt! Ordet kommune var ændret til borgmester
    } else {
      return '<p><span style="color: red">Eqqunngilaq!</span></p><p>Oqaaseq <i>kommunemut</i>-mit <i>borgmesterimut</i>-mut allanngortinneqarsimavoq.</p>'; // Forkert! Ordet kommune var ændret til borgmester
    }
  },
  choices: ['Ingerlaqqigit'] // Fortsæt
}
timeline.push(feedback_trial_1)

timeline.push(spr_trial_2)

// feedback practice trial 2
var feedback_trial_2 = {
  type: jsPsychHtmlButtonResponse,
  stimulus: function() {
    var previousResponse = jsPsych.data.getLastTrialData().values()[0].response;
    console.log('Previous Response:', previousResponse);
    // display different stimuli based on the previous response
    if (previousResponse === 0) {
      return '<p><span style="color: green">Eqqorpoq!</span></p><p>Oqaaseqatigiinni allanngortoqarsimanngilaq.</p>'; // Rigtigt! Der var ingen ændring i sætningen
    } else {
      return '<p><span style="color: red">Eqqunngilaq!</span></p><p>Oqaaseqatigiinni allanngortoqarsimanngilaq.</p>'; // Forkert! Der var ingen ændring i sætningen
    }
  },
  choices: ['Ingerlaqqigit'] // Fortsæt
}
timeline.push(feedback_trial_2)

timeline.push(spr_trial_3)

// feedback practice trial 3
var feedback_trial_3 = {
  type: jsPsychHtmlButtonResponse,
  stimulus: function() {
    var previousResponse = jsPsych.data.getLastTrialData().values()[0].response;
    console.log('Previous Response:', previousResponse);
    // display different stimuli based on the previous response
    if (previousResponse === 6) {
      return '<p><span style="color: green">Eqqorpoq!</span></p><p>Oqaaseq <i>Sisimiuniippoq</i>-mit <i>Ilulissaniippoq</i>-mut allanngortinneqarsimavoq.</p>'; // Rigtigt! Ordet kommune var ændret til borgmester
    } else {
      return '<p><span style="color: red">Eqqunngilaq!</span></p><p>Oqaaseq <i>Sisimiuniippoq</i>-mit <i>Ilulissaniippoq</i>-mut allanngortinneqarsimavoq.</p>'; // Forkert! Ordet kommune var ændret til borgmester
    }
  },
  choices: ['Ingerlaqqigit'] // Fortsæt
}
timeline.push(feedback_trial_3)

timeline.push(spr_trial_4)

// feedback practice trial 4
var feedback_trial_4 = {
  type: jsPsychHtmlButtonResponse,
  stimulus: function() {
    var previousResponse = jsPsych.data.getLastTrialData().values()[0].response;
    console.log('Previous Response:', previousResponse);
    // display different stimuli based on the previous response
    if (previousResponse === 0) {
      return '<p><span style="color: green">Eqqorpoq!</span></p><p>Oqaaseqatigiinni allanngortoqarsimanngilaq.</p>'; // Rigtigt! Der var ingen ændring i sætningen
    } else {
      return '<p><span style="color: red">Eqqunngilaq!</span></p><p>Oqaaseqatigiinni allanngortoqarsimanngilaq.</p>'; // Forkert! Der var ingen ændring i sætningen
    }
  },
  choices: ['Ingerlaqqigit'] // Fortsæt
}
timeline.push(feedback_trial_4)

// experiment start
var experiment_start = {
  type: jsPsychHtmlButtonResponse,
  stimulus: "<p>Massakkut misilittaaneq eqqortoq aallartippoq.</p>", // Nu begynder det rigtige eksperiment.
  choices: ["Aallartinniarlutit una tooruk"], // Klik her for at begynde.
  post_trial_gap: 1000
};
timeline.push(experiment_start)

for (var i in sentences) {
  timeline.push(make_spr_trial(sentences[i]["s1"],sentences[i]["s2"],
  sentences[i]['change_type'],sentences[i]['affix_type'], sentences[i]['affix'], sentences[i]['filler_condition'], sentences[i]['target_word'], sentences[i]['reverse_target_position'], sentences[i]['sentence_words'], sentences[i]['target_syllables'], sentences[i]['target_morphemes'], sentences[i]['affix_position'], sentences[i]['correct_response']))
}

// experiment done
var done = {
    type: jsPsychHtmlButtonResponse,
    choices: ['Naammassivoq'], // Afslut
    stimulus: function() {
      return "<p>Naammassivutit! Qujanaq peqataarusukkavit.</p><p> Pointit <span style='color: blue'>" + totalScore + "/999</span> eqqorsimavatit.</p><p>Naammassiumallugu una tooruk."; // Nu er du færdig! Tak fordi du ville være med. Du har fået x/y point. Klik for at afslutte.
    }
    };
timeline.push(done)

jsPsych.run(timeline);
