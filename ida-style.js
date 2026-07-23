// Adult Dyslexia Quick Screener — 20 items, 4-point Likert
// Sibling to script.js; kept separate so the two surveys don't share state.

var iconSpeechActive = false;
var currentPlayingText = null;
var currentUtteranceRef = null;

function speakText(text) {
    if (!('speechSynthesis' in window)) {
        alert('Sorry, your browser does not support text-to-speech functionality.');
        return;
    }

    var icon = null;
    try { icon = event.currentTarget; } catch(e) {}
    if (!icon) { try { icon = event.target.closest('svg'); } catch(e) {} }

    if (currentPlayingText === text) {
        speechSynthesis.cancel();
        removePlayingClass();
        currentPlayingText = null;
        currentUtteranceRef = null;
        iconSpeechActive = false;
        return;
    }

    var utterance = new SpeechSynthesisUtterance(text);
    currentUtteranceRef = utterance;
    speechSynthesis.cancel();
    removePlayingClass();

    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    currentPlayingText = text;
    iconSpeechActive = true;

    if (icon) {
        icon.classList.add('playing');
    }

    utterance.onend = function() {
        if (currentUtteranceRef !== utterance) return;
        removePlayingClass();
        currentPlayingText = null;
        currentUtteranceRef = null;
        iconSpeechActive = false;
    };

    utterance.onerror = function() {
        if (currentUtteranceRef !== utterance) return;
        removePlayingClass();
        currentPlayingText = null;
        currentUtteranceRef = null;
        iconSpeechActive = false;
    };

    speechSynthesis.speak(utterance);
}

function removePlayingClass() {
    var playingIcons = document.querySelectorAll('.speaker-icon.playing, .question-speaker.playing, .intro-speaker.playing, .intro-card-speaker.playing');
    playingIcons.forEach(function(icon) {
        icon.classList.remove('playing');
    });
}

// 22 scored items, 4-point Likert (1-4 per question).
// The optional family-history item (name="familyHistory") is NOT scored and
// NOT counted toward progress — it's surfaced as context on the results page.
var totalQuestions = 22;
var maxPerQuestion = 4;
var answeredQuestions = 0;

function updateProgress() {
    // Count only the scored q1..q22 groups, so the optional family-history item
    // can't push progress past 100%.
    var answeredInputs = document.querySelectorAll('input[name^="q"]:checked');
    answeredQuestions = answeredInputs.length;

    var progressPercent = Math.round((answeredQuestions / totalQuestions) * 100);
    var progressBar = document.getElementById('progressBar');
    var progressText = document.getElementById('progressText');

    progressBar.style.width = progressPercent + '%';
    progressText.textContent = progressPercent + '%';
}

document.addEventListener('DOMContentLoaded', function() {
    var radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(function(radio) {
        radio.addEventListener('change', updateProgress);
    });
});

var categories = [
    { name: "Reading History and Habits", questions: [1, 2, 3] },
    { name: "Sounding Out Words", questions: [4, 5, 6, 7] },
    { name: "Visually Similar Words and Spelling", questions: [8, 9, 10] },
    { name: "Word Retrieval and Naming", questions: [11, 12, 13] },
    { name: "Working Memory and Sequencing", questions: [14, 15, 16] },
    { name: "Written Expression and Organization", questions: [17, 18, 19] },
    { name: "Time and Direction", questions: [20, 21, 22] }
];

function calculateResults(event) {
    event.preventDefault();

    var unansweredQuestions = [];
    for (var i = 1; i <= totalQuestions; i++) {
        var questionInputs = document.querySelectorAll('input[name="q' + i + '"]');
        var isAnswered = Array.from(questionInputs).some(function(input) { return input.checked; });
        if (!isAnswered) {
            unansweredQuestions.push(i);
        }
    }

    var errorNotification = document.getElementById('errorNotification');
    if (unansweredQuestions.length > 0) {
        errorNotification.classList.add('visible');
        errorNotification.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    errorNotification.classList.remove('visible');

    var totalScore = 0;
    // Score each answer 0–3 (Rarely=0 … Almost Always=3) so the scale runs a true 0–100%
    var pointsPerQuestion = maxPerQuestion - 1;
    var maxScore = totalQuestions * pointsPerQuestion;
    var categoryScores = [];

    for (var j = 1; j <= totalQuestions; j++) {
        var selectedInput = document.querySelector('input[name="q' + j + '"]:checked');
        if (selectedInput) {
            totalScore += parseInt(selectedInput.value) - 1;
        }
    }

    categories.forEach(function(category) {
        var categoryScore = 0;
        var categoryMaxScore = category.questions.length * pointsPerQuestion;

        category.questions.forEach(function(questionNum) {
            var selectedInput = document.querySelector('input[name="q' + questionNum + '"]:checked');
            if (selectedInput) {
                categoryScore += parseInt(selectedInput.value) - 1;
            }
        });

        // Straight percentage so it matches the points shown (e.g. 6/9 = 67%)
        var categoryPercentage = Math.round((categoryScore / categoryMaxScore) * 100);
        categoryScores.push({
            name: category.name,
            score: categoryScore,
            maxScore: categoryMaxScore,
            percentage: categoryPercentage,
            questionCount: category.questions.length
        });
    });

    // True 0–100% scale: all "Rarely" = 0%, all "Almost Always" = 100%
    var scorePercentage = Math.round((totalScore / maxScore) * 100);
    var riskLevel, riskClass, resultText;

    if (scorePercentage <= 30) {
        riskLevel = 'Few Signs';
        riskClass = 'low';
        resultText = "Your responses show few of the patterns commonly associated with adult dyslexia. If you still have concerns about reading, writing, or learning, a brief chat with a qualified professional can help you decide whether to look further.";
    } else if (scorePercentage <= 65) {
        riskLevel = 'Some Signs';
        riskClass = 'medium';
        resultText = "Your responses show some of the patterns commonly associated with adult dyslexia. This doesn't mean you have dyslexia — but it's worth taking seriously. Many adults find it helpful to talk with a qualified professional who works with adult learning differences.";
    } else {
        riskLevel = 'Many Signs';
        riskClass = 'high';
        resultText = "Your responses show many of the patterns commonly associated with adult dyslexia. A formal evaluation by a qualified professional (such as an educational psychologist or speech-language pathologist) can give you a clearer answer and open up tools and support that make daily life easier.";
    }

    var resultsSection = document.getElementById('results');
    var scoreDisplay = document.getElementById('scoreDisplay');
    var probabilityLevel = document.getElementById('probabilityLevel');
    var resultsText = document.getElementById('resultsText');

    scoreDisplay.textContent = scorePercentage + '%';
    probabilityLevel.textContent = riskLevel;
    probabilityLevel.className = 'probability-level ' + riskClass;
    resultsText.textContent = resultText;

    // Family-history context (not part of the score; strongest single risk factor)
    var fhNote = document.getElementById('familyHistoryNote');
    if (fhNote) {
        var fh = document.querySelector('input[name="familyHistory"]:checked');
        var fhValue = fh ? fh.value : null;
        if (fhValue === 'yes') {
            fhNote.textContent = "You noted that dyslexia or reading difficulty runs in your close family. Dyslexia is strongly hereditary, so a family history raises the likelihood — worth mentioning if you seek a professional assessment.";
            fhNote.style.display = 'block';
        } else if (fhValue === 'unsure') {
            fhNote.textContent = "Dyslexia is strongly hereditary. If you can, it's worth finding out whether reading or spelling was hard for a parent, sibling, or your own child — a family history is a meaningful clue.";
            fhNote.style.display = 'block';
        } else {
            fhNote.textContent = '';
            fhNote.style.display = 'none';
        }
    }

    displayCategoryBreakdown(categoryScores);

    document.getElementById('dyslexiaAssessment').style.display = 'none';
    document.getElementById('siteHeader').style.display = 'none';
    document.getElementById('headerSpacer').style.display = 'none';
    document.getElementById('progressSticky').style.display = 'none';
    resultsSection.classList.add('show');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    var assessmentResults = {
        date: new Date().toISOString(),
        totalScore: totalScore,
        maxScore: maxScore,
        percentage: scorePercentage,
        riskLevel: riskLevel,
        answeredQuestions: totalQuestions
    };

    // Distinct localStorage key so this screener doesn't collide with the main survey
    localStorage.setItem('dyslexiaQuickScreenerResults', JSON.stringify(assessmentResults));
}

function displayCategoryBreakdown(categoryScores) {
    var categoryResultsContainer = document.getElementById('categoryResults');
    categoryResultsContainer.innerHTML = '';

    categoryScores.forEach(function(category) {
        var categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';

        var scoreClass = 'low-score';
        var scoreBadgeClass = 'low';
        if (category.percentage >= 66) {
            scoreClass = 'high-score';
            scoreBadgeClass = 'high';
        } else if (category.percentage >= 31) {
            scoreClass = 'medium-score';
            scoreBadgeClass = 'medium';
        }

        categoryItem.classList.add(scoreClass);

        categoryItem.innerHTML =
            '<div class="category-info">' +
                '<div class="category-name">' + category.name + '</div>' +
                '<div class="category-details">' + category.score + ' out of ' + category.maxScore + ' points • ' + category.questionCount + ' questions</div>' +
            '</div>' +
            '<div class="category-score ' + scoreBadgeClass + '">' +
                category.percentage + '%' +
            '</div>';

        categoryResultsContainer.appendChild(categoryItem);
    });
}

function resetAssessment() {
    var form = document.getElementById('dyslexiaAssessment');
    form.reset();

    answeredQuestions = 0;
    updateProgress();

    var fhNote = document.getElementById('familyHistoryNote');
    if (fhNote) { fhNote.textContent = ''; fhNote.style.display = 'none'; }

    document.getElementById('results').classList.remove('show');
    document.getElementById('siteHeader').style.display = '';
    document.getElementById('headerSpacer').style.display = '';
    document.getElementById('progressSticky').style.display = '';
    form.style.display = 'block';

    // Reset the email capture block so the form shows again on a retake
    var emailForm = document.getElementById('emailCaptureForm');
    var emailSuccess = document.getElementById('emailSuccess');
    var emailError = document.getElementById('emailError');
    if (emailForm) {
        emailForm.reset();
        emailForm.style.display = '';
        var emailBtn = emailForm.querySelector('button[type="submit"]');
        if (emailBtn) { emailBtn.disabled = false; emailBtn.textContent = 'Join the list'; }
    }
    if (emailSuccess) emailSuccess.classList.remove('visible');
    if (emailError) emailError.classList.remove('visible');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (currentPlayingText) {
        speechSynthesis.cancel();
        removePlayingClass();
        currentPlayingText = null;
        currentUtteranceRef = null;
        iconSpeechActive = false;
    }
}

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && event.target.closest('.speaker-icon, .question-speaker')) {
        event.preventDefault();
        event.target.click();
    }

    if (event.code === 'Escape' && currentPlayingText) {
        speechSynthesis.cancel();
        removePlayingClass();
        currentPlayingText = null;
        currentUtteranceRef = null;
        iconSpeechActive = false;
    }
});

document.addEventListener('visibilitychange', function() {
    if (document.hidden && currentPlayingText) {
        speechSynthesis.pause();
    } else if (!document.hidden && currentPlayingText && speechSynthesis.paused) {
        speechSynthesis.resume();
    }
});

function saveProgress() {
    var formData = new FormData(document.getElementById('dyslexiaAssessment'));
    var progressData = {};

    for (var pair of formData.entries()) {
        progressData[pair[0]] = pair[1];
    }

    localStorage.setItem('dyslexiaQuickScreenerProgress', JSON.stringify({
        data: progressData,
        timestamp: new Date().toISOString(),
        answeredQuestions: answeredQuestions
    }));
}

function loadProgress() {
    var savedProgress = localStorage.getItem('dyslexiaQuickScreenerProgress');
    if (savedProgress) {
        try {
            var progress = JSON.parse(savedProgress);
            var savedData = progress.data;

            var savedTime = new Date(progress.timestamp);
            var now = new Date();
            var hoursDiff = (now - savedTime) / (1000 * 60 * 60);

            if (hoursDiff < 24) {
                for (var key in savedData) {
                    var input = document.querySelector('input[name="' + key + '"][value="' + savedData[key] + '"]');
                    if (input) {
                        input.checked = true;
                    }
                }
                updateProgress();
            }
        } catch (error) {
            console.log('Could not load saved progress:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadProgress();

    var radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(function(radio) {
        radio.addEventListener('change', function() {
            updateProgress();
            setTimeout(saveProgress, 100);
        });
    });

    var questions = document.querySelectorAll('.question');
    questions.forEach(function(question, index) {
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'group');
        question.setAttribute('aria-labelledby', 'question-' + index);
    });

    var categoryTitles = document.querySelectorAll('.category-title');
    categoryTitles.forEach(function(category) {
        category.addEventListener('click', function() {
            var firstQuestion = this.parentElement.querySelector('.question');
            if (firstQuestion) {
                firstQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
});

window.addEventListener('error', function(event) {
    if (event.error && event.error.message && event.error.message.includes('speechSynthesis')) {
        console.warn('Speech synthesis error:', event.error);
        alert('There was an issue with the text-to-speech feature. Please try again or continue without audio assistance.');
    }
});

function updateSpacerHeight() {
    var header = document.getElementById('siteHeader');
    var spacer = document.getElementById('headerSpacer');
    if (header && spacer) {
        spacer.style.height = header.offsetHeight + 'px';
    }
}
updateSpacerHeight();
window.addEventListener('resize', updateSpacerHeight);

// ---------- Email capture ----------
function initEmailCapture() {
    var form = document.getElementById('emailCaptureForm');
    if (!form) return;
    var input = document.getElementById('emailInput');
    var errorMsg = document.getElementById('emailError');
    var success = document.getElementById('emailSuccess');

    function showEmailError(submitBtn, message) {
        errorMsg.textContent = message || 'Sorry — something went wrong. Please try again in a moment.';
        errorMsg.classList.add('visible');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Join the list'; }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var email = (input.value || '').trim();
        var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!valid) {
            showEmailError(null, 'Please enter a valid email address.');
            input.focus();
            return;
        }
        errorMsg.classList.remove('visible');

        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Joining…'; }

        // Local backup so a signup is never lost, even if the network call fails.
        try {
            var list = JSON.parse(localStorage.getItem('dyslexiaScreenerEmails') || '[]');
            list.push({ email: email, date: new Date().toISOString() });
            localStorage.setItem('dyslexiaScreenerEmails', JSON.stringify(list));
        } catch (err) { /* ignore storage errors */ }

        // Send to the Cloudflare Function (functions/api/subscribe.js), which adds
        // the contact to Resend with the API key kept server-side.
        fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        }).then(function(res) {
            return res.json().catch(function() { return {}; }).then(function(data) {
                return res.ok && data && data.ok;
            });
        }).then(function(ok) {
            if (ok) {
                form.style.display = 'none';
                success.classList.add('visible');
            } else {
                showEmailError(submitBtn);
            }
        }).catch(function() {
            showEmailError(submitBtn);
        });
    });

    input.addEventListener('input', function() {
        errorMsg.classList.remove('visible');
    });
}

document.addEventListener('DOMContentLoaded', initEmailCapture);

// ---------- Reading comfort ----------
function initComfort() {
    var toggle = document.getElementById('comfortToggle');
    var panel = document.getElementById('comfortPanel');
    if (!toggle || !panel) return;

    var root = document.documentElement;
    var PREF_KEY = 'dyslexiaComfortPrefs';
    var defaults = { textsize: 'normal', spacing: 'normal', font: 'default', tint: 'cream' };

    function loadPrefs() {
        var p = {};
        try { p = JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); } catch (e) { p = {}; }
        return {
            textsize: p.textsize || defaults.textsize,
            spacing: p.spacing || defaults.spacing,
            font: p.font || defaults.font,
            tint: p.tint || defaults.tint
        };
    }

    function savePrefs(p) {
        try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch (e) { /* ignore */ }
    }

    function apply(p) {
        root.setAttribute('data-textsize', p.textsize);
        root.setAttribute('data-spacing', p.spacing);
        root.setAttribute('data-font', p.font);
        root.setAttribute('data-tint', p.tint);
        // Reflect the active choice in each option group
        var groups = panel.querySelectorAll('.comfort-options');
        groups.forEach(function (g) {
            var pref = g.getAttribute('data-pref');
            g.querySelectorAll('button').forEach(function (b) {
                b.classList.toggle('is-active', b.getAttribute('data-value') === p[pref]);
            });
        });
    }

    var prefs = loadPrefs();
    apply(prefs);

    toggle.addEventListener('click', function () {
        var isHidden = panel.hasAttribute('hidden');
        if (isHidden) {
            panel.removeAttribute('hidden');
            toggle.setAttribute('aria-expanded', 'true');
        } else {
            panel.setAttribute('hidden', '');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });

    panel.querySelectorAll('.comfort-options').forEach(function (g) {
        var pref = g.getAttribute('data-pref');
        g.addEventListener('click', function (e) {
            var btn = e.target.closest('button');
            if (!btn) return;
            prefs[pref] = btn.getAttribute('data-value');
            savePrefs(prefs);
            apply(prefs);
        });
    });

    var reset = document.getElementById('comfortReset');
    if (reset) {
        reset.addEventListener('click', function () {
            prefs = { textsize: 'normal', spacing: 'normal', font: 'default', tint: 'cream' };
            savePrefs(prefs);
            apply(prefs);
        });
    }
}

document.addEventListener('DOMContentLoaded', initComfort);

// Click-to-speak for answer choices
(function() {
    var lastOptionText = null;
    var lastOptionTime = 0;
    document.addEventListener('click', function(e) {
        var option = e.target.closest('.option');
        if (!option) return;
        if (iconSpeechActive) return;
        var label = option.querySelector('label');
        if (!label) return;
        var text = label.textContent.trim();
        if (!text) return;
        var now = Date.now();
        if (text === lastOptionText && now - lastOptionTime < 300) return;
        lastOptionText = text;
        lastOptionTime = now;
        speechSynthesis.cancel();
        removePlayingClass();
        currentPlayingText = null;
        currentUtteranceRef = null;
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;
        speechSynthesis.speak(utterance);
    });
})();
