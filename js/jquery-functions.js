$("document").ready(function () {
  var currentQuestion = 0;
  var totalQuestions = 0;
  var userAnswers = {};
  var all_questions;
  var all_evidences;

  function hideFormBtns() {
    $("#nextQuestion").hide();
    $("#backButton").hide();
  }

  function getQuestions() {
    return fetch("question-utils/all-questions.json")
      .then((response) => response.json())
      .then((data) => {
        all_questions = data;
        totalQuestions = data.length;
      })
      .catch((error) => {
        console.error("Failed to fetch all-questions:", error);
        const errorMessage = document.createElement("div");
        errorMessage.textContent = "Error: Failed to fetch all-questions.json.";
        $(".question-container").html(errorMessage);
        hideFormBtns();
      });
  }

  function getEvidences() {
    return fetch("question-utils/cpsv.json")
      .then((response) => response.json())
      .then((data) => {
        all_evidences = data;
      })
      .catch((error) => {
        console.error("Failed to fetch cpsv:", error);
        const errorMessage = document.createElement("div");
        errorMessage.textContent = "Error: Failed to fetch cpsv.json.";
        $(".question-container").html(errorMessage);
        hideFormBtns();
      });
  }

  function setResult(text) {
    const resultWrapper = document.getElementById("resultWrapper");
    const result = document.createElement("h5");
    result.textContent = text;
    resultWrapper.appendChild(result);
  }

  function loadQuestion(questionId, noError) {
    $("#nextQuestion").show();
    if (currentQuestion > 0) {
      $("#backButton").show();
    } else {
      $("#backButton").hide();
    }

    var question = all_questions[questionId];
    var questionElement = document.createElement("div");

    if (noError) {
      questionElement.innerHTML = `
        <div class='govgr-field'>
          <fieldset class='govgr-fieldset' aria-describedby='radio-country'>
            <legend role='heading' aria-level='1' class='govgr-fieldset__legend govgr-heading-l'>
              ${question.question}
            </legend>
            <div class='govgr-radios' id='radios-${questionId}'>
              <ul>
                ${question.options
                  .map(
                    (option, index) => `
                  <div class='govgr-radios__item'>
                    <label class='govgr-label govgr-radios__label'>
                      ${option}
                      <input class='govgr-radios__input' type='radio' name='question-option' value='${index + 1}' />
                    </label>
                  </div>
                `
                  )
                  .join("")}
              </ul>
            </div>
          </fieldset>
        </div>
      `;
    } else {
      questionElement.innerHTML = `
        <div class='govgr-field govgr-field__error'>
          <legend role='heading' aria-level='1' class='govgr-fieldset__legend govgr-heading-l'>
            ${question.question}
          </legend>
          <fieldset class='govgr-fieldset' aria-describedby='radio-error'>
            <legend class='govgr-fieldset__legend govgr-heading-m'>
              Επιλέξτε την απάντησή σας
            </legend>
            <p class='govgr-hint'>Μπορείτε να επιλέξετε μόνο μία επιλογή.</p>
            <div class='govgr-radios' id='radios-${questionId}'>
              <p class='govgr-error-message'>
                <span class='govgr-visually-hidden'>Λάθος:</span>
                <span>Πρέπει να επιλέξετε μια απάντηση</span>
              </p>
              ${question.options
                .map(
                  (option, index) => `
                <div class='govgr-radios__item'>
                  <label class='govgr-label govgr-radios__label'>
                    ${option}
                    <input class='govgr-radios__input' type='radio' name='question-option' value='${index + 1}' />
                  </label>
                </div>
              `
                )
                .join("")}
            </div>
          </fieldset>
        </div>
      `;
    }

    $(".question-container").html(questionElement);
  }

  function skipToEnd(message) {
    const errorEnd = document.createElement("h5");
    errorEnd.className = "govgr-error-summary";
    errorEnd.textContent = message;
    $(".question-container").html(errorEnd);
    hideFormBtns();
  }

  function submitForm() {
    const resultWrapper = document.createElement("div");
    resultWrapper.innerHTML = `<h1 class='answer'>Είστε δικαιούχος!</h1>`;
    resultWrapper.setAttribute("id", "resultWrapper");
    $(".question-container").html(resultWrapper);

    $(".question-container").append(
      "<br /><br /><h5 class='answer'>Τα δικαιολογητικά που πρέπει να προσκομίσετε για την αναγγελία άσκησης επαγγέλματος φυσικοθεραπευτή είναι τα εξής:</h5><br />"
    );

    const evidenceListElement = document.createElement("ol");
    evidenceListElement.setAttribute("id", "evidences");
    $(".question-container").append(evidenceListElement);

    var evidenceMap = {
      0: {
        1: ["Αντίγραφο πτυχίου ΤΕΙ ή ΑΕΙ ημεδαπής"],
        2: ["Αντίγραφο πτυχίου εξωτερικού και πράξη ισοτιμίας/αντιστοιχίας από ΔΟΑΤΑΠ ή ΙΤΕ"],
        3: ["Αντίγραφο πτυχίου εξωτερικού και Απόφαση επαγγελματικής ισοτιμίας ή ισοδυναμίας από ΑΤΕΕΝ (Υπουργείο Παιδείας)"]
      },
      1: {
        1: ["Αντίγραφο Ποινικού Μητρώου"],
        2: ["Αντίγραφο Ποινικού Μητρώου"]
      },
      2: {
        1:  ["Βεβαίωση εγγραφής στον Πανελλήνιο Σύλλογο Φυσικοθεραπευτών", "Αποδεικτικό πληρωμής παραβόλου χαρτοσήμου 8,00 ευρώ", "Δύο έγχρωμες φωτογραφίες διαστάσεων ταυτότητας", "Αντίγραφο δελτίου ταυτότητας ή οποιουδήποτε άλλου ταυτοποιητικού εγγράφου"],
        2:  ["Βεβαίωση εγγραφής στον Πανελλήνιο Σύλλογο Φυσικοθεραπευτών", "Αποδεικτικό πληρωμής παραβόλου χαρτοσήμου 8,00 ευρώ", "Δύο έγχρωμες φωτογραφίες διαστάσεων ταυτότητας", "Βεβαίωση εγγραφής πολίτη κράτους-μέλους ΕΕ και Πιστοποιητικό ελληνομάθειας επιπέδου Β2"],
        3:  ["Βεβαίωση εγγραφής στον Πανελλήνιο Σύλλογο Φυσικοθεραπευτών", "Αποδεικτικό πληρωμής παραβόλου χαρτοσήμου 8,00 ευρώ", "Δύο έγχρωμες φωτογραφίες διαστάσεων ταυτότητας", "Πιστοποιητικό μόνιμης διαμονής - κάρτα ευρωπαίου πολίτη και Πιστοποιητικό ελληνομάθειας επιπέδου Β2"],
        4:  ["Βεβαίωση εγγραφής στον Πανελλήνιο Σύλλογο Φυσικοθεραπευτών", "Αποδεικτικό πληρωμής παραβόλου χαρτοσήμου 8,00 ευρώ", "Δύο έγχρωμες φωτογραφίες διαστάσεων ταυτότητας", "Δελτίο Ταυτότητας Ομογενούς και Πιστοποιητικό ελληνομάθειας επιπέδου Β2"],
        5:  ["Βεβαίωση εγγραφής στον Πανελλήνιο Σύλλογο Φυσικοθεραπευτών", "Αποδεικτικό πληρωμής παραβόλου χαρτοσήμου 8,00 ευρώ", "Δύο έγχρωμες φωτογραφίες διαστάσεων ταυτότητας", "Άδεια διαμονής ομογενούς και Πιστοποιητικό ελληνομάθειας επιπέδου Β2"],
        6:  ["Βεβαίωση εγγραφής στον Πανελλήνιο Σύλλογο Φυσικοθεραπευτών", "Αποδεικτικό πληρωμής παραβόλου χαρτοσήμου 8,00 ευρώ", "Δύο έγχρωμες φωτογραφίες διαστάσεων ταυτότητας", "Βεβαίωση κατάθεσης αίτησης ανανέωσης άδειας διαμονής και Πιστοποιητικό ελληνομάθειας επιπέδου Β2"],
        7:  ["Βεβαίωση εγγραφής στον Πανελλήνιο Σύλλογο Φυσικοθεραπευτών", "Αποδεικτικό πληρωμής παραβόλου χαρτοσήμου 8,00 ευρώ", "Δύο έγχρωμες φωτογραφίες διαστάσεων ταυτότητας", "Δελτίο μόνιμης διαμονής μέλους οικογένειας Έλληνα και Πιστοποιητικό ελληνομάθειας επιπέδου Β2"],
        8:  ["Βεβαίωση εγγραφής στον Πανελλήνιο Σύλλογο Φυσικοθεραπευτών", "Αποδεικτικό πληρωμής παραβόλου χαρτοσήμου 8,00 ευρώ", "Δύο έγχρωμες φωτογραφίες διαστάσεων ταυτότητας", "Δελτίο Διαμονής μέλους οικογένειας Έλληνα και Πιστοποιητικό ελληνομάθειας επιπέδου Β2"],
        9:  ["Βεβαίωση εγγραφής στον Πανελλήνιο Σύλλογο Φυσικοθεραπευτών", "Αποδεικτικό πληρωμής παραβόλου χαρτοσήμου 8,00 ευρώ", "Δύο έγχρωμες φωτογραφίες διαστάσεων ταυτότητας", "Προσωποπαγής άδεια διαμονής υπηκόων τρίτων χωρών (άρθρα 82, 83, 84, 85, 87 ν. 4251/2014) και Πιστοποιητικό ελληνομάθειας επιπέδου Β2"],
        10: ["Βεβαίωση εγγραφής στον Πανελλήνιο Σύλλογο Φυσικοθεραπευτών", "Αποδεικτικό πληρωμής παραβόλου χαρτοσήμου 8,00 ευρώ", "Δύο έγχρωμες φωτογραφίες διαστάσεων ταυτότητας", "Άδεια επί μακρόν διαμένοντος υπηκόου τρίτης χώρας (άρθρα 88, 97, 106 ν. 4251/2014) και Πιστοποιητικό ελληνομάθειας επιπέδου Β2"],
        11: ["Βεβαίωση εγγραφής στον Πανελλήνιο Σύλλογο Φυσικοθεραπευτών", "Αποδεικτικό πληρωμής παραβόλου χαρτοσήμου 8,00 ευρώ", "Δύο έγχρωμες φωτογραφίες διαστάσεων ταυτότητας", "Άδεια διαμονής δεύτερης γενιάς και Πιστοποιητικό ελληνομάθειας επιπέδου Β2"],
        12: ["Βεβαίωση εγγραφής στον Πανελλήνιο Σύλλογο Φυσικοθεραπευτών", "Αποδεικτικό πληρωμής παραβόλου χαρτοσήμου 8,00 ευρώ", "Δύο έγχρωμες φωτογραφίες διαστάσεων ταυτότητας", "Άδεια διαμονής υψηλής ειδίκευσης - Μπλε κάρτα ΕΕ και Πιστοποιητικό ελληνομάθειας επιπέδου Β2"],
        13: ["Βεβαίωση εγγραφής στον Πανελλήνιο Σύλλογο Φυσικοθεραπευτών", "Αποδεικτικό πληρωμής παραβόλου χαρτοσήμου 8,00 ευρώ", "Δύο έγχρωμες φωτογραφίες διαστάσεων ταυτότητας", "Άδεια διαμονής δεκαετούς διάρκειας και Πιστοποιητικό ελληνομάθειας επιπέδου Β2"],
        14: ["Βεβαίωση εγγραφής στον Πανελλήνιο Σύλλογο Φυσικοθεραπευτών", "Αποδεικτικό πληρωμής παραβόλου χαρτοσήμου 8,00 ευρώ", "Δύο έγχρωμες φωτογραφίες διαστάσεων ταυτότητας", "Τίτλος διαμονής και πιστοποιητικό οικογενειακής κατάστασης από το οποίο να προκύπτει σύναψη συμφώνου συμβίωσης με Έλληνα/Ελληνίδα και Πιστοποιητικό ελληνομάθειας επιπέδου Β2"]
      }
    };

    var collectedEvidences = new Set();

    for (var i = 0; i < totalQuestions; i++) {
      var savedIndex = parseInt(sessionStorage.getItem("answer_" + i));
      var evList = evidenceMap[i] && evidenceMap[i][savedIndex];
      if (evList) {
        evList.forEach((ev) => {
          if (!collectedEvidences.has(ev)) {
            collectedEvidences.add(ev);
            const listItem = document.createElement("li");
            listItem.textContent = ev;
            evidenceListElement.appendChild(listItem);
          }
        });
      }
    }

    hideFormBtns();
  }

  $("#startBtn").click(function () {
    $("#intro").html("");
    $("#questions-btns").show();
  });

  $("#nextQuestion").click(function () {
    if ($(".govgr-radios__input").is(":checked")) {
      var selectedIndex = parseInt($('input[name="question-option"]:checked').val());

      if (currentQuestion === 0 && selectedIndex === 4) {
        currentQuestion = -1;
        skipToEnd(
          "Δεν πληρείται η εκπαιδευτική προϋπόθεση επιλεξιμότητας. Για την αναγγελία άσκησης επαγγέλματος φυσικοθεραπευτή απαιτείται πτυχίο φυσικοθεραπείας από αναγνωρισμένο ίδρυμα ημεδαπής ή αλλοδαπής, σύμφωνα με την ισχύουσα νομοθεσία."
        );
        return;
      }

      if (currentQuestion === 1 && selectedIndex === 2) {
        currentQuestion = -1;
        skipToEnd(
          "Δεν πληρείται η προϋπόθεση ποινικού μητρώου."
        );
        return;
      }

      userAnswers[currentQuestion] = selectedIndex;
      sessionStorage.setItem("answer_" + currentQuestion, selectedIndex);

      if (currentQuestion + 1 === totalQuestions) {
        submitForm();
      } else {
        currentQuestion++;
        loadQuestion(currentQuestion, true);

        if (currentQuestion + 1 === totalQuestions) {
          $(this).text("Υποβολή");
        }
      }
    } else {

      loadQuestion(currentQuestion, false);
    }
  });

  $("#backButton").click(function () {
    if (currentQuestion > 0) {
      currentQuestion--;
      loadQuestion(currentQuestion, true);

      var answer = userAnswers[currentQuestion];
      if (answer) {
        $('input[name="question-option"][value="' + answer + '"]').prop("checked", true);
      }

      if (currentQuestion + 1 < totalQuestions) {
        $("#nextQuestion").text("Επόμενο");
      }
    }
  });

  $("#questions-btns").hide();

  getQuestions().then(() => {
    getEvidences().then(() => {
      loadQuestion(currentQuestion, true);
    });
  });
});
