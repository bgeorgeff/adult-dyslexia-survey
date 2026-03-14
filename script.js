// Text-to-Speech functionality
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
    var playingIcons = document.querySelectorAll('.speaker-icon.playing, .question-speaker.playing, .intro-speaker.playing');
    playingIcons.forEach(function(icon) {
        icon.classList.remove('playing');
    });
}

// Progress tracking
let totalQuestions = 32;
let answeredQuestions = 0;

function updateProgress() {
    const answeredInputs = document.querySelectorAll('input[type="radio"]:checked');
    answeredQuestions = answeredInputs.length;
    
    const progressPercent = Math.round((answeredQuestions / totalQuestions) * 100);
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    progressBar.style.width = progressPercent + '%';
    progressText.textContent = progressPercent + '%';

}

// Add event listeners to all radio buttons for progress tracking
document.addEventListener('DOMContentLoaded', function() {
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', updateProgress);
    });
});

// Define categories and their question ranges
const categories = [
    { name: "Workplace and Career Patterns", questions: [1, 2, 3, 4, 5] },
    { name: "Learning and Cognitive Style", questions: [6, 7, 8, 9, 10] },
    { name: "Reading and Language Challenges", questions: [11, 12, 13, 14, 15, 16, 17, 18] },
    { name: "Memory and Information Processing", questions: [19, 20, 21, 22, 23] },
    { name: "Mathematical and Logical Thinking", questions: [24, 25, 26] },
    { name: "Behavioral and Emotional Patterns", questions: [27, 28, 29, 30] },
    { name: "Additional Characteristics", questions: [31, 32] }
];

// Assessment calculation and results
function calculateResults(event) {
    event.preventDefault();
    
    // Validate that all questions are answered
    const unansweredQuestions = [];
    for (let i = 1; i <= totalQuestions; i++) {
        const questionInputs = document.querySelectorAll(`input[name="q${i}"]`);
        const isAnswered = Array.from(questionInputs).some(input => input.checked);
        if (!isAnswered) {
            unansweredQuestions.push(i);
        }
    }
    
    const errorNotification = document.getElementById('errorNotification');
    if (unansweredQuestions.length > 0) {
        errorNotification.classList.add('visible');
        errorNotification.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }
    errorNotification.classList.remove('visible');
    
    // Calculate total score and category scores
    let totalScore = 0;
    const maxScore = totalQuestions * 5; // Maximum possible score
    const categoryScores = [];
    
    // Calculate total score
    for (let i = 1; i <= totalQuestions; i++) {
        const selectedInput = document.querySelector(`input[name="q${i}"]:checked`);
        if (selectedInput) {
            totalScore += parseInt(selectedInput.value);
        }
    }
    
    // Calculate category scores
    categories.forEach(category => {
        let categoryScore = 0;
        let categoryMaxScore = category.questions.length * 5;
        
        category.questions.forEach(questionNum => {
            const selectedInput = document.querySelector(`input[name="q${questionNum}"]:checked`);
            if (selectedInput) {
                categoryScore += parseInt(selectedInput.value);
            }
        });
        
        const categoryPercentage = Math.round((categoryScore / categoryMaxScore) * 100);
        categoryScores.push({
            name: category.name,
            score: categoryScore,
            maxScore: categoryMaxScore,
            percentage: categoryPercentage,
            questionCount: category.questions.length
        });
    });
    
    // Calculate percentage and risk level
    const scorePercentage = Math.round((totalScore / maxScore) * 100);
    let riskLevel, riskClass, resultText;
    
    // Risk assessment based on scoring thresholds
    if (scorePercentage < 51) {
        riskLevel = 'Low Probability';
        riskClass = 'medium';
        resultText = `Your responses suggest a medium probability of dyslexia characteristics. You experience some patterns commonly associated with adult dyslexia. Consider consulting with a qualified professional who specializes in adult learning differences for a comprehensive evaluation and potential support strategies.`;
    } else if (scorePercentage < 80) {
        riskLevel = 'Medium Probability';
        riskClass = 'low';
        resultText = `Your responses suggest a low probability of dyslexia characteristics. Your score indicates that you experience few of the common patterns associated with adult dyslexia. However, if you have specific concerns about learning differences, consider speaking with a professional for personalized guidance.`;
    } else {
        riskLevel = 'High Probability';
        riskClass = 'high';
        resultText = `Your responses suggest a high probability of dyslexia characteristics. You experience many patterns commonly associated with adult dyslexia. We strongly recommend consulting with a qualified professional who specializes in adult learning differences for a comprehensive evaluation, diagnosis, and support plan.`;
    }
    
    // Display results
    const resultsSection = document.getElementById('results');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const probabilityLevel = document.getElementById('probabilityLevel');
    const resultsText = document.getElementById('resultsText');
    
    scoreDisplay.textContent = `${totalScore}/${maxScore} (${scorePercentage}%)`;
    probabilityLevel.textContent = riskLevel;
    probabilityLevel.className = `probability-level ${riskClass}`;
    resultsText.textContent = resultText;
    
    // Display category breakdown
    displayCategoryBreakdown(categoryScores);
    
    // Hide form and show results
    document.getElementById('dyslexiaAssessment').style.display = 'none';
    resultsSection.classList.add('show');
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Save results to localStorage for potential future reference
    const assessmentResults = {
        date: new Date().toISOString(),
        totalScore: totalScore,
        maxScore: maxScore,
        percentage: scorePercentage,
        riskLevel: riskLevel,
        answeredQuestions: totalQuestions
    };
    
    localStorage.setItem('dyslexiaAssessmentResults', JSON.stringify(assessmentResults));
}

// Function to display category breakdown
function displayCategoryBreakdown(categoryScores) {
    const categoryResultsContainer = document.getElementById('categoryResults');
    categoryResultsContainer.innerHTML = '';
    
    categoryScores.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        
        // Determine score level for styling
        let scoreClass = 'low-score';
        let scoreBadgeClass = 'low';
        if (category.percentage >= 70) {
            scoreClass = 'high-score';
            scoreBadgeClass = 'high';
        } else if (category.percentage >= 50) {
            scoreClass = 'medium-score';
            scoreBadgeClass = 'medium';
        }
        
        categoryItem.classList.add(scoreClass);
        
        categoryItem.innerHTML = `
            <div class="category-info">
                <div class="category-name">${category.name}</div>
                <div class="category-details">${category.score} out of ${category.maxScore} points • ${category.questionCount} questions</div>
            </div>
            <div class="category-score ${scoreBadgeClass}">
                ${category.percentage}%
            </div>
        `;
        
        categoryResultsContainer.appendChild(categoryItem);
    });
}

// Reset assessment function
function resetAssessment() {
    // Reset all form inputs
    const form = document.getElementById('dyslexiaAssessment');
    form.reset();
    
    // Reset progress
    answeredQuestions = 0;
    updateProgress();
    
    // Hide results and show form
    document.getElementById('results').classList.remove('show');
    form.style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Stop any playing speech
    if (currentPlayingText) {
        speechSynthesis.cancel();
        removePlayingClass();
        currentPlayingText = null;
        currentUtteranceRef = null;
        iconSpeechActive = false;
    }
}

// Keyboard navigation support
document.addEventListener('keydown', function(event) {
    // Space bar to activate speaker icons
    if (event.code === 'Space' && event.target.closest('.speaker-icon, .question-speaker')) {
        event.preventDefault();
        event.target.click();
    }
    
    // Escape to stop current speech
    if (event.code === 'Escape' && currentPlayingText) {
        speechSynthesis.cancel();
        removePlayingClass();
        currentPlayingText = null;
        currentUtteranceRef = null;
        iconSpeechActive = false;
    }
});

// Handle page visibility change to pause speech when tab is not visible
document.addEventListener('visibilitychange', function() {
    if (document.hidden && currentPlayingText) {
        speechSynthesis.pause();
    } else if (!document.hidden && currentPlayingText && speechSynthesis.paused) {
        speechSynthesis.resume();
    }
});

// Auto-save progress to localStorage
function saveProgress() {
    const formData = new FormData(document.getElementById('dyslexiaAssessment'));
    const progressData = {};
    
    for (let [key, value] of formData.entries()) {
        progressData[key] = value;
    }
    
    localStorage.setItem('dyslexiaAssessmentProgress', JSON.stringify({
        data: progressData,
        timestamp: new Date().toISOString(),
        answeredQuestions: answeredQuestions
    }));
}

// Load saved progress on page load
function loadProgress() {
    const savedProgress = localStorage.getItem('dyslexiaAssessmentProgress');
    if (savedProgress) {
        try {
            const progress = JSON.parse(savedProgress);
            const savedData = progress.data;
            
            // Only load if saved within last 24 hours
            const savedTime = new Date(progress.timestamp);
            const now = new Date();
            const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
                for (let [questionName, value] of Object.entries(savedData)) {
                    const input = document.querySelector(`input[name="${questionName}"][value="${value}"]`);
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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load any saved progress
    loadProgress();
    
    // Add auto-save functionality
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            updateProgress();
            setTimeout(saveProgress, 100); // Small delay to ensure state is updated
        });
    });
    
    // Add focus management for accessibility
    const questions = document.querySelectorAll('.question');
    questions.forEach((question, index) => {
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'group');
        question.setAttribute('aria-labelledby', `question-${index}`);
    });
    
    // Smooth scroll behavior for category navigation
    const categories = document.querySelectorAll('.category-title');
    categories.forEach(category => {
        category.addEventListener('click', function() {
            const firstQuestion = this.parentElement.querySelector('.question');
            if (firstQuestion) {
                firstQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
});

// Analytics and user interaction tracking (for improvement purposes)
function trackInteraction(action, details = {}) {
    // This function can be extended to send analytics data
    // For now, it just logs to console for debugging
    console.log('User interaction:', action, details);
}

// Track when users use text-to-speech
const originalSpeakText = speakText;
speakText = function(text) {
    trackInteraction('text-to-speech-used', { textLength: text.length });
    return originalSpeakText.call(this, text);
};

// Error handling for speech synthesis
window.addEventListener('error', function(event) {
    if (event.error && event.error.message.includes('speechSynthesis')) {
        console.warn('Speech synthesis error:', event.error);
        alert('There was an issue with the text-to-speech feature. Please try again or continue without audio assistance.');
    }
});

// Service Worker registration for offline support (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Register service worker for offline functionality
        // This can be implemented later for offline assessment capability
    });
}

// Fixed header spacer height
function updateSpacerHeight() {
    var header = document.getElementById('siteHeader');
    var spacer = document.getElementById('headerSpacer');
    if (header && spacer) {
        spacer.style.height = header.offsetHeight + 'px';
    }
}
updateSpacerHeight();
window.addEventListener('resize', updateSpacerHeight);

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
