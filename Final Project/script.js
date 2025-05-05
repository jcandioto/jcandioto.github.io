document.addEventListener("DOMContentLoaded", function() {
    
    const faqQuestions = document.querySelectorAll('.faq-question');
  
   
    faqQuestions.forEach(function(question) {
      question.addEventListener('click', function() {
        const answer = this.nextElementSibling; 
        
        // Toggle the display of the answer
        if (answer.style.display === 'block') {
          answer.style.display = 'none'; 
        } else {
          answer.style.display = 'block'; 
        }
      });
    });
  });