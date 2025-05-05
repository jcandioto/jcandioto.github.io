document.addEventListener("DOMContentLoaded", function () {
    const generalInput = document.getElementById("generalTickets");
    const vipInput = document.getElementById("vipTickets");
  
    const generalTotalSpan = document.getElementById("generalTotal");
    const vipTotalSpan = document.getElementById("vipTotal");
    const orderTotalSpan = document.getElementById("orderTotal");
  
    const GENERAL_PRICE = 89;
    const VIP_PRICE = 595;
  
    function updateTotals() {
      const generalCount = parseInt(generalInput.value) || 0;
      const vipCount = parseInt(vipInput.value) || 0;
  
      const generalTotal = generalCount * GENERAL_PRICE;
      const vipTotal = vipCount * VIP_PRICE;
      const orderTotal = generalTotal + vipTotal;
  
      generalTotalSpan.textContent = generalTotal.toLocaleString();
      vipTotalSpan.textContent = vipTotal.toLocaleString();
      orderTotalSpan.textContent = orderTotal.toLocaleString();
    }
  
    generalInput.addEventListener("input", updateTotals);
    vipInput.addEventListener("input", updateTotals);
  });
  